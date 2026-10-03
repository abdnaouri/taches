export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vzrmunzfkftydvgmylvu.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function getAdminClient() {
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

/**
 * Viva.com Webhook verification (GET) and event notification (POST)
 */
export async function GET(req: NextRequest) {
  // Viva.com verifies webhook URLs by sending a GET request with a verification key
  const searchParams = req.nextUrl.searchParams;
  const verificationKey = searchParams.get('verificationKey') || process.env.VIVA_WEBHOOK_VERIFICATION_KEY || '';

  return NextResponse.json({
    Key: verificationKey,
    status: 'Webhook URL verified successfully',
  });
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    // EventTypeId 1796 = Transaction Payment Created (Successful charge)
    const eventType = payload.EventTypeId;
    const eventData = payload.EventData;

    if (!eventData) {
      return NextResponse.json({ success: true, message: 'No event data' });
    }

    const orderCode = eventData.OrderCode?.toString();
    const amountCents = eventData.Amount;
    const customerTrns = eventData.CustomerTrns || ''; // Format: DEP-USERID-TIMESTAMP or TXID
    const transactionId = eventData.TransactionId;

    if (eventType === 1796 && amountCents > 0) {
      const amountEur = Number((amountCents / 100).toFixed(2));
      const amountDH = Math.round(amountEur * 10);
      const supabase = getAdminClient();

      // Extract userId if present in customerTrns
      let userId: string | null = null;
      if (customerTrns.startsWith('DEP-')) {
        const parts = customerTrns.split('-');
        if (parts.length >= 6) {
          // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (5 parts when split by '-', but parts[1..5])
          // CustomerTrns format: DEP-{uuid}-{timestamp}, UUID itself contains 4 dashes
          // Reconstruct UUID from parts[1] through parts[5]
          const potentialUuid = parts.slice(1, 6).join('-');
          const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          if (UUID_REGEX.test(potentialUuid)) {
            userId = potentialUuid;
          }
        }
      }

      if (userId) {
        // Credit the customer's balance
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, balance_available')
          .eq('id', userId)
          .single();

        if (profile) {
          const newBalance = Number(profile.balance_available || 0) + amountEur;
          await supabase
            .from('profiles')
            .update({ balance_available: newBalance })
            .eq('id', userId);
        }

        // Insert or update transaction in Supabase
        await supabase
          .from('transactions')
          .insert({
            user_id: userId,
            type: 'DEPOSIT',
            amount: amountEur,
            currency: 'EUR',
            description: `Recharge Carte Viva Smart Checkout (${amountDH} DH / ${amountEur} €) • Réf: ${transactionId || orderCode}`,
            status: 'COMPLETED',
          });
      }
    }

    return NextResponse.json({ success: true, received: true });
  } catch (err: any) {
    console.error('Error handling Viva webhook:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

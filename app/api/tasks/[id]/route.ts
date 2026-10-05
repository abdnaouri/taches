export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, getAuthenticatedUser } from '@/lib/auth/serverAuth';
import { Task } from '@/types/database';
import {
  sendTaskConfirmationClientNotification,
  sendEscrowReleaseNotification,
} from '@/lib/notificationService';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Task ID is required' }, { status: 400 });
    }

    const supabase = getAdminClient();
    const { data: t, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !t) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    const task: Task = {
      id: t.id,
      title: t.title,
      description: t.description,
      category: t.category,
      subCategory: t.sub_category || undefined,
      city: t.city || 'Casablanca',
      taskMode: t.task_mode || 'single',
      unitPriceDH: t.unit_price_dh ? Number(t.unit_price_dh) : undefined,
      targetExecutionsCount: t.target_executions_count ? Number(t.target_executions_count) : undefined,
      status: t.status,
      reward: Number(t.reward),
      platformFee: Number(t.platform_fee || 0),
      totalBudget: Number(t.total_budget || t.reward),
      timeLimitHours: Number(t.time_limit_hours || 24),
      minLevelRequired: Number(t.min_level_required || 1),
      requiredProofs: t.required_proofs || [],
      applicantsCount: Number(t.applicants_count || 0),
      antiSpamKeyword: t.anti_spam_keyword || undefined,
      clientId: t.client_id || '',
      clientName: t.client_name || 'Client',
      clientAvatar: t.client_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60',
      clientRating: Number(t.client_rating || 5.0),
      clientHireRate: Number(t.client_hire_rate || 100),
      assignedToId: t.assigned_to_id || undefined,
      assignedToName: t.assigned_to_name || undefined,
      assignedAt: t.assigned_at || undefined,
      completedAt: t.completed_at || undefined,
      createdAt: t.created_at,
      settlementProposal: t.settlement_proposal || undefined,
      finalPayoutPercentage: t.final_payout_percentage || undefined,
      finalPerformerAmountDH: t.final_performer_amount_dh || undefined,
      finalClientRefundDH: t.final_client_refund_dh || undefined,
    };

    return NextResponse.json({ success: true, task });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const authResult = await getAuthenticatedUser(req);
    if (!authResult.user) {
      return NextResponse.json(
        { success: false, error: authResult.error || 'Authentification requise.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const supabase = getAdminClient();

    // 1. Fetch current task to verify ownership & permissions
    const { data: existingTask, error: fetchErr } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !existingTask) {
      return NextResponse.json({ success: false, error: 'Mission introuvable.' }, { status: 404 });
    }

    const callerId = authResult.user.id;
    const isClient =
      existingTask.client_id === callerId ||
      (!existingTask.client_id && (authResult.isAdmin || authResult.user.email === 'aero@example.com')) ||
      (existingTask.client_id?.startsWith('cli_') && (authResult.isAdmin || authResult.user.email === 'aero@example.com'));
    const isPerformer = existingTask.assigned_to_id === callerId;
    const isAdmin = authResult.isAdmin;

    if (!isClient && !isPerformer && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Vous n\'avez pas la permission de modifier cette mission.' },
        { status: 403 }
      );
    }

    // Arbitration lock: once in ARBITRATION, only an admin can resolve the dispute
    if (existingTask.status === 'ARBITRATION' && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Cette mission est actuellement en arbitrage officiel Daman. Seule l\'équipe de médiation peut modifier son statut.' },
        { status: 403 }
      );
    }

    const updates: Record<string, any> = {};
    if ((!existingTask.client_id || existingTask.client_id.startsWith('cli_')) && isClient) {
      updates.client_id = callerId;
    }

    // 1. Assignment Authorization & Validation (Workzilla Standard)
    if (body.assignedToId !== undefined) {
      if (!isClient && !isAdmin) {
        return NextResponse.json(
          { success: false, error: 'Seul le donneur d\'ordre peut sélectionner et assigner un prestataire.' },
          { status: 403 }
        );
      }

      if (body.assignedToId === existingTask.client_id) {
        return NextResponse.json(
          { success: false, error: 'Vous ne pouvez pas vous attribuer votre propre mission.' },
          { status: 400 }
        );
      }

      if (existingTask.status !== 'OPEN' && !isAdmin) {
        return NextResponse.json(
          { success: false, error: `Impossible d'attribuer une mission au statut ${existingTask.status}.` },
          { status: 400 }
        );
      }

      updates.assigned_to_id = body.assignedToId;
      if (body.assignedToName !== undefined) updates.assigned_to_name = body.assignedToName;
      updates.assigned_at = body.assignedAt || new Date().toISOString();
      updates.status = 'IN_PROGRESS';
    }

    // 2. Status Transitions Authorization (Strict State Machine)
    if (body.status !== undefined) {
      const targetStatus = body.status;

      if (targetStatus === 'CANCELLED') {
        if (!isClient && !isAdmin) {
          return NextResponse.json(
            { success: false, error: 'Seul le donneur d\'ordre ou un administrateur peut annuler cette mission.' },
            { status: 403 }
          );
        }

        // Workzilla protection: client cannot unilaterally cancel once in progress or review
        if (existingTask.status !== 'OPEN' && !isAdmin) {
          return NextResponse.json(
            {
              success: false,
              error: 'Une mission en cours ou sous vérification ne peut pas être annulée unilatéralement. Veuillez convenir d\'une conciliation ou demander l\'arbitrage Daman.',
            },
            { status: 403 }
          );
        }

        updates.status = 'CANCELLED';
      } else if (targetStatus === 'COMPLETED') {
        if (!isClient && !isAdmin) {
          return NextResponse.json(
            { success: false, error: 'Seul le donneur d\'ordre ou un administrateur peut valider et clôturer la mission.' },
            { status: 403 }
          );
        }

        if (!existingTask.assigned_to_id && !updates.assigned_to_id) {
          return NextResponse.json(
            { success: false, error: 'Impossible de valider une mission sans prestataire assigné.' },
            { status: 400 }
          );
        }

        if (['COMPLETED', 'CANCELLED'].includes(existingTask.status)) {
          return NextResponse.json(
            { success: false, error: `Cette mission est déjà au statut ${existingTask.status}.` },
            { status: 400 }
          );
        }

        // Prevent premature release: deliverable must be submitted before escrow can be unlocked
        if (!['UNDER_REVIEW', 'REVISION_REQUESTED'].includes(existingTask.status) && !isAdmin) {
          return NextResponse.json(
            {
              success: false,
              error: 'Le prestataire doit d\'abord soumettre ses livrables avant que vous puissiez valider et débloquer la rémunération.',
            },
            { status: 400 }
          );
        }

        updates.status = 'COMPLETED';
        updates.completed_at = body.completedAt || new Date().toISOString();
      } else if (targetStatus === 'REVISION_REQUESTED') {
        if (!isClient && !isAdmin) {
          return NextResponse.json(
            { success: false, error: 'Seul le donneur d\'ordre peut demander une retouche sur le livrable.' },
            { status: 403 }
          );
        }

        if (existingTask.status !== 'UNDER_REVIEW' && !isAdmin) {
          return NextResponse.json(
            { success: false, error: 'Une retouche ne peut être demandée que sur un livrable actuellement en vérification.' },
            { status: 400 }
          );
        }

        updates.status = 'REVISION_REQUESTED';
      } else if (targetStatus === 'UNDER_REVIEW') {
        if (!isPerformer && !isAdmin) {
          return NextResponse.json(
            { success: false, error: 'Seul le prestataire assigné peut soumettre un livrable pour vérification.' },
            { status: 403 }
          );
        }

        if (!['IN_PROGRESS', 'REVISION_REQUESTED'].includes(existingTask.status) && !isAdmin) {
          return NextResponse.json(
            { success: false, error: `Impossible de soumettre un livrable pour une mission au statut ${existingTask.status}.` },
            { status: 400 }
          );
        }

        updates.status = 'UNDER_REVIEW';
      } else if (targetStatus === 'ARBITRATION') {
        if (!isClient && !isPerformer && !isAdmin) {
          return NextResponse.json(
            { success: false, error: 'Seuls les participants à la mission peuvent solliciter l\'arbitrage Daman.' },
            { status: 403 }
          );
        }

        if (!['IN_PROGRESS', 'UNDER_REVIEW', 'REVISION_REQUESTED'].includes(existingTask.status) && !isAdmin) {
          return NextResponse.json(
            { success: false, error: 'L\'arbitrage n\'est accessible que pour les missions actives ou en cours de validation.' },
            { status: 400 }
          );
        }

        updates.status = 'ARBITRATION';
      } else if (targetStatus === 'IN_PROGRESS') {
        if (!isClient && !isPerformer && !isAdmin) {
          return NextResponse.json(
            { success: false, error: 'Seuls les participants à la mission peuvent démarrer les travaux.' },
            { status: 403 }
          );
        }

        if (!existingTask.assigned_to_id && !updates.assigned_to_id) {
          return NextResponse.json(
            { success: false, error: 'Impossible de passer au statut en cours sans prestataire assigné.' },
            { status: 400 }
          );
        }

        if (!['OPEN', 'ASSIGNED', 'REVISION_REQUESTED'].includes(existingTask.status) && !isAdmin) {
          return NextResponse.json(
            { success: false, error: `Impossible de passer en cours pour une mission au statut ${existingTask.status}.` },
            { status: 400 }
          );
        }

        updates.status = 'IN_PROGRESS';
      } else if (isAdmin) {
        updates.status = targetStatus;
      } else {
        return NextResponse.json({ success: false, error: 'Transition de statut non autorisée.' }, { status: 403 });
      }
    }

    // Client/Performer/Admin Settlement proposal parameters
    if (isClient || isPerformer || isAdmin) {
      if (body.settlementProposal !== undefined) updates.settlement_proposal = body.settlementProposal;
      if (body.finalPayoutPercentage !== undefined) updates.final_payout_percentage = body.finalPayoutPercentage;
      if (body.finalPerformerAmountDH !== undefined) updates.final_performer_amount_dh = body.finalPerformerAmountDH;
      if (body.finalClientRefundDH !== undefined) updates.final_client_refund_dh = body.finalClientRefundDH;
    }

    let updatePayload: Record<string, any> = { ...updates };
    let updateResult = await supabase
      .from('tasks')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    let patchAttempts = 0;
    while (updateResult.error && patchAttempts < 10) {
      const errMsg = updateResult.error.message || '';
      const match = errMsg.match(/Could not find the '([^']+)' column/i);
      if (match && match[1] && match[1] in updatePayload) {
        const missingCol = match[1];
        console.warn(`Column '${missingCol}' not found in Supabase schema cache for PATCH. Retrying without it...`);
        delete updatePayload[missingCol];
        patchAttempts++;
        updateResult = await supabase
          .from('tasks')
          .update(updatePayload)
          .eq('id', id)
          .select()
          .single();
      } else {
        break;
      }
    }

    const { data, error } = updateResult;

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    // A. Automatic 100% Escrow Refund if Client cancels an OPEN task
    if (updates.status === 'CANCELLED' && existingTask.status === 'OPEN' && existingTask.client_id) {
      const budgetEur = Number(existingTask.total_budget || existingTask.reward);
      const budgetDH = Math.round(budgetEur * 10);

      const { data: clientProf } = await supabase
        .from('profiles')
        .select('balance_available, balance_escrow')
        .eq('id', existingTask.client_id)
        .single();

      if (clientProf) {
        await supabase
          .from('profiles')
          .update({
            balance_escrow: Math.max(0, Number(clientProf.balance_escrow || 0) - budgetEur),
            balance_available: Number(clientProf.balance_available || 0) + budgetEur,
          })
          .eq('id', existingTask.client_id);
      }

      await supabase.from('transactions').insert({
        user_id: existingTask.client_id,
        type: 'REFUND',
        amount: budgetEur,
        currency: 'EUR',
        description: `Remboursement intégral séquestre Daman pour mission annulée #${existingTask.id.slice(0, 8)} (${budgetDH} DH)`,
        status: 'COMPLETED',
      });
    }

    // If status transitioned to COMPLETED, atomically release escrow to performer (or split if settlement)
    if (updates.status === 'COMPLETED' && existingTask.status !== 'COMPLETED' && data.assigned_to_id && data.client_id) {
      const totalRewardEur = Number(data.reward);
      const totalBudgetEur = Number(data.total_budget || totalRewardEur);

      // Support partial settlement percentages (e.g. 50%, 70%)
      const payoutPercentage = Number(data.final_payout_percentage || updates.final_payout_percentage || 100);
      const payoutRatio = Math.max(0.05, Math.min(1, payoutPercentage / 100));

      const grossPerformerEur = Number((totalRewardEur * payoutRatio).toFixed(2));
      const commissionEur = Number((grossPerformerEur * 0.15).toFixed(2));
      const netPerformerEur = Number((grossPerformerEur - commissionEur).toFixed(2));
      const clientRefundEur = Number((totalRewardEur * (1 - payoutRatio)).toFixed(2));

      // 1. Deduct client locked escrow and credit refund if partial settlement
      const { data: clientProf } = await supabase
        .from('profiles')
        .select('balance_available, balance_escrow, customer_total_spent')
        .eq('id', data.client_id)
        .single();

      if (clientProf) {
        const currentEscrow = Number(clientProf.balance_escrow || 0);
        const currentAvail = Number(clientProf.balance_available || 0);
        const newEscrow = Math.max(0, currentEscrow - totalBudgetEur);
        const newAvail = clientRefundEur > 0 ? currentAvail + clientRefundEur : currentAvail;
        const newSpent = Number(clientProf.customer_total_spent || 0) + (totalBudgetEur - clientRefundEur);

        await supabase
          .from('profiles')
          .update({
            balance_escrow: newEscrow,
            balance_available: newAvail,
            customer_total_spent: newSpent,
          })
          .eq('id', data.client_id);
      }

      // If partial settlement refund to client, record transaction
      if (clientRefundEur > 0) {
        await supabase.from('transactions').insert({
          user_id: data.client_id,
          type: 'REFUND',
          amount: clientRefundEur,
          currency: 'EUR',
          description: `Remboursement partiel (${100 - payoutPercentage}%) accord mission #${data.id.slice(0, 8)} (${Math.round(clientRefundEur * 10)} DH)`,
          status: 'COMPLETED',
        });
      }

      // 2. Credit performer available balance & increment stats
      const { data: perfProf } = await supabase
        .from('profiles')
        .select('balance_available, performer_completed_tasks, performer_xp')
        .eq('id', data.assigned_to_id)
        .single();

      if (perfProf) {
        await supabase
          .from('profiles')
          .update({
            balance_available: Number(perfProf.balance_available || 0) + netPerformerEur,
            performer_completed_tasks: Number(perfProf.performer_completed_tasks || 0) + 1,
            performer_xp: Number(perfProf.performer_xp || 0) + 25,
          })
          .eq('id', data.assigned_to_id);
      }

      // 3. Record transactions
      await supabase.from('transactions').insert([
        {
          user_id: data.assigned_to_id,
          type: 'ESCROW_RELEASE',
          amount: grossPerformerEur,
          currency: 'EUR',
          description: `Rémunération ${payoutRatio < 1 ? `partielle (${payoutPercentage}%) ` : ''}pour mission #${data.id.slice(0, 8)} (${Math.round(grossPerformerEur * 10)} DH)`,
          status: 'COMPLETED',
        },
        {
          user_id: data.assigned_to_id,
          type: 'COMMISSION',
          amount: -commissionEur,
          currency: 'EUR',
          description: `Commission de service Tâches.ma (15%)`,
          status: 'COMPLETED',
        }
      ]);

      // 4. Fetch Client & Performer contact profiles for email notifications
      const { data: clientInfo } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', data.client_id)
        .single();

      const { data: perfInfo } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', data.assigned_to_id)
        .single();

      const clientName = clientInfo?.full_name || data.client_name || 'Client';
      const clientEmail = clientInfo?.email;
      const perfName = perfInfo?.full_name || data.assigned_to_name || 'Prestataire';
      const perfEmail = perfInfo?.email;

      const grossDH = Math.round(grossPerformerEur * 10);
      const feeDH = Math.round(commissionEur * 10);
      const netGainDH = Math.round(netPerformerEur * 10);

      // 5. Send Workzilla-style confirmation email to Client (non-blocking)
      if (clientEmail) {
        sendTaskConfirmationClientNotification({
          clientEmail,
          clientName,
          clientUserId: data.client_id,
          contractorName: perfName,
          taskTitle: data.title,
          taskId: data.id,
          amountDH: grossDH,
        }).catch((err) => console.warn('[Notification] Failed to send client confirmation:', err));
      }

      // 6. Send Escrow Release email to Performer (non-blocking)
      if (perfEmail) {
        sendEscrowReleaseNotification({
          recipientEmail: perfEmail,
          recipientName: perfName,
          recipientUserId: data.assigned_to_id,
          clientName,
          taskTitle: data.title,
          taskId: data.id,
          grossRewardDH: grossDH,
          platformFeeDH: feeDH,
          netGainDH,
        }).catch((err) => console.warn('[Notification] Failed to send performer escrow release:', err));
      }
    }

    return NextResponse.json({ success: true, task: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

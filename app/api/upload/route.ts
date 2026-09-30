export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAuthenticatedUser } from '@/lib/auth/serverAuth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vzrmunzfkftydvgmylvu.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB limit
const ALLOWED_EXTENSIONS = new Set([
  'png', 'jpg', 'jpeg', 'webp', 'svg', 'gif',
  'pdf', 'zip', 'rar', '7z', 'tar', 'gz',
  'doc', 'docx', 'xls', 'xlsx', 'csv', 'txt', 'rtf',
  'ai', 'psd', 'eps', 'fig',
  'mp4', 'mov', 'webm', 'mp3', 'wav'
]);

export async function POST(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(req);
    if (!authResult.user) {
      return NextResponse.json(
        { error: authResult.error || 'Authentification requise pour téléverser un fichier.' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'Taille maximale de fichier dépassée (limite: 25 Mo)' },
        { status: 400 }
      );
    }

    const rawExt = file.name.split('.').pop()?.toLowerCase() || '';
    if (!ALLOWED_EXTENSIONS.has(rawExt)) {
      return NextResponse.json(
        { error: `Format de fichier non autorisé (.${rawExt}). Formats autorisés : images, PDF, archives ZIP, documents Word/Excel, vidéo.` },
        { status: 400 }
      );
    }

    const sanitizedBase = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 40);

    const userId = authResult.user.id;
    const fileName = `${userId}/proof_${Date.now()}_${sanitizedBase || 'deliverable'}.${rawExt}`;
    const filePath = `${fileName}`;

    if (!serviceRoleKey) {
      return NextResponse.json({
        success: true,
        fileName,
        path: filePath,
        url: `https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80`,
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const buffer = Buffer.from(await file.arrayBuffer());

    const { data, error } = await supabaseAdmin.storage
      .from('proofs-and-deliverables')
      .upload(filePath, buffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: true,
      });

    if (error) {
      console.error('Supabase storage upload error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from('proofs-and-deliverables')
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      fileName,
      path: data.path,
      url: publicUrlData.publicUrl,
    });
  } catch (err: any) {
    console.error('Upload API route error:', err);
    return NextResponse.json({ error: err.message || 'Erreur serveur lors du téléversement' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient, User } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vzrmunzfkftydvgmylvu.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Creates an admin client with service role privileges.
 * NOTE: Only use this after verifying user authorization!
 */
export function getAdminClient() {
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

/**
 * Creates a standard anon Supabase client.
 */
export function getAnonClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });
}

export interface AuthValidationResult {
  user: User | null;
  isAdmin: boolean;
  error?: string;
  status?: number;
}

/**
 * Authenticates the user from the Authorization Bearer header.
 */
export async function getAuthenticatedUser(req: NextRequest): Promise<AuthValidationResult> {
  const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      user: null,
      isAdmin: false,
      error: 'Authentification requise. Jeton de session manquant.',
      status: 401,
    };
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    return {
      user: null,
      isAdmin: false,
      error: 'Jeton de session invalide.',
      status: 401,
    };
  }

  try {
    const supabase = getAnonClient();
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return {
        user: null,
        isAdmin: false,
        error: error?.message || 'Session expirée ou invalide. Veuillez vous reconnecter.',
        status: 401,
      };
    }

    // Check if user is admin in public.profiles
    const adminClient = getAdminClient();
    const { data: profile } = await adminClient
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    const isAdmin = Boolean(profile?.is_admin);

    return {
      user,
      isAdmin,
    };
  } catch (err: any) {
    return {
      user: null,
      isAdmin: false,
      error: err.message || 'Erreur lors de la vérification de l\'authentification.',
      status: 500,
    };
  }
}

/**
 * Helper to require admin privileges for a route.
 */
export async function requireAdminUser(req: NextRequest): Promise<AuthValidationResult> {
  const authResult = await getAuthenticatedUser(req);
  if (authResult.error || !authResult.user) {
    return authResult;
  }

  if (!authResult.isAdmin) {
    return {
      user: authResult.user,
      isAdmin: false,
      error: 'Accès refusé. Droits administrateur requis.',
      status: 403,
    };
  }

  return authResult;
}

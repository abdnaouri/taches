import { Task, WalletTransaction } from '@/types/database';
import { getAuthHeaders } from '@/lib/supabase';

export interface TasksApiResponse {
  isDbReady: boolean;
  source: string;
  tasks: Task[];
  message?: string;
  error?: string;
}

export interface UploadApiResponse {
  success: boolean;
  url: string;
  fileName?: string;
  error?: string;
}

/**
 * Fetch tasks dynamically from real Supabase API route
 */
export async function fetchDynamicTasks(filters?: { category?: string; status?: string; clientId?: string }): Promise<TasksApiResponse> {
  try {
    const params = new URLSearchParams();
    if (filters?.category) params.set('category', filters.category);
    if (filters?.status) params.set('status', filters.status);
    if (filters?.clientId) params.set('clientId', filters.clientId);

    const headers = await getAuthHeaders(false);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`/api/tasks${query}`, {
      headers,
      cache: 'no-store',
    });
    if (!res.ok) {
      throw new Error(`Tasks fetch failed with HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err: any) {
    console.error('Could not fetch tasks from API:', err.message);
    return {
      isDbReady: false,
      source: 'error',
      tasks: [],
      error: err.message,
    };
  }
}

/**
 * Fetch single task by ID dynamically
 */
export async function fetchDynamicTaskById(taskId: string): Promise<Task | null> {
  try {
    const headers = await getAuthHeaders(false);
    const res = await fetch(`/api/tasks/${taskId}`, {
      headers,
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.task || null;
  } catch (err: any) {
    console.error('Failed to fetch task by ID:', err);
    return null;
  }
}

/**
 * Create a new task dynamically in Supabase
 */
export async function createDynamicTask(task: Omit<Task, 'id' | 'applicantsCount' | 'createdAt'>): Promise<{ success: boolean; task?: Task; error?: string }> {
  try {
    const headers = await getAuthHeaders(true);
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers,
      body: JSON.stringify(task),
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    console.error('Failed to create task in Supabase:', err);
    return {
      success: false,
      error: err.message,
    };
  }
}

/**
 * Update task status dynamically in Supabase
 */
export async function updateDynamicTask(taskId: string, updates: Partial<Task>): Promise<boolean> {
  try {
    const headers = await getAuthHeaders(true);
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(updates),
    });
    return res.ok;
  } catch (err: any) {
    console.error('Failed to update task in Supabase:', err.message);
    return false;
  }
}

/**
 * Submit proof of work and report to Supabase
 */
export async function submitDynamicProof(
  taskId: string,
  performerId: string,
  reportText: string,
  proofUrls: string[]
): Promise<boolean> {
  try {
    const headers = await getAuthHeaders(true);
    const res = await fetch('/api/submissions', {
      method: 'POST',
      headers,
      body: JSON.stringify({ taskId, performerId, reportText, proofUrls }),
    });
    return res.ok;
  } catch (err: any) {
    console.error('Failed to submit proof in Supabase:', err.message);
    return false;
  }
}

/**
 * Upload an image or document file to Supabase Storage bucket 'proofs-and-deliverables'
 */
export async function uploadDynamicProofFile(file: File): Promise<UploadApiResponse> {
  try {
    const authHeaders = await getAuthHeaders(false);
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: authHeaders,
      body: formData,
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Upload failed');
    }

    return data;
  } catch (err: any) {
    console.error('Failed to upload proof to Supabase Storage:', err);
    return {
      success: false,
      url: '',
      error: err.message,
    };
  }
}

/**
 * Fetch wallet transactions from Supabase
 */
export async function fetchDynamicTransactions(userId?: string): Promise<WalletTransaction[]> {
  try {
    const headers = await getAuthHeaders(false);
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    const res = await fetch(`/api/wallet${query}`, {
      headers,
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.transactions || [];
  } catch (err: any) {
    console.error('Failed to fetch transactions from Supabase:', err.message);
    return [];
  }
}

/**
 * Record a wallet transaction in Supabase
 */
export async function recordDynamicTransaction(tx: Omit<WalletTransaction, 'id' | 'createdAt'>): Promise<void> {
  try {
    const headers = await getAuthHeaders(true);
    await fetch('/api/wallet', {
      method: 'POST',
      headers,
      body: JSON.stringify(tx),
    });
  } catch (err: any) {
    console.error('Failed to record transaction in Supabase:', err.message);
  }
}

/**
 * Execute dynamic wallet deposit
 */
export async function executeDynamicDeposit(payload: {
  userId: string;
  amountDH: number;
  depositMethod: string;
  paymentDetails?: any;
}): Promise<{ success: boolean; transaction?: WalletTransaction; error?: string }> {
  try {
    const headers = await getAuthHeaders(true);
    const res = await fetch('/api/wallet/deposit', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err: any) {
    console.error('Failed to execute deposit:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Execute dynamic wallet withdrawal request
 */
export async function executeDynamicWithdrawal(payload: {
  userId: string;
  amountDH: number;
  payoutMethod: string;
  speedTier: string;
  payoutDetails: any;
}): Promise<{ success: boolean; transaction?: WalletTransaction; feeCalculation?: any; error?: string }> {
  try {
    const headers = await getAuthHeaders(true);
    const res = await fetch('/api/wallet/withdraw', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err: any) {
    console.error('Failed to execute withdrawal:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Fetch user profile from backend API
 */
export async function fetchDynamicProfile(userId: string): Promise<any> {
  try {
    const headers = await getAuthHeaders(false);
    const res = await fetch(`/api/profile?userId=${encodeURIComponent(userId)}`, {
      headers,
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.profile || null;
  } catch (err: any) {
    console.error('Failed to fetch profile from API:', err.message);
    return null;
  }
}

/**
 * Update user profile via backend API
 */
export async function updateDynamicProfile(userId: string, updates: any): Promise<boolean> {
  try {
    const headers = await getAuthHeaders(true);
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ userId, ...updates }),
    });
    return res.ok;
  } catch (err: any) {
    console.error('Failed to update profile via API:', err.message);
    return false;
  }
}

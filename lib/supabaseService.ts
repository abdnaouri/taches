import { Task, WalletTransaction } from '@/types/database';

export interface TasksApiResponse {
  isDbReady: boolean;
  source: string;
  tasks: Task[];
  message?: string;
}

export interface UploadApiResponse {
  success: boolean;
  url: string;
  fileName?: string;
  error?: string;
}

/**
 * Fetch tasks dynamically from Supabase API route
 */
export async function fetchDynamicTasks(): Promise<TasksApiResponse> {
  try {
    const res = await fetch('/api/tasks');
    if (!res.ok) {
      throw new Error(`Tasks fetch failed with HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err: any) {
    console.warn('Could not fetch dynamic tasks from Supabase:', err.message);
    return {
      isDbReady: false,
      source: 'offline_fallback',
      tasks: [],
      message: err.message,
    };
  }
}

/**
 * Create a new task dynamically in Supabase
 */
export async function createDynamicTask(task: Omit<Task, 'id' | 'applicantsCount' | 'createdAt'>): Promise<{ success: boolean; task: Task }> {
  try {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    console.error('Failed to create task in Supabase:', err);
    return {
      success: false,
      task: {
        ...task,
        id: `tsk_${Date.now()}`,
        applicantsCount: 0,
        createdAt: 'À l’instant',
      },
    };
  }
}

/**
 * Update task status dynamically in Supabase
 */
export async function updateDynamicTask(taskId: string, updates: Partial<Task>): Promise<boolean> {
  try {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.ok;
  } catch (err: any) {
    console.warn('Failed to update task in Supabase:', err.message);
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
    const res = await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, performerId, reportText, proofUrls }),
    });
    return res.ok;
  } catch (err: any) {
    console.warn('Failed to submit proof in Supabase:', err.message);
    return false;
  }
}

/**
 * Upload an image or document file to Supabase Storage bucket 'proofs-and-deliverables'
 */
export async function uploadDynamicProofFile(file: File): Promise<UploadApiResponse> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
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
export async function fetchDynamicTransactions(): Promise<WalletTransaction[]> {
  try {
    const res = await fetch('/api/wallet');
    if (!res.ok) return [];
    const data = await res.json();
    return data.transactions || [];
  } catch (err: any) {
    console.warn('Failed to fetch transactions from Supabase:', err.message);
    return [];
  }
}

/**
 * Record a wallet transaction in Supabase
 */
export async function recordDynamicTransaction(tx: Omit<WalletTransaction, 'id' | 'createdAt'>): Promise<void> {
  try {
    await fetch('/api/wallet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tx),
    });
  } catch (err: any) {
    console.warn('Failed to record transaction in Supabase:', err.message);
  }
}

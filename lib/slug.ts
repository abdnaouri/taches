import { Task } from '@/types/database';

export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accent marks
    .replace(/[^a-z0-9\s-]/g, '') // remove special chars
    .replace(/[\s_-]+/g, '-') // replace spaces/underscores with single hyphen
    .replace(/^-+|-+$/g, '') // trim leading and trailing hyphens
    .slice(0, 50);
}

export function getTaskSlug(task: Task): string {
  const base = slugify(task.title) || 'mission';
  return `${base}-${task.id}`;
}

export function extractTaskIdFromSlug(slug: string, allTasks: Task[] = []): string | null {
  if (!slug) return null;
  const decoded = decodeURIComponent(slug);

  // 1. Direct ID match
  const direct = allTasks.find(t => t.id === decoded);
  if (direct) return direct.id;

  // 2. Exact suffix match -[taskId]
  const suffixMatch = allTasks.find(t => decoded.endsWith(`-${t.id}`) || decoded === t.id);
  if (suffixMatch) return suffixMatch.id;

  // 3. Match tsk_... identifier pattern
  const tskMatch = decoded.match(/tsk_[a-zA-Z0-9_-]+/);
  if (tskMatch) {
    const found = allTasks.find(t => t.id === tskMatch[0]);
    if (found) return found.id;
    return tskMatch[0];
  }

  // 4. Match UUID identifier pattern
  const uuidMatch = decoded.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  if (uuidMatch) {
    return uuidMatch[0];
  }

  // 5. Fallback: take last part after last hyphen
  const parts = decoded.split('-');
  const lastPart = parts[parts.length - 1];
  const lastMatch = allTasks.find(t => t.id === lastPart);
  if (lastMatch) return lastMatch.id;

  return lastPart || null;
}

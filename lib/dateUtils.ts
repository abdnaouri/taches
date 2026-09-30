/**
 * Human-friendly relative date formatting supporting FR, AR, and EN
 */
export function formatRelativeTime(dateInput?: string | null, locale: string = 'fr'): string {
  if (!dateInput) return '';

  // If it's already a localized human-readable string, return it directly
  if (
    dateInput.includes('Il y a') ||
    dateInput.includes('منذ') ||
    dateInput.includes('ago') ||
    dateInput.includes("À l'instant") ||
    dateInput.includes('الآن')
  ) {
    return dateInput;
  }

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    return dateInput;
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) {
    if (locale === 'ar') return 'الآن';
    if (locale === 'en') return 'Just now';
    return "À l'instant";
  }

  if (diffMinutes < 60) {
    if (locale === 'ar') return `منذ ${diffMinutes} دقيقة`;
    if (locale === 'en') return `${diffMinutes}m ago`;
    return `Il y a ${diffMinutes} min`;
  }

  if (diffHours < 24) {
    if (locale === 'ar') return `منذ ${diffHours} ساعة`;
    if (locale === 'en') return `${diffHours}h ago`;
    return `Il y a ${diffHours}h`;
  }

  if (diffDays === 1) {
    if (locale === 'ar') return 'أمس';
    if (locale === 'en') return 'Yesterday';
    return 'Hier';
  }

  if (diffDays < 7) {
    if (locale === 'ar') return `منذ ${diffDays} أيام`;
    if (locale === 'en') return `${diffDays}d ago`;
    return `Il y a ${diffDays} jours`;
  }

  // Format as short date
  try {
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-MA' : locale === 'en' ? 'en-US' : 'fr-MA', {
      day: 'numeric',
      month: 'short',
    }).format(date);
  } catch {
    return date.toLocaleDateString();
  }
}

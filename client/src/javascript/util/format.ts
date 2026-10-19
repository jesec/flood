/**
 * Format a number using Intl.NumberFormat with the given locale.
 * Replacement for the deprecated i18n.number() from Lingui.
 */
export function formatNumber(locale: string, value: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

/**
 * Format a date using Intl.DateTimeFormat with the given locale.
 * Replacement for the deprecated i18n.date() from Lingui.
 */
export function formatDate(locale: string, value: Date | number, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(locale, options).format(value);
}

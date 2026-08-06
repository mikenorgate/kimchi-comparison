/**
 * Tiny classNames joiner — avoids pulling in clsx/cn for an OS-scale app
 * where most composition is 2-3 strings. Filters falsy values.
 */
export type ClassValue = string | number | false | null | undefined

export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ')
}

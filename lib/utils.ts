// src/lib/utils.ts

/** Format seconds to a human-readable string: 90 → "1 min 30 s" */
export function formatDuration(seconds: number): string {
  if (seconds <= 0) return '0 s'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m === 0) return `${s} s`
  if (s === 0) return `${m} min`
  return `${m} min ${s} s`
}

/** Generate a short unique ID for local DnD items */
export function generateLocalId(): string {
  return `local_${Math.random().toString(36).slice(2, 9)}`
}

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/** Merge class names (simple implementation, no clsx needed) */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * lib/utils.js
 * ─────────────────────────────────────────────────────────────────
 * Shared utility functions used across all modules.
 * ─────────────────────────────────────────────────────────────────
 */

/**
 * Formats an ISO date string to a human-readable date.
 * @param {string} isoDate  e.g. "2024-11-10"
 * @param {'short'|'long'} [format='short']
 * @returns {string}
 */
export function formatDate(isoDate, format = 'short') {
  if (!isoDate) return '—'
  const date = new Date(isoDate + 'T00:00:00')
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: format === 'long' ? 'long' : 'short',
    year: 'numeric',
    ...(format === 'long' && { weekday: 'long' }),
  })
}

/**
 * Formats a 24-hour time string to 12-hour AM/PM.
 * @param {string} time  e.g. "14:30"
 * @returns {string}     e.g. "2:30 PM"
 */
export function formatTime(time) {
  if (!time) return '—'
  const [h, m] = time.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour   = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

/**
 * Truncates a string to the specified max length.
 * @param {string} str
 * @param {number} [maxLength=100]
 * @returns {string}
 */
export function truncate(str, maxLength = 100) {
  if (!str || str.length <= maxLength) return str
  return str.slice(0, maxLength).trimEnd() + '…'
}

/**
 * Generates a simple unique ID (for demo use).
 * Replace with MongoDB ObjectId when integrating DB.
 * @param {string} [prefix='id']
 * @returns {string}
 */
export function generateId(prefix = 'id') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

/**
 * Capitalises the first letter of a string.
 * @param {string} str
 * @returns {string}
 */
export function capitalise(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}


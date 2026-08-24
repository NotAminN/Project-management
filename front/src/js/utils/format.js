// format.js — date, number, and string formatting helpers.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const _now = new Date()
export const TODAY = new Date(2026, _now.getMonth(), _now.getDate())

export function parseDate(d) {
  return d instanceof Date ? d : new Date(d)
}

export function fmtDate(d, opts = {}) {
  const date = parseDate(d)
  const { withYear = false, weekday = false } = opts
  let s = ''
  if (weekday) s += ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()] + ', '
  s += `${MONTHS[date.getMonth()]} ${date.getDate()}`
  if (withYear) s += `, ${date.getFullYear()}`
  return s
}

export function fmtShort(d) {
  const date = parseDate(d)
  return `${MONTHS[date.getMonth()]} ${date.getDate()}`
}

export function fmtTime(d) {
  const date = parseDate(d)
  let h = date.getHours()
  const m = String(date.getMinutes()).padStart(2, '0')
  const ap = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${h}:${m} ${ap}`
}

// Human relative time vs TODAY (e.g. "in 3 days", "2 days ago").
export function fromNow(d) {
  const date = parseDate(d)
  const diff = Math.round((date - TODAY) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  if (diff > 0) return `in ${diff} days`
  return `${Math.abs(diff)} days ago`
}

export function isOverdue(d) {
  return parseDate(d) < startOfDay(TODAY)
}

export function startOfDay(d) {
  const date = parseDate(d)
  date.setHours(0, 0, 0, 0)
  return date
}

export function addDays(d, n) {
  const date = parseDate(d)
  date.setDate(date.getDate() + n)
  return date
}

export function relativeDayLabel(d) {
  const date = startOfDay(d)
  const t = startOfDay(TODAY)
  const diff = Math.round((date - t) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  if (diff > 0 && diff <= 7) return `in ${diff} days`
  if (diff < 0 && diff >= -7) return `${Math.abs(diff)} days ago`
  return fmtDate(d)
}

export function fmtNum(n) {
  return new Intl.NumberFormat('en-US').format(n)
}

export function pct(n) {
  return `${Math.round(n)}%`
}

export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')
}

// Deterministic color from a string (for avatar backgrounds).
const AVATAR_COLORS = [
  '#7186a3', '#879887', '#b99a5b', '#b5615e', '#6e9b7c',
  '#a07d9e', '#5f8a8b', '#c08a5e', '#7a7f9c'
]
export function colorFromString(str = '') {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

export function getTodayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function dayStrFromDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Returns array of 42 cell objects for the calendar grid (Monday-start)
export function buildCalendarCells(year, month) {
  // month is 0-indexed
  const firstOfMonth = new Date(year, month, 1)
  // JS getDay(): 0=Sun, 1=Mon ... 6=Sat
  // We want Monday=0, so shift: (getDay() + 6) % 7
  const startOffset = (firstOfMonth.getDay() + 6) % 7
  const cells = []
  for (let i = 0; i < 42; i++) {
    const dayOffset = i - startOffset
    const d = new Date(year, month, 1 + dayOffset)
    cells.push({
      dayStr: dayStrFromDate(d),
      dayNum: d.getDate(),
      isCurrentMonth: d.getMonth() === month,
    })
  }
  return cells
}

// Returns the first and last day strings needed to cover the 42-cell grid
export function getMonthRangePadded(year, month) {
  const cells = buildCalendarCells(year, month)
  return { start: cells[0].dayStr, end: cells[41].dayStr }
}

const SHORT_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const LONG_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

// "Tue 24 Feb 2026"
export function formatDayHeader(dayStr) {
  const [y, m, d] = dayStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const dayName = SHORT_DAYS[(date.getDay() + 6) % 7]
  return `${dayName} ${d} ${SHORT_MONTHS[m - 1]} ${y}`
}

// "February 2026"
export function getMonthLabel(year, month) {
  return `${LONG_MONTHS[month]} ${year}`
}

// Add n days to a YYYY-MM-DD string, return new YYYY-MM-DD string
export function addDays(dayStr, n) {
  const [y, m, d] = dayStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  date.setDate(date.getDate() + n)
  return dayStrFromDate(date)
}

// Returns array of date strings stepping +7 days from startStr up to and including endStr
export function buildWeeklyDates(startStr, endStr) {
  const dates = []
  let current = startStr
  while (current <= endStr) {
    dates.push(current)
    current = addDays(current, 7)
  }
  return dates
}

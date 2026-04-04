export type DateFilter = 
  | 'all' 
  | 'today' 
  | 'tomorrow' 
  | 'thisWeek' 
  | 'nextWeek' 
  | 'later' 
  | 'past'

export const DATE_FILTER_LABELS: Record<DateFilter, string> = {
  all: 'Todas',
  today: 'Hoje',
  tomorrow: 'Amanhã',
  thisWeek: 'Esta Semana',
  nextWeek: 'Próxima Semana',
  later: 'Futuros',
  past: 'Passados',
}

function getDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getDateFilterRange(filter: DateFilter): { start: string; end: string } | null {
  const today = new Date()
  const todayStr = getDateString(today)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = getDateString(tomorrow)

  const endOfThisWeek = new Date(today)
  endOfThisWeek.setDate(endOfThisWeek.getDate() + (7 - today.getDay()))
  const endOfThisWeekStr = getDateString(endOfThisWeek)

  const startOfNextWeek = new Date(endOfThisWeek)
  startOfNextWeek.setDate(startOfNextWeek.getDate() + 1)
  const startOfNextWeekStr = getDateString(startOfNextWeek)

  const endOfNextWeek = new Date(startOfNextWeek)
  endOfNextWeek.setDate(endOfNextWeek.getDate() + 6)
  const endOfNextWeekStr = getDateString(endOfNextWeek)

  switch (filter) {
    case 'today':
      return { start: todayStr, end: todayStr }
    case 'tomorrow':
      return { start: tomorrowStr, end: tomorrowStr }
    case 'thisWeek':
      return { start: todayStr, end: endOfThisWeekStr }
    case 'nextWeek':
      return { start: startOfNextWeekStr, end: endOfNextWeekStr }
    case 'later':
      return { start: endOfNextWeekStr, end: '2100-12-31' }
    case 'past': {
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = getDateString(yesterday)
      return { start: '1970-01-01', end: yesterdayStr }
    }
    default:
      return null
  }
}

export function matchesDateFilter(eventDate: string, filter: DateFilter): boolean {
  if (!eventDate || filter === 'all') return true

  const range = getDateFilterRange(filter)
  if (!range) return true

  const eventDateStr = eventDate.split('T')[0]

  return eventDateStr >= range.start && eventDateStr <= range.end
}

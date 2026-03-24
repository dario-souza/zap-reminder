export const WEEKDAY_LABELS: Record<number, string> = {
  0: 'Domingo',
  1: 'Segunda-feira',
  2: 'Terça-feira',
  3: 'Quarta-feira',
  4: 'Quinta-feira',
  5: 'Sexta-feira',
  6: 'Sábado',
}

export const WEEKDAY_SHORT: Record<number, string> = {
  0: 'Domingo',
  1: 'Segunda',
  2: 'Terça',
  3: 'Quarta',
  4: 'Quinta',
  5: 'Sexta',
  6: 'Sábado',
}

export function parseCronExpression(cron: string): {
  frequency: 'weekly' | 'monthly'
  dayOfWeek?: number
  dayOfMonth?: number
  hour: number
  minute: number
} | null {
  const parts = cron.trim().split(/\s+/)
  if (parts.length < 5) return null

  const [minute, hour, dayOfMonth, , dayOfWeek] = parts

  if (dayOfMonth !== '*') {
    return {
      frequency: 'monthly',
      dayOfMonth: parseInt(dayOfMonth),
      hour: parseInt(hour),
      minute: parseInt(minute),
    }
  }

  if (dayOfWeek !== '*') {
    return {
      frequency: 'weekly',
      dayOfWeek: parseInt(dayOfWeek),
      hour: parseInt(hour),
      minute: parseInt(minute),
    }
  }

  return null
}

export function formatRecurrenceLabel(recurrenceCron?: string): string {
  if (!recurrenceCron) return ''

  const config = parseCronExpression(recurrenceCron)
  if (!config) return recurrenceCron

  const time = `${String(config.hour).padStart(2, '0')}:${String(config.minute).padStart(2, '0')}`

  if (config.frequency === 'weekly') {
    const dayLabel = WEEKDAY_LABELS[config.dayOfWeek ?? 0] ?? `Dia ${config.dayOfWeek}`
    return `Toda ${dayLabel} às ${time}`
  }

  if (config.frequency === 'monthly') {
    return `Todo dia ${config.dayOfMonth} às ${time}`
  }

  return recurrenceCron
}

export function calculateNextSendAt(recurrenceCron: string): Date | null {
  const config = parseCronExpression(recurrenceCron)
  if (!config) return null

  const now = new Date()
  const targetHour = config.hour
  const targetMinute = config.minute

  const next = new Date(now)
  next.setHours(targetHour, targetMinute, 0, 0)

  if (config.frequency === 'weekly') {
    const targetDay = config.dayOfWeek ?? 0
    const currentDay = next.getDay()
    let daysToAdd = targetDay - currentDay

    if (daysToAdd < 0 || (daysToAdd === 0 && next.getTime() <= now.getTime())) {
      daysToAdd += 7
    }

    next.setDate(next.getDate() + daysToAdd)
  }

  if (config.frequency === 'monthly') {
    const targetDay = config.dayOfMonth ?? 1
    next.setDate(targetDay)

    if (next.getTime() <= now.getTime()) {
      next.setMonth(next.getMonth() + 1)
    }
  }

  if (next.getTime() <= now.getTime()) {
    if (config.frequency === 'weekly') {
      next.setDate(next.getDate() + 7)
    } else if (config.frequency === 'monthly') {
      next.setMonth(next.getMonth() + 1)
    }
  }

  return next
}

export function formatNextSendDate(nextSendAt: string | null | undefined, recurrenceCron?: string): string {
  if (!nextSendAt && !recurrenceCron) return ''

  let date: Date | null = null

  if (nextSendAt) {
    date = new Date(nextSendAt)
  } else if (recurrenceCron) {
    date = calculateNextSendAt(recurrenceCron)
  }

  if (!date) return ''

  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()

  const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  const dateStr = date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  })

  if (isToday) {
    return `Hoje às ${time}`
  }

  return `${dateStr} às ${time}`
}

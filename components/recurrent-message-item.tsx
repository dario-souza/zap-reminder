'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Message, Contact } from '@/types'
import { getChatId } from '@/types'
import { Send, Trash2, Calendar, Repeat, Plus } from 'lucide-react'
import {
  formatRecurrenceLabel,
  formatNextSendDate,
  WEEKDAY_SHORT,
} from '@/lib/recurrence'

interface RecurrentMessageItemProps {
  message: Message
  contact: Contact | null
  onSendNow: (message: Message) => void
  onDelete: (message: Message) => void
  formatDate: (dateStr: string | null | undefined) => string
}

export function RecurrentMessageItem({
  message,
  contact,
  onSendNow,
  onDelete,
  formatDate,
}: RecurrentMessageItemProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Card
      className="border border-slate-200 dark:border-slate-700 mb-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {contact?.name || 'Desconhecido'}
              </span>
              <span className="text-sm text-slate-500">
                ({contact?.phone || message.phone || '-'})
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  message.status === 'pending' || message.status === 'scheduled'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : message.status === 'sent'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}
              >
                {message.status === 'pending' || message.status === 'scheduled'
                  ? 'Pendente'
                  : message.status === 'sent'
                    ? 'Enviada'
                    : 'Cancelada'}
              </span>
              {message.recurrence_type &&
                message.recurrence_type !== 'NONE' && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                    {message.recurrence_type === 'WEEKLY'
                      ? 'Semanal'
                      : 'Mensal'}
                  </span>
                )}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
              {message.content}
            </p>
          </div>
          <div className="flex items-start gap-2 shrink-0">
            {(message.status === 'pending' ||
              message.status === 'scheduled') && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onSendNow(message)}
                className="hover:bg-green-100 dark:hover:bg-green-900/30"
              >
                <Send className="w-4 h-4 text-green-600 dark:text-green-400" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30"
              onClick={() => onDelete(message)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-2 mt-3 p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg w-full">
          <div className="flex items-center gap-2 text-sm">
            <Repeat className="w-4 h-4 text-purple-500" />
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {message.recurrence_cron
                ? formatRecurrenceLabel(message.recurrence_cron)
                : message.recurrence_type === 'WEEKLY' &&
                    message.recurrence_day_of_week !== undefined
                  ? `Toda ${WEEKDAY_SHORT[message.recurrence_day_of_week] ?? `Dia ${message.recurrence_day_of_week}`} às ${String(message.recurrence_hour ?? 9).padStart(2, '0')}:${String(message.recurrence_minute ?? 0).padStart(2, '0')}`
                  : message.recurrence_type === 'MONTHLY' &&
                      message.recurrence_day_of_month !== undefined
                    ? `Todo dia ${message.recurrence_day_of_month} às ${String(message.recurrence_hour ?? 9).padStart(2, '0')}:${String(message.recurrence_minute ?? 0).padStart(2, '0')}`
                    : 'Recorrente'}
            </span>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
            {message.next_send_at && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                <span>
                  Próxima:{' '}
                  {formatNextSendDate(
                    message.next_send_at,
                    message.recurrence_cron,
                  )}
                </span>
              </div>
            )}
            {!message.next_send_at && message.recurrence_cron && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                <span>
                  Próxima: {formatNextSendDate(null, message.recurrence_cron)}
                </span>
              </div>
            )}

            {message.sent_at && (
              <div className="flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-green-500" />
                <span>
                  Última:{' '}
                  {new Date(message.sent_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span>
                Criado:{' '}
                {new Date(message.created_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

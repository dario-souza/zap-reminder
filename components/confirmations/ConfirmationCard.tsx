import { memo } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, User, Trash2, Send, CheckCircle } from 'lucide-react'
import type { Confirmation, ConfirmationMessageStatus, ConfirmationStatus } from '@/types'

const MESSAGE_STATUS_CONFIG: Record<ConfirmationMessageStatus, { label: string; class: string }> = {
  pending: { label: 'Pendente', class: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' },
  queued: { label: 'Na fila', class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  sent: { label: 'Enviada', class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  delivered: { label: 'Entregue', class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  read: { label: 'Lida', class: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
  failed: { label: 'Falhou', class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
}

const CONFIRMATION_STATUS_CONFIG: Record<ConfirmationStatus, { label: string; class: string }> = {
  pending: { label: 'Aguardando', class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  confirmed: { label: 'Confirmado', class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  cancelled: { label: 'Recusado', class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
}

interface MessageStatusBadgeProps {
  status: ConfirmationMessageStatus
}

const MessageStatusBadge = memo(function MessageStatusBadge({ status }: MessageStatusBadgeProps) {
  const c = MESSAGE_STATUS_CONFIG[status] || MESSAGE_STATUS_CONFIG.pending
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.class}`}>{c.label}</span>
})

interface ConfirmationStatusBadgeProps {
  status: ConfirmationStatus
}

const ConfirmationStatusBadge = memo(function ConfirmationStatusBadge({ status }: ConfirmationStatusBadgeProps) {
  const c = CONFIRMATION_STATUS_CONFIG[status] || CONFIRMATION_STATUS_CONFIG.pending
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.class}`}>{c.label}</span>
})

interface ConfirmationCardProps {
  confirmation: Confirmation
  onSendNow: (id: string) => void
  onDelete: (id: string) => void
  isSendingNow: boolean
}

function formatEventDate(d?: string): string {
  if (!d) return '-'
  const [datePart] = d.split('T')
  const [year, month, day] = datePart.split('-')
  return `${day}/${month}/${year}`
}

function formatDateTime(d?: string): string {
  if (!d) return '-'
  const date = new Date(d)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${day}/${month}/${year} ${hour}:${minute}`
}

export const ConfirmationCard = memo(function ConfirmationCard({
  confirmation,
  onSendNow,
  onDelete,
  isSendingNow,
}: ConfirmationCardProps) {
  const canSendNow = confirmation.status === 'pending' && 
    ['pending', 'queued'].includes(confirmation.message_status)

  return (
    <div className="flex items-start justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {confirmation.contact_name}
          </span>
          <span className="text-sm text-slate-500">{confirmation.contact_phone}</span>
        </div>

        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <ConfirmationStatusBadge status={confirmation.status} />
          <MessageStatusBadge status={confirmation.message_status} />
        </div>

        {confirmation.message_content && (
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 italic">
            &ldquo;{confirmation.message_content}&rdquo;
          </p>
        )}

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Evento: {formatEventDate(confirmation.event_date)}
          </span>
          {confirmation.send_at && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Enviar em: {formatDateTime(confirmation.send_at)}
            </span>
          )}
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            Criado: {formatDateTime(confirmation.created_at)}
          </span>
          {confirmation.responded_at && (
            <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <CheckCircle className="w-3 h-3" />
              Respondido: {formatDateTime(confirmation.responded_at)}
              {confirmation.response && ` — "${confirmation.response}"`}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {canSendNow && (
          <Button
            variant="ghost"
            size="icon"
            className="text-green-500"
            onClick={() => onSendNow(confirmation.id)}
            disabled={isSendingNow}
            title="Enviar agora"
          >
            <Send className="w-4 h-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="text-red-500"
          onClick={() => onDelete(confirmation.id)}
          title="Excluir"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
})

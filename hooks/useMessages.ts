import { useState, useEffect, useCallback } from 'react'
import { messagesApi } from '@/lib/api'
import type { Message, CreateMessageDto } from '@/types'

interface UseMessagesReturn {
  messages: Message[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  send: (data: CreateMessageDto) => Promise<Message>
  sendNow: (id: string) => Promise<void>
  schedule: (data: CreateMessageDto & { scheduledAt: string }) => Promise<Message>
  cancel: (id: string) => Promise<void>
}

export function useMessages(): UseMessagesReturn {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await messagesApi.getAll()
      setMessages(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar mensagens')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  const send = async (data: CreateMessageDto): Promise<Message> => {
    const message = await messagesApi.create(data)
    await fetchMessages()
    return message
  }

  const sendNow = async (id: string): Promise<void> => {
    await messagesApi.sendNow(id)
    await fetchMessages()
  }

  const schedule = async (data: CreateMessageDto & { scheduledAt: string }): Promise<Message> => {
    const { scheduledAt, ...rest } = data
    const message = await messagesApi.create({
      ...rest,
      scheduledAt,
    })
    await fetchMessages()
    return message
  }

  const cancel = async (id: string): Promise<void> => {
    await messagesApi.cancel(id)
    await fetchMessages()
  }

  return {
    messages,
    loading,
    error,
    refetch: fetchMessages,
    send,
    sendNow,
    schedule,
    cancel,
  }
}

export function useScheduledMessages() {
  const { messages, loading, error, refetch, sendNow, cancel } = useMessages()
  
  // Mensagens agendadas (com scheduled_at mas ainda não enviadas e não recorrentes)
  const scheduledMessages = messages.filter(
    (m) => 
      (m.status === 'SCHEDULED' || m.status === 'PENDING' || m.status === 'pending') && 
      m.scheduled_at && 
      (!m.recurrence_type || m.recurrence_type === 'NONE')
  )
  
  // Mensagens recorrentes (com recurrence_type diferente de NONE)
  const recurringMessages = messages.filter(
    (m) => m.recurrence_type && m.recurrence_type !== 'NONE' &&
           (m.status === 'SCHEDULED' || m.status === 'PENDING' || m.status === 'pending')
  )
  
  // Mensagens ENVIADAS de agendamentos (foram agendadas e já foram enviadas)
  const sentScheduledMessages = messages.filter(
    (m) => 
      (m.status === 'SENT' || m.status === 'sent') &&
      m.scheduled_at &&
      (!m.recurrence_type || m.recurrence_type === 'NONE')
  )
  
  // Mensagens ENVIADAS de recorrentes (foram recorrentes e já foram enviadas)
  const sentRecurringMessages = messages.filter(
    (m) => 
      (m.status === 'SENT' || m.status === 'sent') &&
      m.recurrence_type && 
      m.recurrence_type !== 'NONE'
  )
  
  // Mensagens canceladas de agendamentos
  const cancelledScheduledMessages = messages.filter(
    (m) => 
      (m.status === 'cancelled' || m.status === 'CANCELLED') &&
      m.scheduled_at &&
      (!m.recurrence_type || m.recurrence_type === 'NONE')
  )

  // Mensagens canceladas de recorrentes
  const cancelledRecurringMessages = messages.filter(
    (m) => 
      (m.status === 'cancelled' || m.status === 'CANCELLED') &&
      m.recurrence_type && 
      m.recurrence_type !== 'NONE'
  )

  return {
    scheduledMessages,
    recurringMessages,
    sentScheduledMessages,
    sentRecurringMessages,
    cancelledScheduledMessages,
    cancelledRecurringMessages,
    totalScheduled: scheduledMessages.length,
    totalRecurring: recurringMessages.length,
    totalSentScheduled: sentScheduledMessages.length,
    totalSentRecurring: sentRecurringMessages.length,
    totalCancelledScheduled: cancelledScheduledMessages.length,
    totalCancelledRecurring: cancelledRecurringMessages.length,
    loading,
    error,
    refetch,
    sendNow,
    cancel,
  }
}

export function useMessageHistory() {
  const { messages, loading, error, refetch } = useMessages()
  
  const sentMessages = messages.filter((m) => m.status === 'SENT' || m.status === 'sent')
  const deliveredMessages = messages.filter((m) => m.status === 'delivered' || m.status === 'DELIVERED')
  const readMessages = messages.filter((m) => m.status === 'read' || m.status === 'READ')
  const failedMessages = messages.filter((m) => m.status === 'failed' || m.status === 'FAILED')

  return {
    sentMessages,
    deliveredMessages,
    readMessages,
    failedMessages,
    totalSent: sentMessages.length,
    totalDelivered: deliveredMessages.length,
    totalRead: readMessages.length,
    totalFailed: failedMessages.length,
    loading,
    error,
    refetch,
  }
}
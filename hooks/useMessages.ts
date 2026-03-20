import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { Message } from '../types'

export const messageKeys = {
  all: ['messages'] as const,
  list: () => [...messageKeys.all, 'list'] as const,
}

export function useMessages() {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: messageKeys.list(),
    queryFn: api.messages.list,
  })

  const createMutation = useMutation({
    mutationFn: api.messages.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.list() })
    },
  })

  const cancelMutation = useMutation({
    mutationFn: api.messages.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.list() })
    },
  })

  const sendNowMutation = useMutation({
    mutationFn: api.messages.sendNow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.list() })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: api.messages.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.list() })
    },
  })

  const deleteAllRecurringMutation = useMutation({
    mutationFn: api.messages.deleteAllRecurring,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.list() })
    },
  })

  return {
    messages: (query.data ?? []) as Message[],
    schedule: createMutation.mutate,
    scheduleAsync: createMutation.mutateAsync,
    send: createMutation.mutate,
    sendAsync: createMutation.mutateAsync,
    cancel: cancelMutation.mutate,
    cancelAsync: cancelMutation.mutateAsync,
    sendNow: sendNowMutation.mutate,
    sendNowAsync: sendNowMutation.mutateAsync,
    delete: deleteMutation.mutate,
    deleteAsync: deleteMutation.mutateAsync,
    deleteAllRecurring: deleteAllRecurringMutation.mutate,
    deleteAllRecurringAsync: deleteAllRecurringMutation.mutateAsync,
    isScheduling: createMutation.isPending,
    isSending: createMutation.isPending,
    isCancelling: cancelMutation.isPending,
    isSendingNow: sendNowMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isDeletingAllRecurring: deleteAllRecurringMutation.isPending,
    ...query,
  }
}

export function useCreateMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.messages.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.list() })
    },
  })
}

export function useCancelMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.messages.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.list() })
    },
  })
}

export function useSendNowMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.messages.sendNow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.list() })
    },
  })
}

export function useSendTestMessage() {
  return useMutation({
    mutationFn: ({ phone, message }: { phone: string; message: string }) =>
      api.messages.sendTest(phone, message),
  })
}

export function useSendBulk() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { content: string; contactIds: string[]; scheduledAt?: string; sendNow?: boolean; recurrenceType?: string }) =>
      api.messages.createBulk(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.list() })
    },
  })
}

export function useScheduledMessages() {
  const queryClient = useQueryClient()
  const { data: messages = [], isLoading, isError, error, refetch } = useMessages()
  
  const scheduledMessages: Message[] = messages.filter(
    (m: Message) =>
      (m.status === 'scheduled' || m.status === 'pending') &&
      m.scheduled_at &&
      (!m.recurrence_type || m.recurrence_type === 'NONE')
  )

  const recurringMessages: Message[] = messages.filter(
    (m: Message) => m.recurrence_type && m.recurrence_type !== 'NONE' &&
           m.status !== 'cancelled'
  )

  const sentScheduledMessages: Message[] = messages.filter(
    (m: Message) =>
      m.status === 'sent' &&
      m.scheduled_at &&
      (!m.recurrence_type || m.recurrence_type === 'NONE')
  )

  const sentRecurringMessages: Message[] = messages.filter(
    (m: Message) =>
      m.status === 'sent' &&
      m.recurrence_type &&
      m.recurrence_type !== 'NONE'
  )

  const cancelledScheduledMessages: Message[] = messages.filter(
    (m: Message) =>
      m.status === 'cancelled' &&
      m.scheduled_at &&
      (!m.recurrence_type || m.recurrence_type === 'NONE')
  )

  const cancelledRecurringMessages: Message[] = messages.filter(
    (m: Message) =>
      m.status === 'cancelled' &&
      m.recurrence_type &&
      m.recurrence_type !== 'NONE'
  )

  const sendNowMutation = useMutation({
    mutationFn: api.messages.sendNow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.list() })
    },
  })

  const cancelMutation = useMutation({
    mutationFn: api.messages.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.list() })
    },
  })

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
    loading: isLoading,
    isLoading,
    isError,
    error,
    refetch,
    sendNow: sendNowMutation.mutate,
    sendNowAsync: sendNowMutation.mutateAsync,
    cancel: cancelMutation.mutate,
    cancelAsync: cancelMutation.mutateAsync,
    isSending: sendNowMutation.isPending,
    isCancelling: cancelMutation.isPending,
  }
}

export function useMessageHistory() {
  const { data: messages = [], isLoading, isError, error, refetch } = useMessages()
  
  const sentMessages: Message[] = messages.filter((m: Message) => m.status === 'sent')
  const deliveredMessages: Message[] = messages.filter((m: Message) => m.status === 'delivered')
  const readMessages: Message[] = messages.filter((m: Message) => m.status === 'read')
  const failedMessages: Message[] = messages.filter((m: Message) => m.status === 'failed')

  return {
    sentMessages,
    deliveredMessages,
    readMessages,
    failedMessages,
    totalSent: sentMessages.length,
    totalDelivered: deliveredMessages.length,
    totalRead: readMessages.length,
    totalFailed: failedMessages.length,
    loading: isLoading,
    isLoading,
    isError,
    error,
    refetch,
  }
}

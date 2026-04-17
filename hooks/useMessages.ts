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
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
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

  const deleteAllScheduledMutation = useMutation({
    mutationFn: api.messages.deleteAllScheduled,
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
    deleteAllScheduled: deleteAllScheduledMutation.mutate,
    deleteAllScheduledAsync: deleteAllScheduledMutation.mutateAsync,
    isScheduling: createMutation.isPending,
    isSending: createMutation.isPending,
    isCancelling: cancelMutation.isPending,
    isSendingNow: sendNowMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isDeletingAllRecurring: deleteAllRecurringMutation.isPending,
    isDeletingAllScheduled: deleteAllScheduledMutation.isPending,
    ...query,
  }
}

export function useScheduledMessages() {
  const queryClient = useQueryClient()
  
  const messagesQuery = useQuery({
    queryKey: messageKeys.list(),
    queryFn: api.messages.list,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
    select: (data: Message[]) => data,
  })

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

  const deleteAllScheduledMutation = useMutation({
    mutationFn: api.messages.deleteAllScheduled,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.list() })
    },
  })

  const messages = (messagesQuery.data ?? []) as Message[]
  
  const scheduledMessages = messages.filter(
    (m) =>
      (m.status === 'scheduled' || m.status === 'pending') &&
      m.scheduled_at &&
      (!m.recurrence_type || m.recurrence_type === 'NONE')
  )

  const recurringMessages = messages.filter(
    (m) => m.recurrence_type && m.recurrence_type !== 'NONE' && m.status !== 'cancelled'
  )

  const sentScheduledMessages = messages.filter(
    (m) =>
      m.status === 'sent' &&
      m.scheduled_at &&
      (!m.recurrence_type || m.recurrence_type === 'NONE')
  )

  const sentRecurringMessages = messages.filter(
    (m) =>
      m.status === 'sent' &&
      m.recurrence_type &&
      m.recurrence_type !== 'NONE'
  )

  const cancelledScheduledMessages = messages.filter(
    (m) =>
      m.status === 'cancelled' &&
      m.scheduled_at &&
      (!m.recurrence_type || m.recurrence_type === 'NONE')
  )

  const cancelledRecurringMessages = messages.filter(
    (m) =>
      m.status === 'cancelled' &&
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
    loading: messagesQuery.isLoading,
    isLoading: messagesQuery.isLoading,
    isError: messagesQuery.isError,
    error: messagesQuery.error,
    refetch: messagesQuery.refetch,
    sendNow: sendNowMutation.mutate,
    sendNowAsync: sendNowMutation.mutateAsync,
    cancel: cancelMutation.mutate,
    cancelAsync: cancelMutation.mutateAsync,
    deleteAllScheduled: deleteAllScheduledMutation.mutate,
    deleteAllScheduledAsync: deleteAllScheduledMutation.mutateAsync,
    isSending: sendNowMutation.isPending,
    isCancelling: cancelMutation.isPending,
    isDeletingAllScheduled: deleteAllScheduledMutation.isPending,
  }
}

export function useMessageHistory() {
  const queryClient = useQueryClient()
  
  const query = useQuery({
    queryKey: messageKeys.list(),
    queryFn: api.messages.list,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
  })

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

  const messages = (query.data ?? []) as Message[]
  
  const sentMessages = messages.filter((m) => m.status === 'sent')
  const deliveredMessages = messages.filter((m) => m.status === 'delivered')
  const readMessages = messages.filter((m) => m.status === 'read')
  const failedMessages = messages.filter((m) => m.status === 'failed')

  return {
    messages,
    sentMessages,
    deliveredMessages,
    readMessages,
    failedMessages,
    totalSent: sentMessages.length,
    totalDelivered: deliveredMessages.length,
    totalRead: readMessages.length,
    totalFailed: failedMessages.length,
    loading: query.isLoading,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    sendNow: sendNowMutation.mutate,
    cancel: cancelMutation.mutate,
    isSending: sendNowMutation.isPending,
    isCancelling: cancelMutation.isPending,
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
    mutationFn: (data: {
      content: string
      contactIds: string[]
      scheduledAt?: string
      sendNow?: boolean
      recurrenceType?: string
    }) => api.messages.createBulk(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.list() })
    },
  })
}
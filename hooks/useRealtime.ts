import { useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { queryClient } from '@/lib/queryClient'
import { messageKeys } from './useMessages'
import { confirmationKeys } from './useConfirmations'

let messagesChannel: ReturnType<typeof supabase.channel> | null = null
let confirmationsChannel: ReturnType<typeof supabase.channel> | null = null
let messagesDebounceTimer: NodeJS.Timeout | null = null
let confirmationsDebounceTimer: NodeJS.Timeout | null = null

export function useMessagesRealtime() {
  const user = useAuthStore((s) => s.user)

  const invalidateMessages = useCallback(() => {
    if (messagesDebounceTimer) {
      clearTimeout(messagesDebounceTimer)
    }
    messagesDebounceTimer = setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: messageKeys.list() })
    }, 500)
  }, [])

  useEffect(() => {
    if (!user) return

    if (messagesChannel) {
      supabase.removeChannel(messagesChannel)
      messagesChannel = null
    }

    messagesChannel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          invalidateMessages()
        }
      )
      .subscribe()

    return () => {
      if (messagesChannel) {
        supabase.removeChannel(messagesChannel)
        messagesChannel = null
      }
      if (messagesDebounceTimer) {
        clearTimeout(messagesDebounceTimer)
      }
    }
  }, [user, invalidateMessages])
}

export function useConfirmationRealtime() {
  const user = useAuthStore((s) => s.user)

  const invalidateConfirmations = useCallback(() => {
    if (confirmationsDebounceTimer) {
      clearTimeout(confirmationsDebounceTimer)
    }
    confirmationsDebounceTimer = setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: confirmationKeys.list() })
    }, 500)
  }, [])

  useEffect(() => {
    if (!user) return

    if (confirmationsChannel) {
      supabase.removeChannel(confirmationsChannel)
      confirmationsChannel = null
    }

    confirmationsChannel = supabase
      .channel('confirmations-realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'confirmations',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          invalidateConfirmations()
        }
      )
      .subscribe()

    return () => {
      if (confirmationsChannel) {
        supabase.removeChannel(confirmationsChannel)
        confirmationsChannel = null
      }
      if (confirmationsDebounceTimer) {
        clearTimeout(confirmationsDebounceTimer)
      }
    }
  }, [user, invalidateConfirmations])
}

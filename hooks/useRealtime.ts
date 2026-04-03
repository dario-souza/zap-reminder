import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { queryClient } from '@/lib/queryClient'
import { messageKeys } from './useMessages'
import { confirmationKeys } from './useConfirmations'

let messagesChannel: ReturnType<typeof supabase.channel> | null = null
let confirmationsChannel: ReturnType<typeof supabase.channel> | null = null

export function useMessagesRealtime() {
  const user = useAuthStore((s) => s.user)

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
          queryClient.invalidateQueries({ queryKey: messageKeys.list() })
        }
      )
      .subscribe()

    return () => {
      if (messagesChannel) {
        supabase.removeChannel(messagesChannel)
        messagesChannel = null
      }
    }
  }, [user])
}

export function useConfirmationRealtime() {
  const user = useAuthStore((s) => s.user)

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
          queryClient.invalidateQueries({ queryKey: confirmationKeys.list() })
        }
      )
      .subscribe()

    return () => {
      if (confirmationsChannel) {
        supabase.removeChannel(confirmationsChannel)
        confirmationsChannel = null
      }
    }
  }, [user])
}

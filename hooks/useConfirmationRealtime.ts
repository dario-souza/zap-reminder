import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { confirmationKeys } from './useConfirmations'

export function useConfirmationRealtime() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  useEffect(() => {
    if (!user) return

    console.log('[Realtime] Configurando canal de confirmações para usuário:', user.id)

    const channel = supabase
      .channel('confirmations-realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'confirmations',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('[Realtime] Confirmação atualizada:', payload)
          queryClient.invalidateQueries({ queryKey: confirmationKeys.list() })
        }
      )
      .subscribe((status, err) => {
        console.log('[Realtime] Status do canal:', status, err)
        if (err) {
          console.error('[Realtime] Erro no canal:', err)
        }
      })

    channelRef.current = channel

    return () => {
      console.log('[Realtime] Removendo canal de confirmações')
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [user, queryClient])
}

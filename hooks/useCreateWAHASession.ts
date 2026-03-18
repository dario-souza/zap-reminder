import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useWAHASessionStore } from '../stores/wahaSessionStore'

export function useCreateWAHASession() {
  const queryClient = useQueryClient()
  const { setSessionName, setStatus, openModal } = useWAHASessionStore()

  return useMutation({
    mutationFn: (sessionName: string) =>
      api.waha.createSession(sessionName),

    onSuccess: (_, sessionName) => {
      setSessionName(sessionName)
      setStatus('STARTING')
      openModal()
      queryClient.setQueryData(['waha-session', sessionName], { sessionName, status: 'STARTING' })
    },
  })
}

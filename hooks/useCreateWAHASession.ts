import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useWAHASessionStore } from '../stores/wahaSessionStore'

interface WAHASession {
  sessionName: string
  status: string
}

export function useCreateWAHASession() {
  const queryClient = useQueryClient()
  const { setSessionName, setStatus, openModal } = useWAHASessionStore()

  return useMutation({
    mutationFn: (sessionName: string) =>
      api.waha.createSession(sessionName) as Promise<WAHASession>,

    onSuccess: (data) => {
      setSessionName(data.sessionName)
      setStatus('STARTING' as any)
      openModal()
      queryClient.setQueryData(['waha-session', data.sessionName], data)
    },
  })
}

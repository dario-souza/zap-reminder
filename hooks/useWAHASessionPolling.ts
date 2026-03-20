import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useWAHASessionStore } from '../stores/wahaSessionStore'

export function useWAHASessionPolling(sessionName: string | null) {
  const { setStatus, closeModal } = useWAHASessionStore()

  const { data, isLoading, error } = useQuery({
    queryKey: ['waha-session-status', sessionName],
    queryFn: () => api.session.status(),
    enabled: !!sessionName,
    refetchInterval: 3000,
  })

  if (data?.status && sessionName) {
    setStatus(data.status as any)

    if (data.status === 'WORKING') {
      closeModal()
    }
  }

  return {
    status: data?.status,
    phone: data?.phone,
    qrCode: data?.qr,
    isLoading,
    error,
  }
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

export const sessionKeys = {
  all: ['session'] as const,
  status: () => [...sessionKeys.all, 'status'] as const,
  qrCode: () => [...sessionKeys.all, 'qrCode'] as const,
}

export function useSessionStatus() {
  return useQuery({
    queryKey: sessionKeys.status(),
    queryFn: api.session.status,
  })
}

export function useSessionQRCode() {
  return useQuery({
    queryKey: sessionKeys.qrCode(),
    queryFn: api.session.qrCode,
    enabled: false,
  })
}

export function useStartSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.session.start,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.status() })
      queryClient.invalidateQueries({ queryKey: sessionKeys.qrCode() })
    },
  })
}

export function useStopSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.session.stop,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.status() })
    },
  })
}

export function useLogoutSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.session.logout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.status() })
      queryClient.invalidateQueries({ queryKey: sessionKeys.qrCode() })
    },
  })
}

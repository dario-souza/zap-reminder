import { useSessionStatus, useSessionQRCode, useStartSession, useStopSession, useLogoutSession } from './useSession'

interface UseWhatsAppReturn {
  status: { connected: boolean; status: string; phone?: string; pushName?: string } | null
  loading: boolean
  error: Error | null
  isConnected: boolean
  isConnecting: boolean
  isWaitingQR: boolean
  refetch: () => Promise<void>
  connect: () => void
  disconnect: () => void
  getQRCode: () => Promise<{ qr?: string; connected?: boolean; status?: string; error?: string }>
}

export function useWhatsApp(): UseWhatsAppReturn {
  const { data: statusData, isLoading, error, refetch: refetchStatus } = useSessionStatus()
  const { data: qrData, refetch: refetchQR, isFetching: isFetchingQR } = useSessionQRCode()
  const startMutation = useStartSession()
  const stopMutation = useStopSession()

  const isConnected = statusData?.status === 'WORKING'
  const isWaitingQR = statusData?.status === 'SCAN_QR_CODE'
  const isConnecting = startMutation.isPending || stopMutation.isPending

  const handleRefetch = async (): Promise<void> => {
    await refetchStatus()
    await refetchQR()
  }

  const handleGetQRCode = async (): Promise<{ qr?: string; connected?: boolean; status?: string; error?: string }> => {
    if (isConnected) {
      return { connected: true, status: 'WORKING' }
    }

    await refetchQR()
    
    if (qrData) {
      return {
        qr: qrData.qr || (qrData as any).value,
        status: qrData.status,
        connected: qrData.connected || false,
      }
    }

    return { error: 'Erro ao obter QR code' }
  }

  return {
    status: statusData ? {
      connected: isConnected,
      status: statusData.status || 'stopped',
      phone: statusData.phone,
      pushName: statusData.pushName,
    } : null,
    loading: isLoading,
    error: error || null,
    isConnected,
    isConnecting,
    isWaitingQR,
    refetch: handleRefetch,
    connect: () => startMutation.mutate(),
    disconnect: () => stopMutation.mutate(),
    getQRCode: handleGetQRCode,
  }
}

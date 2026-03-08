import { useState, useEffect, useCallback } from 'react'
import { messagesApi } from '@/lib/api'
import type { WhatsAppStatus, QRCodeResponse } from '@/types/whatsapp'

interface UseWhatsAppReturn {
  status: WhatsAppStatus | null
  loading: boolean
  error: string | null
  isConnected: boolean
  isConnecting: boolean
  isWaitingQR: boolean
  refetch: () => Promise<void>
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  getQRCode: () => Promise<QRCodeResponse>
}

export function useWhatsApp(): UseWhatsAppReturn {
  const [status, setStatus] = useState<WhatsAppStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isWaitingQR, setIsWaitingQR] = useState(false)

  const fetchStatus = useCallback(async () => {
    try {
      const data = await messagesApi.checkWhatsAppStatus()
      
      if (!data) {
        setStatus({ connected: false, status: 'stopped' })
        return
      }

      const connectedBool = data.connected
      const statusStr = data.status
      
      const isConnected = connectedBool === true || 
                          connectedBool === 'true' || 
                          connectedBool === 'WORKING' ||
                          statusStr === 'WORKING' ||
                          statusStr === 'working'

      const statusValue: WhatsAppStatus = {
        connected: isConnected,
        status: (isConnected ? 'working' : ((statusStr as string)?.toLowerCase() || 'stopped')) as 'failed' | 'stopped' | 'starting' | 'scan_qr_code' | 'working',
        phone: data.phone,
        pushName: data.pushName
      }

      setStatus(statusValue)
      
      if (isConnected) {
        setIsConnecting(false)
        setIsWaitingQR(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao verificar status')
      setStatus({ connected: false, status: 'stopped' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  const connect = async () => {
    setIsConnecting(true)
    setError(null)
    try {
      await messagesApi.startWhatsAppSession()
      await fetchStatus()
      setIsWaitingQR(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao iniciar sessão')
      setIsConnecting(false)
    }
  }

  const disconnect = async () => {
    setLoading(true)
    try {
      await messagesApi.disconnectWhatsApp()
      await fetchStatus()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao desconectar')
    } finally {
      setLoading(false)
    }
  }

  const getQRCode = async (): Promise<QRCodeResponse> => {
    try {
      const data = await messagesApi.getQRCode()
      return data
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Erro ao obter QR Code' }
    }
  }

  return {
    status,
    loading,
    error,
    isConnected: status?.connected || false,
    isConnecting,
    isWaitingQR,
    refetch: fetchStatus,
    connect,
    disconnect,
    getQRCode,
  }
}

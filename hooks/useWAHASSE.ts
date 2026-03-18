import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useWAHASessionStore } from '../stores/wahaSessionStore'

interface QRPayload {
  qr: string
}

interface SessionStatusPayload {
  status: 'STOPPED' | 'STARTING' | 'SCAN_QR_CODE' | 'WORKING' | 'FAILED'
  phone?: string
  pushName?: string
}

async function getSseUrl(sessionName: string): Promise<string> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  return `${baseUrl}/waha/sse/${sessionName}?token=${token}`
}

export function useWAHASSE(sessionName: string | null) {
  const { setQrCode, setStatus, closeModal } = useWAHASessionStore()
  const queryClient = useQueryClient()
  const esRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!sessionName) return

    let es: EventSource

    getSseUrl(sessionName).then((url) => {
      es = new EventSource(url)
      esRef.current = es

      es.addEventListener('qr', (e: MessageEvent) => {
        const { qr } = JSON.parse(e.data) as QRPayload
        setQrCode(qr)
      })

      es.addEventListener('session.status', (e: MessageEvent) => {
        const { status } = JSON.parse(e.data) as SessionStatusPayload
        setStatus(status)

        queryClient.setQueryData(
          ['waha-session', sessionName],
          (old: unknown) => ({ ...(old as object), status })
        )

        if (status === 'WORKING') {
          es.close()
          closeModal()
        }

        if (status === 'FAILED') {
          es.close()
        }
      })

      es.onerror = () => {
        console.warn('[SSE] Instabilidade na conexão, reconectando...')
      }
    })

    return () => {
      esRef.current?.close()
      esRef.current = null
    }
  }, [sessionName, setQrCode, setStatus, closeModal, queryClient])
}

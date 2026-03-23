import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useWAHASessionStore } from '../stores/wahaSessionStore'

export function useWAHASessionStream(sessionName: string | null) {
  const { setQrCode, setStatus, closeModal } = useWAHASessionStore()
  const esRef = useRef<EventSource | null>(null)
  const retryRef = useRef(0)

  useEffect(() => {
    if (!sessionName) return

    retryRef.current = 0

    const connect = async () => {
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token
      if (!token) return

      if (esRef.current) {
        esRef.current.close()
      }

      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/sessions/stream?sessionName=${encodeURIComponent(sessionName)}&token=${encodeURIComponent(token)}`
      const es = new EventSource(url)
      esRef.current = es

      es.addEventListener('connected', () => {
        retryRef.current = 0
      })

      es.addEventListener('qr', (e) => {
        const { qr } = JSON.parse(e.data)
        setQrCode(qr)
        setStatus('SCAN_QR_CODE')
      })

      es.addEventListener('conectado', () => {
        setStatus('WORKING')
        closeModal()
      })

      es.addEventListener('falha', (e) => {
        const { mensagem } = JSON.parse(e.data)
        console.warn('[WAHA] Falha:', mensagem)
        setStatus('FAILED')
      })

      es.addEventListener('erro', () => {
        setStatus('FAILED')
      })
    }

    connect()

    return () => {
      if (esRef.current) {
        esRef.current.close()
        esRef.current = null
      }
    }
  }, [sessionName, setQrCode, setStatus, closeModal])
}

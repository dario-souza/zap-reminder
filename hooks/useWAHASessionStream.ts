import { useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useWAHASessionStore } from '../stores/wahaSessionStore'

const MAX_RETRIES = 5
const BASE_RETRY_DELAY = 1000

export function useWAHASessionStream(sessionName: string | null) {
  const { setQrCode, setStatus, closeModal } = useWAHASessionStore()
  const esRef = useRef<EventSource | null>(null)
  const retryCountRef = useRef(0)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const cleanup = useCallback(() => {
    if (esRef.current) {
      esRef.current.close()
      esRef.current = null
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }
  }, [])

  const connect = useCallback(async () => {
    if (!sessionName) return

    cleanup()

    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token
    if (!token) return

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const url = `${apiUrl}/sessions/stream?sessionName=${encodeURIComponent(sessionName)}&token=${encodeURIComponent(token)}`
    
    const es = new EventSource(url)
    esRef.current = es

    es.addEventListener('connected', () => {
      retryCountRef.current = 0
    })

    es.addEventListener('qr', (e) => {
      try {
        const { qr } = JSON.parse(e.data)
        setQrCode(qr)
        setStatus('SCAN_QR_CODE')
      } catch {
        console.warn('[SSE] Erro ao processar QR event')
      }
    })

    es.addEventListener('conectado', () => {
      setStatus('WORKING')
      closeModal()
      cleanup()
    })

    es.addEventListener('falha', (e) => {
      try {
        const { mensagem } = JSON.parse(e.data)
        console.warn('[WAHA] Falha:', mensagem)
        setStatus('FAILED')
      } catch {
        setStatus('FAILED')
      }
    })

    es.onerror = () => {
      es.close()
      esRef.current = null

      if (retryCountRef.current < MAX_RETRIES) {
        const delay = BASE_RETRY_DELAY * Math.pow(2, retryCountRef.current)
        retryCountRef.current++
        console.log(`[SSE] Reconectando em ${delay}ms (tentativa ${retryCountRef.current}/${MAX_RETRIES})`)
        retryTimeoutRef.current = setTimeout(connect, delay)
      } else {
        console.warn('[SSE] Máximo de tentativas atingido')
        setStatus('FAILED')
      }
    }
  }, [sessionName, setQrCode, setStatus, closeModal, cleanup])

  useEffect(() => {
    if (sessionName) {
      retryCountRef.current = 0
      connect()
    }

    return cleanup
  }, [sessionName, connect, cleanup])
}

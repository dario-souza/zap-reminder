import { useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { useWAHASessionStore } from '../stores/wahaSessionStore'

const MAX_RETRIES = 5
const BASE_RETRY_DELAY = 1000

export function useWAHASessionStream(sessionName: string | null) {
  const { setQrCode, setStatus, closeModal } = useWAHASessionStore()
  const user = useAuthStore((s) => s.user)
  const esRef = useRef<EventSource | null>(null)
  const retryCountRef = useRef(0)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const tokenRef = useRef<string | null>(null)

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

  useEffect(() => {
    if (!user) return

    supabase.auth.getSession().then(({ data }) => {
      tokenRef.current = data.session?.access_token ?? null
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      tokenRef.current = session?.access_token ?? null
    })

    return () => subscription.unsubscribe()
  }, [user])

  const connect = useCallback(async () => {
    if (!sessionName || !tokenRef.current) return

    cleanup()

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const url = `${apiUrl}/sessions/stream?sessionName=${encodeURIComponent(sessionName)}&token=${encodeURIComponent(tokenRef.current!)}`
    
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
    if (sessionName && tokenRef.current) {
      retryCountRef.current = 0
      connect()
    }

    return cleanup
  }, [sessionName, connect, cleanup])
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'

export default function AuthCallback() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const { data, error: authError } =
          await supabase.auth.getSession()

        if (authError) {
          throw authError
        }

        if (data.session) {
          localStorage.setItem('token', data.session.access_token)
          localStorage.setItem('user', JSON.stringify(data.session.user))
          router.push('/dashboard')
        } else {
          // Try to get session from URL hash (Supabase returns it there)
          const hashParams = new URLSearchParams(window.location.hash.substring(1))
          const accessToken = hashParams.get('access_token')
          const refreshToken = hashParams.get('refresh_token')

          if (accessToken && refreshToken) {
            const { data: sessionData, error: sessionError } =
              await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              })

            if (sessionError) {
              throw sessionError
            }

            if (sessionData.session) {
              localStorage.setItem('token', sessionData.session.access_token)
              localStorage.setItem('user', JSON.stringify(sessionData.session.user))
              router.push('/dashboard')
            } else {
              throw new Error('Não foi possível criar a sessão')
            }
          } else {
            throw new Error('Nenhuma sessão encontrada')
          }
        }
      } catch (err: any) {
        console.error('Erro no callback:', err)
        setError(err.message || 'Erro ao processar login')
      }
    }

    handleOAuthCallback()
  }, [router])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erro</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="text-green-600 hover:underline"
          >
            Voltar para página inicial
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-500 mx-auto mb-4" />
        <p className="text-gray-600">Processando login...</p>
      </div>
    </div>
  )
}

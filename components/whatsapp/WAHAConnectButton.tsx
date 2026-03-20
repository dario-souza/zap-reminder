'use client'

import { api } from '@/lib/api'
import { useMutation } from '@tanstack/react-query'
import { useWAHASessionStore } from '@/stores/wahaSessionStore'

interface Props {
  userId: string
}

export function WAHAConnectButton({ userId: _userId }: Props) {
  const { openModal, setStatus } = useWAHASessionStore()

  const { mutate, isPending } = useMutation({
    mutationFn: () => api.session.start(),
    onSuccess: () => {
      setStatus('STARTING')
      openModal()
    },
  })

  return (
    <button
      onClick={() => mutate()}
      disabled={isPending}
      className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
    >
      {isPending ? 'Iniciando...' : 'Conectar WhatsApp'}
    </button>
  )
}

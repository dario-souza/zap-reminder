'use client'

import { useCreateWAHASession } from '../../hooks/useCreateWAHASession'

interface Props {
  userId: string
}

export function WAHAConnectButton({ userId }: Props) {
  const sessionName = `user_${userId.replace(/-/g, '_').substring(0, 40)}`
  const { mutate, isPending } = useCreateWAHASession()

  return (
    <button
      onClick={() => mutate(sessionName)}
      disabled={isPending}
      className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
    >
      {isPending ? 'Iniciando...' : 'Conectar WhatsApp'}
    </button>
  )
}

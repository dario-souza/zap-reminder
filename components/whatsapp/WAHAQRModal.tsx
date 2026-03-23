'use client'

import { useEffect, useState } from 'react'
import { useWAHASessionStore } from '../../stores/wahaSessionStore'
import { useWAHASessionStream } from '../../hooks/useWAHASessionStream'
import { api } from '../../lib/api'
import { X } from 'lucide-react'

const STATUS_LABEL: Record<string, string> = {
  STARTING: 'Iniciando...',
  SCAN_QR_CODE: 'Aguardando leitura',
  WORKING: 'Conectado!',
  FAILED: 'Falha na conexão',
  STOPPED: 'Parado',
}

export function WAHAQRModal() {
  const { isModalOpen, status, qrCode, sessionName, closeModal, reset } =
    useWAHASessionStore()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useWAHASessionStream(sessionName)

  useEffect(() => {
    if (!isModalOpen) {
      setErrorMessage(null)
      return
    }

    const checkStatus = async () => {
      try {
        const data = await api.session.status()
        if (data.status === 'WORKING') {
          closeModal()
        } else if (data.status === 'FAILED') {
          setErrorMessage('Falha na conexão. Tente novamente.')
        }
      } catch (err) {
        // ignorado — SSE cuida do status
      }
    }

    checkStatus()
    const interval = setInterval(checkStatus, 5000)
    return () => clearInterval(interval)
  }, [isModalOpen, closeModal])

  const handleCancel = () => {
    closeModal()
    reset()
  }

  if (!isModalOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-80 rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800">
        <button
          onClick={handleCancel}
          className="absolute right-3 top-3 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-1 text-lg font-medium text-gray-900 dark:text-gray-100">
          Conectar WhatsApp
        </h2>

        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          Status:{' '}
          <span className="font-medium text-gray-800 dark:text-gray-200">
            {STATUS_LABEL[status] ?? status}
          </span>
        </p>

        <div className="flex min-h-56 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-700">
          {errorMessage ? (
            <div className="flex flex-col items-center gap-2 text-sm text-red-500">
              <span>❌</span>
              <span>{errorMessage}</span>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-xs text-blue-500 hover:underline"
              >
                Tentar novamente
              </button>
            </div>
          ) : qrCode ? (
            <img
              src={qrCode}
              alt="QR Code WhatsApp"
              width={208}
              height={208}
              className="rounded"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-sm text-gray-400 dark:text-gray-500">
              <span className="animate-spin text-xl">⏳</span>
              {status === 'SCAN_QR_CODE' ? 'Gerando QR code...' : 'Aguardando...'}
            </div>
          )}
        </div>

        <p className="mt-3 text-center text-xs text-gray-400 dark:text-gray-500">
          WhatsApp → Dispositivos conectados → Conectar dispositivo
        </p>

        <button
          onClick={handleCancel}
          className="mt-4 w-full rounded-lg border border-gray-200 py-2 text-sm text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}

'use client'

import { useEffect } from 'react'
import { useWAHASessionStore } from '../../stores/wahaSessionStore'
import { api } from '../../lib/api'

const STATUS_LABEL: Record<string, string> = {
  STARTING: 'Iniciando...',
  SCAN_QR_CODE: 'Aguardando leitura',
  WORKING: 'Conectado!',
  FAILED: 'Falha na conexão',
  STOPPED: 'Parado',
}

export function WAHAQRModal() {
  const { isModalOpen, sessionName, status, setQrCode, setStatus, closeModal } =
    useWAHASessionStore()

  useEffect(() => {
    if (!isModalOpen || !sessionName) return

    const pollStatus = async () => {
      try {
        const data = await api.waha.getStatus()
        
        if (data.status) {
          setStatus(data.status as any)
          
          if (data.status === 'WORKING') {
            closeModal()
            return
          }
          
          if (data.status === 'FAILED') {
            closeModal()
            return
          }
        }

        if (data.qrCode) {
          setQrCode(data.qrCode)
        }
      } catch (err) {
        console.error('Erro ao buscar status:', err)
      }
    }

    pollStatus()
    
    const interval = setInterval(pollStatus, 3000)

    return () => clearInterval(interval)
  }, [isModalOpen, sessionName, setStatus, setQrCode, closeModal])

  if (!isModalOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-80 rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800">
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
          <div className="flex flex-col items-center gap-2 text-sm text-gray-400 dark:text-gray-500">
            <span className="animate-spin text-xl">⏳</span>
            {status === 'SCAN_QR_CODE' ? 'Aguardando QR code...' : 'Aguardando...'}
          </div>
        </div>

        <p className="mt-3 text-center text-xs text-gray-400 dark:text-gray-500">
          WhatsApp → Dispositivos conectados → Conectar dispositivo
        </p>

        <button
          onClick={closeModal}
          className="mt-4 w-full rounded-lg border border-gray-200 py-2 text-sm text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useRef } from 'react'
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
  const { isModalOpen, status, qrCode, setQrCode, setStatus, closeModal } =
    useWAHASessionStore()

  const retryCountRef = useRef(0)
  const maxRetries = 3

  useEffect(() => {
    if (!isModalOpen) return

    retryCountRef.current = 0

    const pollStatus = async () => {
      try {
        const data = await api.session.status()

        if (data.status) {
          setStatus(data.status as any)

          if (data.status === 'WORKING') {
            retryCountRef.current = 0
            closeModal()
            return
          }

          if (data.status === 'FAILED') {
            retryCountRef.current++
            console.log(`[WAHA] Tentativa de reconexão: ${retryCountRef.current}/${maxRetries}`)

            if (retryCountRef.current < maxRetries) {
              setStatus('STARTING')
              await api.session.start()
            } else {
              retryCountRef.current = 0
              closeModal()
              alert('Não foi possível conectar. Tente novamente mais tarde.')
            }
            return
          }
        }

        if (data.qr) {
          setQrCode(data.qr)
        }
      } catch (err) {
        console.error('Erro ao buscar status:', err)
      }
    }

    const pollQR = async () => {
      try {
        const data = await api.session.qrCode()
        if (data.qr) {
          setQrCode(data.qr)
        }
        if (data.connected) {
          setStatus('WORKING')
          closeModal()
        }
      } catch (err) {
        console.error('Erro ao buscar QR:', err)
      }
    }

    pollStatus()
    pollQR()

    const interval = setInterval(() => {
      pollStatus()
      if (status === 'SCAN_QR_CODE') {
        pollQR()
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [isModalOpen, status, setStatus, setQrCode, closeModal])

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
          {qrCode ? (
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
          onClick={closeModal}
          className="mt-4 w-full rounded-lg border border-gray-200 py-2 text-sm text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}

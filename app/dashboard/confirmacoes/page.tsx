'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { X } from 'lucide-react'
import { useConfirmations } from '@/hooks'
import { useAuthStore } from '@/stores/authStore'
import type { Confirmation } from '@/types'
import type { DateFilter } from '@/lib/dateFilter'
import { matchesDateFilter } from '@/lib/dateFilter'
import {
  ConfirmationFilters,
  ConfirmationStats,
  ConfirmationList,
  ConfirmationForm,
} from '@/components/confirmations'

export default function ConfirmacoesPage() {
  const user = useAuthStore((s) => s.user)
  const { confirmations, isLoading, create, removeAsync, sendNowAsync, isSendingNow, deleteAllAsync } = useConfirmations()

  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState<DateFilter>('all')
  const [showForm, setShowForm] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const filteredConfirmations = useMemo(() => {
    let result = confirmations

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (c) =>
          c.contact_name.toLowerCase().includes(term) ||
          c.contact_phone.includes(term)
      )
    }

    if (dateFilter !== 'all') {
      result = result.filter((c) => matchesDateFilter(c.event_date, dateFilter))
    }

    return result
  }, [confirmations, searchTerm, dateFilter])

  const handleCreate = useCallback(async (data: {
    contactId?: string
    contactName: string
    contactPhone: string
    eventDate: string
    sendAt?: string
    messageContent?: string
    confirmationResponseMessage?: string
    cancellationResponseMessage?: string
  }) => {
    setIsCreating(true)
    setError(null)
    try {
      await create(data)
      setSuccess('Confirmação criada com sucesso!')
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar confirmação')
    } finally {
      setIsCreating(false)
    }
  }, [create])

  const handleDelete = useCallback(async (id: string) => {
    try {
      await removeAsync(id)
      setSuccess('Confirmação excluída.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir')
    }
  }, [removeAsync])

  const handleSendNow = useCallback(async (id: string) => {
    try {
      await sendNowAsync(id)
      setSuccess('Mensagem enviada!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar')
    }
  }, [sendNowAsync])

  const handleDeleteAll = useCallback(async () => {
    try {
      await deleteAllAsync()
      setSuccess('Todas as confirmações foram excluídas.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir')
    }
  }, [deleteAllAsync])

  useEffect(() => {
    if (error || success) {
      const t = setTimeout(() => { setError(null); setSuccess(null) }, 5000)
      return () => clearTimeout(t)
    }
  }, [error, success])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <span className="text-red-700">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-500">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
          <span className="text-green-700">{success}</span>
          <button onClick={() => setSuccess(null)} className="ml-auto text-green-500">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Confirmações</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Agende lembretes de confirmação de presença. O destinatário responde SIM ou NÃO via WhatsApp.
        </p>
      </div>

      <ConfirmationStats confirmations={confirmations} />

      <Card className="border border-slate-200 dark:border-slate-700">
        <CardContent className="p-4 flex flex-col gap-4">
          <ConfirmationFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            dateFilter={dateFilter}
            onDateFilterChange={setDateFilter}
            onNewClick={() => setShowForm(true)}
          />
        </CardContent>
      </Card>

      {showForm && (
        <ConfirmationForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
          isSubmitting={isCreating}
        />
      )}

      <ConfirmationList
        confirmations={filteredConfirmations}
        onSendNow={handleSendNow}
        onDelete={handleDelete}
        onDeleteAll={handleDeleteAll}
        isSendingNow={isSendingNow}
        onNewClick={() => setShowForm(true)}
      />
    </div>
  )
}

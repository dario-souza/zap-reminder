import { useState, useEffect, useCallback } from 'react'
import { confirmationsApi } from '@/lib/api'
import type { Confirmation, CreateConfirmationDto } from '@/types'

interface UseConfirmationsReturn {
  confirmations: Confirmation[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  create: (data: CreateConfirmationDto) => Promise<Confirmation>
  update: (id: string, data: { status: 'CONFIRMED' | 'DENIED'; response?: string }) => Promise<Confirmation>
  remove: (id: string) => Promise<void>
}

export function useConfirmations(): UseConfirmationsReturn {
  const [confirmations, setConfirmations] = useState<Confirmation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchConfirmations = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await confirmationsApi.getAll()
      setConfirmations(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar confirmações')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchConfirmations()
  }, [fetchConfirmations])

  const create = async (data: CreateConfirmationDto): Promise<Confirmation> => {
    const newConfirmation = await confirmationsApi.create(data)
    await fetchConfirmations()
    return newConfirmation
  }

  const update = async (
    id: string,
    data: { status: 'CONFIRMED' | 'DENIED'; response?: string }
  ): Promise<Confirmation> => {
    const updated = await confirmationsApi.update(id, data)
    await fetchConfirmations()
    return updated
  }

  const remove = async (id: string): Promise<void> => {
    await confirmationsApi.delete(id)
    await fetchConfirmations()
  }

  return {
    confirmations,
    loading,
    error,
    refetch: fetchConfirmations,
    create,
    update,
    remove,
  }
}

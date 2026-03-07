import { useState, useEffect, useCallback } from 'react'
import { templatesApi } from '@/lib/api'
import type { Template, CreateTemplateDto, UpdateTemplateDto } from '@/types'

interface UseTemplatesReturn {
  templates: Template[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  create: (data: CreateTemplateDto) => Promise<Template>
  update: (id: string, data: UpdateTemplateDto) => Promise<Template>
  remove: (id: string) => Promise<void>
}

export function useTemplates(): UseTemplatesReturn {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await templatesApi.getAll()
      setTemplates(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar templates')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  const create = async (data: CreateTemplateDto): Promise<Template> => {
    const newTemplate = await templatesApi.create(data)
    await fetchTemplates()
    return newTemplate
  }

  const update = async (id: string, data: UpdateTemplateDto): Promise<Template> => {
    const updated = await templatesApi.update(id, data)
    await fetchTemplates()
    return updated
  }

  const remove = async (id: string): Promise<void> => {
    await templatesApi.delete(id)
    await fetchTemplates()
  }

  return {
    templates,
    loading,
    error,
    refetch: fetchTemplates,
    create,
    update,
    remove,
  }
}

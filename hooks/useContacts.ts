import { useState, useEffect, useCallback } from 'react'
import { contactsApi } from '@/lib/api'
import type { Contact, CreateContactDto, UpdateContactDto } from '@/types'

interface UseContactsReturn {
  contacts: Contact[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  create: (data: CreateContactDto) => Promise<Contact>
  update: (id: string, data: UpdateContactDto) => Promise<Contact>
  remove: (id: string) => Promise<void>
}

export function useContacts(): UseContactsReturn {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await contactsApi.getAll()
      setContacts(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar contatos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  const create = async (data: CreateContactDto): Promise<Contact> => {
    const newContact = await contactsApi.create(data)
    await fetchContacts()
    return newContact
  }

  const update = async (id: string, data: UpdateContactDto): Promise<Contact> => {
    const updated = await contactsApi.update(id, data)
    await fetchContacts()
    return updated
  }

  const remove = async (id: string): Promise<void> => {
    await contactsApi.delete(id)
    await fetchContacts()
  }

  return {
    contacts,
    loading,
    error,
    refetch: fetchContacts,
    create,
    update,
    remove,
  }
}

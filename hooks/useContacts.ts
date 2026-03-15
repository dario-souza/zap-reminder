import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { Contact } from '../types'

export const contactKeys = {
  all: ['contacts'] as const,
  list: () => [...contactKeys.all, 'list'] as const,
}

export function useContacts() {
  const queryClient = useQueryClient()
  
  const query = useQuery({
    queryKey: contactKeys.list(),
    queryFn: api.contacts.list,
  })

  const createMutation = useMutation({
    mutationFn: api.contacts.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.list() })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.contacts.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.list() })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: api.contacts.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.list() })
    },
  })

  return {
    contacts: (query.data ?? []) as Contact[],
    create: createMutation.mutate,
    createAsync: createMutation.mutateAsync,
    update: updateMutation.mutate,
    updateAsync: updateMutation.mutateAsync,
    remove: deleteMutation.mutate,
    removeAsync: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isRemoving: deleteMutation.isPending,
    ...query,
  }
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { Confirmation } from '../types'

export const confirmationKeys = {
  all: ['confirmations'] as const,
  list: () => [...confirmationKeys.all, 'list'] as const,
}

export function useConfirmations() {
  const queryClient = useQueryClient()
  
  const query = useQuery({
    queryKey: confirmationKeys.list(),
    queryFn: api.confirmations.list,
  })

  const createMutation = useMutation({
    mutationFn: api.confirmations.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: confirmationKeys.list() })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.confirmations.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: confirmationKeys.list() })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: api.confirmations.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: confirmationKeys.list() })
    },
  })

  return {
    confirmations: (query.data ?? []) as Confirmation[],
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

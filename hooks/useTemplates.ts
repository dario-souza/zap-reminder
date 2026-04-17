import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { Template } from '../types'

export const templateKeys = {
  all: ['templates'] as const,
  list: () => [...templateKeys.all, 'list'] as const,
}

export function useTemplates() {
  const queryClient = useQueryClient()
  
  const query = useQuery({
    queryKey: templateKeys.list(),
    queryFn: api.templates.list,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
  })

  const createMutation = useMutation({
    mutationFn: api.templates.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.list() })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.templates.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.list() })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: api.templates.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.list() })
    },
  })

  return {
    templates: (query.data ?? []) as Template[],
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

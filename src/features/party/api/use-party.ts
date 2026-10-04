import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchParties, fetchPartyById, createParty, updateParty, type PartyListParams } from './party-service'
import type { Party } from '@/types/party'

export const partyKeys = {
  all: ['parties'] as const,
  list: (params: PartyListParams) => [...partyKeys.all, 'list', params] as const,
  detail: (id: string | number) => [...partyKeys.all, 'detail', id] as const,
}

export function useParties(params: PartyListParams) {
  return useQuery({
    queryKey: partyKeys.list(params),
    queryFn: () => fetchParties(params),
    placeholderData: (prev) => prev,
  })
}

export function useParty(id: string | number) {
  return useQuery({
    queryKey: partyKeys.detail(id),
    queryFn: () => fetchPartyById(id),
    enabled: !!id,
  })
}

export function useCreateParty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Omit<Party, 'id'>) => createParty(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partyKeys.all })
    },
  })
}

export function useUpdateParty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: Omit<Party, 'id'> }) => updateParty(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partyKeys.all })
    },
  })
}

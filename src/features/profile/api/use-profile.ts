import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createTransporterProfile,
  deleteTransporterLogo,
  fetchDailyServices,
  fetchTransporterProfile,
  updateTransporterProfile,
} from './profile-service'

export const profileKeys = {
  all: ['transporter-profile'] as const,
  dailyServices: ['daily-services'] as const,
}

export function useProfile() {
  return useQuery({
    queryKey: profileKeys.all,
    queryFn: fetchTransporterProfile,
  })
}

export function useDailyServices() {
  return useQuery({
    queryKey: profileKeys.dailyServices,
    queryFn: fetchDailyServices,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id?: string; payload: Record<string, unknown> }) =>
      id ? updateTransporterProfile(id, payload) : createTransporterProfile(payload),
    onSuccess: (profile) => {
      queryClient.setQueryData(profileKeys.all, profile)
    },
  })
}

export function useDeleteLogo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, documents }: { id: string; documents: Parameters<typeof deleteTransporterLogo>[1] }) =>
      deleteTransporterLogo(id, documents),
    onSuccess: (profile) => {
      queryClient.setQueryData(profileKeys.all, profile)
    },
  })
}

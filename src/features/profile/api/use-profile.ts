import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchTransporterProfile, updateTransporterProfile, deleteTransporterLogo } from './profile-service'

export const profileKeys = {
  all: ['transporter-profile'] as const,
}

export function useProfile() {
  return useQuery({
    queryKey: profileKeys.all,
    queryFn: fetchTransporterProfile,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: FormData) => updateTransporterProfile(payload),
    onSuccess: (profile) => {
      queryClient.setQueryData(profileKeys.all, profile)
    },
  })
}

export function useDeleteLogo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => deleteTransporterLogo(),
    onSuccess: (profile) => {
      queryClient.setQueryData(profileKeys.all, profile)
    },
  })
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchTrucks, fetchTruckById, createTruck, updateTruck, type TruckListParams } from './truck-service'
import type { Truck } from '@/types/truck'

export const truckKeys = {
  all: ['trucks'] as const,
  list: (params: TruckListParams) => [...truckKeys.all, 'list', params] as const,
  detail: (id: string | number) => [...truckKeys.all, 'detail', id] as const,
}

export function useTrucks(params: TruckListParams) {
  return useQuery({
    queryKey: truckKeys.list(params),
    queryFn: () => fetchTrucks(params),
    placeholderData: (prev) => prev,
  })
}

export function useTruck(id: string | number) {
  return useQuery({
    queryKey: truckKeys.detail(id),
    queryFn: () => fetchTruckById(id),
    enabled: !!id,
  })
}

export function useCreateTruck() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Omit<Truck, 'id'>) => createTruck(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: truckKeys.all })
    },
  })
}

export function useUpdateTruck() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: Omit<Truck, 'id'> }) => updateTruck(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: truckKeys.all })
    },
  })
}

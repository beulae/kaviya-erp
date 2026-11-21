export type TruckOwnership = 'own' | 'market'

export interface Truck {
  id: number | string
  vehicleType: TruckOwnership
  vehicleNumber: string
  driverName?: string
  driverMobile?: string
  driverDlNumber?: string
}

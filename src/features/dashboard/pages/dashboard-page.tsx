import { FileText, Truck, PackageCheck, IndianRupee, ClipboardList, Wallet } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { StatCard } from '@/components/ui/stat-card'
import { RevenueChart } from '../components/revenue-chart'
import { TripStatusChart } from '../components/trip-status-chart'
import { RecentBiltiesCard } from '../components/recent-bilties-card'
import { formatCurrency } from '@/utils/format'

export default function DashboardPage() {
  return (
    <div>
      <PageHeader title="Dashboard" description="Today's snapshot across bookings, fleet and payments." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Today's Booking"
          value="32"
          icon={ClipboardList}
          trend={{ value: '+12%', direction: 'up' }}
          accent="blue"
        />
        <StatCard
          label="Total Bilties"
          value="1,245"
          icon={FileText}
          trend={{ value: '+18%', direction: 'up' }}
          accent="green"
        />
        <StatCard
          label="Vehicles Running"
          value="24"
          icon={Truck}
          trend={{ value: '+3%', direction: 'up' }}
          accent="blue"
        />
        <StatCard
          label="Delivered Today"
          value="18"
          icon={PackageCheck}
          trend={{ value: '+8%', direction: 'up' }}
          accent="green"
        />
        <StatCard
          label="Monthly Revenue"
          value={formatCurrency(1875000)}
          icon={IndianRupee}
          trend={{ value: '+20%', direction: 'up' }}
          accent="navy"
        />
        <StatCard
          label="Pending Payments"
          value={formatCurrency(245000)}
          icon={Wallet}
          trend={{ value: '-5%', direction: 'down' }}
          accent="amber"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <RevenueChart />
        <TripStatusChart />
      </div>

      <div className="mt-6">
        <RecentBiltiesCard />
      </div>
    </div>
  )
}

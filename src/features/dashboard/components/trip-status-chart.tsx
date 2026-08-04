import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

const data = [
  { name: 'Delivered', value: 747, color: 'var(--color-success)' },
  { name: 'In Transit', value: 249, color: 'var(--color-info)' },
  { name: 'Pending', value: 187, color: 'var(--color-warning)' },
  { name: 'Cancelled', value: 62, color: 'var(--color-danger)' },
]

const total = data.reduce((sum, d) => sum + d.value, 0)

export function TripStatusChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bilties by status</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={2}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={
                ((value: number, name: string) => [`${value} (${((value / total) * 100).toFixed(0)}%)`, name]) as any
              }
              contentStyle={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 10,
                fontSize: 12,
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: 12, color: 'var(--color-muted-foreground)' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

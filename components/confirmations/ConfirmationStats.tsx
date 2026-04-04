import { Card, CardContent } from '@/components/ui/card'
import { HelpCircle, Check, X } from 'lucide-react'
import type { Confirmation } from '@/types'

interface ConfirmationStatsProps {
  confirmations: Confirmation[]
}

interface StatCardProps {
  count: number
  label: string
  icon: React.ReactNode
  bgClass: string
  iconClass: string
}

function StatCard({ count, label, icon, bgClass, iconClass }: StatCardProps) {
  return (
    <Card className="border border-slate-200 dark:border-slate-700">
      <CardContent className="p-4 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${bgClass}`}>
          <div className={iconClass}>{icon}</div>
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{count}</p>
          <p className="text-sm text-slate-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export function ConfirmationStats({ confirmations }: ConfirmationStatsProps) {
  const pendingCount = confirmations.filter((c) => c.status === 'pending').length
  const confirmedCount = confirmations.filter((c) => c.status === 'confirmed').length
  const cancelledCount = confirmations.filter((c) => c.status === 'cancelled').length

  return (
    <div className="grid grid-cols-3 gap-4">
      <StatCard
        count={pendingCount}
        label="Aguardando resposta"
        icon={<HelpCircle className="w-6 h-6" />}
        bgClass="bg-yellow-100 dark:bg-yellow-900/30"
        iconClass="text-yellow-500"
      />
      <StatCard
        count={confirmedCount}
        label="Confirmados"
        icon={<Check className="w-6 h-6" />}
        bgClass="bg-green-100 dark:bg-green-900/30"
        iconClass="text-green-500"
      />
      <StatCard
        count={cancelledCount}
        label="Recusados"
        icon={<X className="w-6 h-6" />}
        bgClass="bg-red-100 dark:bg-red-900/30"
        iconClass="text-red-500"
      />
    </div>
  )
}

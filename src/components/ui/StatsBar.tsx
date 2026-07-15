import { Badge } from './Badge'

interface StatsBarProps {
  total: number
  completed: number
  pending: number
}

export const StatsBar = ({ total, completed, pending }: StatsBarProps) => {
  const percentComplete = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-text-secondary">Total</span>
          <Badge className="text-base font-semibold">{total}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-text-secondary">Completed</span>
          <Badge variant="success" className="text-base font-semibold">{completed}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-text-secondary">Remaining</span>
          <Badge variant="warning" className="text-base font-semibold">{pending}</Badge>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-surface-elevated rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${percentComplete}%` }}
            role="progressbar"
            aria-valuenow={percentComplete}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        <span className="text-sm font-medium w-12 text-right">{percentComplete}%</span>
      </div>
    </div>
  )
}
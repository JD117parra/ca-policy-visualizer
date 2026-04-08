import { Handle, Position, type NodeProps } from 'reactflow'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface PolicyNodeData {
  displayName: string
  state: string
}

const stateConfig: Record<string, { label: string; variant: 'success' | 'destructive' | 'warning' }> = {
  enabled: { label: 'Enabled', variant: 'success' },
  disabled: { label: 'Disabled', variant: 'destructive' },
  enabledForReportingButNotEnforced: { label: 'Report-only', variant: 'warning' },
}

export function PolicyNode({ data }: NodeProps<PolicyNodeData>) {
  const config = stateConfig[data.state] ?? { label: data.state, variant: 'warning' as const }

  return (
    <div
      className={cn(
        'rounded-lg border-2 bg-card px-4 py-3 shadow-md min-w-[200px] max-w-[260px]',
        data.state === 'enabled' && 'border-emerald-500',
        data.state === 'disabled' && 'border-destructive/50',
        data.state === 'enabledForReportingButNotEnforced' && 'border-amber-500',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold leading-tight text-card-foreground truncate">
          {data.displayName}
        </p>
        <Badge variant={config.variant} className="shrink-0 text-[10px]">
          {config.label}
        </Badge>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-primary !w-2 !h-2" />
    </div>
  )
}

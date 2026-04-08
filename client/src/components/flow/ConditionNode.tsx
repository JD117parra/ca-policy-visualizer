import { Handle, Position, type NodeProps } from 'reactflow'
import { cn } from '@/lib/utils'

export interface ConditionNodeData {
  label: string
  items: string[]
  category: 'users' | 'applications' | 'platforms' | 'locations' | 'risk' | 'clientApps'
}

const categoryStyles: Record<ConditionNodeData['category'], string> = {
  users: 'border-blue-400 bg-blue-50 dark:bg-blue-950',
  applications: 'border-violet-400 bg-violet-50 dark:bg-violet-950',
  platforms: 'border-cyan-400 bg-cyan-50 dark:bg-cyan-950',
  locations: 'border-orange-400 bg-orange-50 dark:bg-orange-950',
  risk: 'border-red-400 bg-red-50 dark:bg-red-950',
  clientApps: 'border-slate-400 bg-slate-50 dark:bg-slate-950',
}

export function ConditionNode({ data }: NodeProps<ConditionNodeData>) {
  return (
    <div
      className={cn(
        'rounded-md border px-3 py-2 shadow-sm min-w-[160px] max-w-[220px]',
        categoryStyles[data.category],
      )}
    >
      <Handle type="target" position={Position.Top} className="!bg-muted-foreground !w-2 !h-2" />
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
        {data.label}
      </p>
      <ul className="space-y-0.5">
        {data.items.slice(0, 5).map((item) => (
          <li key={item} className="text-xs text-foreground truncate">{item}</li>
        ))}
        {data.items.length > 5 && (
          <li className="text-xs text-muted-foreground">+{data.items.length - 5} more</li>
        )}
      </ul>
      <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground !w-2 !h-2" />
    </div>
  )
}

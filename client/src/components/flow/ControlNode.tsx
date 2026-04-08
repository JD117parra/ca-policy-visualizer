import { Handle, Position, type NodeProps } from 'reactflow'
import { cn } from '@/lib/utils'

export interface ControlNodeData {
  label: string
  items: string[]
  operator?: 'AND' | 'OR'
  kind: 'grant' | 'session'
}

export function ControlNode({ data }: NodeProps<ControlNodeData>) {
  return (
    <div
      className={cn(
        'rounded-md border px-3 py-2 shadow-sm min-w-[160px] max-w-[220px]',
        data.kind === 'grant'
          ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950'
          : 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950',
      )}
    >
      <Handle type="target" position={Position.Top} className="!bg-muted-foreground !w-2 !h-2" />
      <div className="flex items-center gap-1.5 mb-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {data.label}
        </p>
        {data.operator && (
          <span className="text-[10px] font-mono bg-background/80 border rounded px-1">
            {data.operator}
          </span>
        )}
      </div>
      <ul className="space-y-0.5">
        {data.items.map((item) => (
          <li key={item} className="text-xs text-foreground truncate">{item}</li>
        ))}
      </ul>
    </div>
  )
}

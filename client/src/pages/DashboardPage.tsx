import { useCallback } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useMsal } from '@azure/msal-react'
import { useConditionalAccessPolicies } from '@/hooks/useConditionalAccessPolicies'
import type { ConditionalAccessPolicy } from '@/types/policy'

// Maps each policy to a React Flow node, laid out in a horizontal grid
function policiesToNodes(policies: ConditionalAccessPolicy[]): Node[] {
  return policies.map((policy, index) => ({
    id: policy.id,
    type: 'default',
    position: { x: index * 280, y: 100 },
    data: {
      label: (
        <div className="text-left p-1">
          <p className="font-semibold text-sm truncate max-w-[200px]">{policy.displayName}</p>
          <p className="text-xs text-muted-foreground capitalize">{policy.state}</p>
        </div>
      ),
    },
  }))
}

export default function DashboardPage() {
  const { instance, accounts } = useMsal()
  const { policies, isLoading, error, refetch } = useConditionalAccessPolicies()

  const handleLogout = useCallback(() => {
    instance.logoutPopup().catch(console.error)
  }, [instance])

  const nodes: Node[] = policiesToNodes(policies)
  const edges: Edge[] = []

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h1 className="text-xl font-bold">CA Policy Visualizer</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {accounts[0]?.username ?? ''}
          </span>
          <button
            onClick={refetch}
            className="px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-md hover:opacity-90 transition-opacity"
          >
            Refresh
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-sm bg-destructive text-destructive-foreground rounded-md hover:opacity-90 transition-opacity"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Status bar */}
      {isLoading && (
        <div className="px-6 py-2 bg-muted text-muted-foreground text-sm">
          Loading policies...
        </div>
      )}
      {error && (
        <div className="px-6 py-2 bg-destructive/10 text-destructive text-sm">
          Error: {error}
        </div>
      )}

      {/* React Flow canvas */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          attributionPosition="bottom-right"
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  )
}

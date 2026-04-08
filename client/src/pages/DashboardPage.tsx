import { useCallback, useMemo } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useMsal } from '@azure/msal-react'
import { useConditionalAccessPolicies } from '@/hooks/useConditionalAccessPolicies'
import { policiesToGraph } from '@/lib/policyToGraph'
import { applyDagreLayout } from '@/lib/layoutGraph'
import { nodeTypes } from '@/components/flow/nodeTypes'

export default function DashboardPage() {
  const { instance, accounts } = useMsal()
  const { policies, isLoading, error, refetch } = useConditionalAccessPolicies()

  const handleLogout = useCallback(() => {
    instance.logoutPopup().catch(console.error)
  }, [instance])

  const { nodes, edges } = useMemo(() => {
    if (policies.length === 0) return { nodes: [], edges: [] }
    const graph = policiesToGraph(policies)
    const layoutNodes = applyDagreLayout(graph.nodes, graph.edges)
    return { nodes: layoutNodes, edges: graph.edges }
  }, [policies])

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">CA Policy Visualizer</h1>
          {policies.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {policies.length} {policies.length === 1 ? 'policy' : 'policies'}
            </span>
          )}
        </div>
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
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          attributionPosition="bottom-right"
          proOptions={{ hideAttribution: true }}
        >
          <Background />
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              if (node.type === 'policy') return 'hsl(var(--primary))'
              if (node.type === 'condition') return 'hsl(var(--secondary))'
              return 'hsl(var(--accent))'
            }}
          />
        </ReactFlow>
      </div>
    </div>
  )
}

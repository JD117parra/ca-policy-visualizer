import { useCallback, useMemo, useState } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type NodeMouseHandler,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useMsal } from '@azure/msal-react'
import { useConditionalAccessPolicies } from '@/hooks/useConditionalAccessPolicies'
import { policiesToGraph } from '@/lib/policyToGraph'
import { applyDagreLayout } from '@/lib/layoutGraph'
import { nodeTypes } from '@/components/flow/nodeTypes'
import { PolicyDetailPanel } from '@/components/PolicyDetailPanel'
import type { ConditionalAccessPolicy } from '@/types/policy'

export default function DashboardPage() {
  const { instance, accounts } = useMsal()
  const { policies, isLoading, error, refetch } = useConditionalAccessPolicies()
  const [selectedPolicy, setSelectedPolicy] = useState<ConditionalAccessPolicy | null>(null)

  const handleLogout = useCallback(() => {
    instance.logoutPopup().catch(console.error)
  }, [instance])

  const { nodes, edges } = useMemo(() => {
    if (policies.length === 0) return { nodes: [], edges: [] }
    const graph = policiesToGraph(policies)
    const layoutNodes = applyDagreLayout(graph.nodes, graph.edges)
    return { nodes: layoutNodes, edges: graph.edges }
  }, [policies])

  const onNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      if (node.type !== 'policy') return
      // The policy node id is `{policyId}-root`, extract the original id
      const policyId = node.id.replace(/-root$/, '')
      const policy = policies.find((p) => p.id === policyId)
      if (policy) setSelectedPolicy(policy)
    },
    [policies],
  )

  const handleClosePanel = useCallback(() => {
    setSelectedPolicy(null)
  }, [])

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

      {/* Main content: canvas + optional detail panel */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodeClick={onNodeClick}
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

        {selectedPolicy && (
          <PolicyDetailPanel policy={selectedPolicy} onClose={handleClosePanel} />
        )}
      </div>
    </div>
  )
}

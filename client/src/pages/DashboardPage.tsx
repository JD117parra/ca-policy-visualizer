import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type NodeMouseHandler,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { toPng } from 'html-to-image'
import { useMsal } from '@azure/msal-react'
import { useConditionalAccessPolicies } from '@/hooks/useConditionalAccessPolicies'
import { policiesToGraph } from '@/lib/policyToGraph'
import { applyDagreLayout } from '@/lib/layoutGraph'
import { nodeTypes } from '@/components/flow/nodeTypes'
import { PolicyDetailPanel } from '@/components/PolicyDetailPanel'
import { PolicyFilters } from '@/components/PolicyFilters'
import { SkeletonLoader } from '@/components/SkeletonLoader'
import { useTheme } from '@/hooks/useTheme'
import type { ConditionalAccessPolicy, ConditionalAccessPolicyState } from '@/types/policy'

export default function DashboardPage() {
  const { instance, accounts } = useMsal()
  const { policies, isLoading, error, refetch } = useConditionalAccessPolicies()
  const { theme, toggleTheme } = useTheme()
  const [selectedPolicy, setSelectedPolicy] = useState<ConditionalAccessPolicy | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [stateFilter, setStateFilter] = useState<ConditionalAccessPolicyState | 'all'>('all')
  const [isExporting, setIsExporting] = useState(false)
  const flowRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Escape — close detail panel
      if (e.key === 'Escape' && selectedPolicy) {
        setSelectedPolicy(null)
      }
      // Ctrl/Cmd + K — focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedPolicy])

  const handleLogout = useCallback(() => {
    instance.logoutPopup().catch(console.error)
  }, [instance])

  const filteredPolicies = useMemo(() => {
    return policies.filter((p) => {
      if (stateFilter !== 'all' && p.state !== stateFilter) return false
      if (searchQuery && !p.displayName.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
  }, [policies, searchQuery, stateFilter])

  const { nodes, edges } = useMemo(() => {
    if (filteredPolicies.length === 0) return { nodes: [], edges: [] }
    const graph = policiesToGraph(filteredPolicies)
    const layoutNodes = applyDagreLayout(graph.nodes, graph.edges)

    // Mark the selected policy node
    if (selectedPolicy) {
      const selectedNodeId = `${selectedPolicy.id}-root`
      for (const node of layoutNodes) {
        if (node.id === selectedNodeId && node.type === 'policy') {
          node.data = { ...node.data, selected: true }
        }
      }
    }

    return { nodes: layoutNodes, edges: graph.edges }
  }, [filteredPolicies, selectedPolicy])

  const onNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      if (node.type !== 'policy') return
      const policyId = node.id.replace(/-root$/, '')
      const policy = filteredPolicies.find((p) => p.id === policyId)
      if (policy) setSelectedPolicy(policy)
    },
    [filteredPolicies],
  )

  const handleClosePanel = useCallback(() => {
    setSelectedPolicy(null)
  }, [])

  const handleExportPng = useCallback(async () => {
    const viewport = flowRef.current?.querySelector('.react-flow__viewport') as HTMLElement | null
    if (!viewport) return

    setIsExporting(true)
    try {
      const dataUrl = await toPng(viewport, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
      })
      const link = document.createElement('a')
      link.download = 'ca-policies.png'
      link.href = dataUrl
      link.click()
    } catch {
      console.error('Failed to export diagram')
    } finally {
      setIsExporting(false)
    }
  }, [])

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h1 className="text-xl font-bold">CA Policy Visualizer</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            )}
          </button>
          <span className="text-sm text-muted-foreground">
            {accounts[0]?.username ?? ''}
          </span>
          {nodes.length > 0 && (
            <button
              onClick={handleExportPng}
              disabled={isExporting}
              className="px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isExporting ? 'Exporting...' : 'Export PNG'}
            </button>
          )}
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

      {/* Filters */}
      {policies.length > 0 && (
        <PolicyFilters
          ref={searchInputRef}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          stateFilter={stateFilter}
          onStateFilterChange={setStateFilter}
          totalCount={policies.length}
          filteredCount={filteredPolicies.length}
        />
      )}

      {/* Error bar */}
      {error && (
        <div className="px-6 py-2 bg-destructive/10 text-destructive text-sm">
          Error: {error}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && filteredPolicies.length === 0 && policies.length > 0 && (
        <div className="px-6 py-8 text-center text-muted-foreground text-sm">
          No policies match your filters.
        </div>
      )}

      {/* Main content */}
      {isLoading ? (
        <SkeletonLoader />
      ) : (
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1" ref={flowRef}>
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
      )}
    </div>
  )
}

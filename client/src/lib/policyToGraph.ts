import type { Node, Edge } from 'reactflow'
import type { ConditionalAccessPolicy } from '@/types/policy'
import type { ConditionNodeData } from '@/components/flow/ConditionNode'
import type { ControlNodeData } from '@/components/flow/ControlNode'
import type { PolicyNodeData } from '@/components/flow/PolicyNode'

/**
 * Human-readable labels for well-known built-in control values.
 */
const CONTROL_LABELS: Record<string, string> = {
  mfa: 'Require MFA',
  compliantDevice: 'Compliant device',
  domainJoinedDevice: 'Domain-joined device',
  approvedApplication: 'Approved app',
  compliantApplication: 'Compliant app',
  passwordChange: 'Password change',
  block: 'Block access',
}

function formatControl(value: string): string {
  return CONTROL_LABELS[value] ?? value
}

/**
 * Extracts condition nodes from a policy's conditions object.
 * Only creates nodes for conditions that have actual values.
 */
function extractConditions(
  policy: ConditionalAccessPolicy,
  policyId: string,
): { nodes: Node<ConditionNodeData>[]; ids: string[] } {
  const nodes: Node<ConditionNodeData>[] = []
  const ids: string[] = []
  const cond = policy.conditions

  // Users & groups
  const userItems: string[] = []
  if (cond.users?.includeUsers?.length)
    userItems.push(...cond.users.includeUsers.map((u) => (u === 'All' ? 'All users' : u)))
  if (cond.users?.includeGroups?.length)
    userItems.push(...cond.users.includeGroups.map((g) => `Group: ${g}`))
  if (cond.users?.includeRoles?.length)
    userItems.push(...cond.users.includeRoles.map((r) => `Role: ${r}`))
  if (userItems.length) {
    const id = `${policyId}-cond-users`
    ids.push(id)
    nodes.push({
      id,
      type: 'condition',
      position: { x: 0, y: 0 },
      data: { label: 'Users & Roles', items: userItems, category: 'users' },
    })
  }

  // Applications
  const appItems: string[] = []
  if (cond.applications?.includeApplications?.length)
    appItems.push(
      ...cond.applications.includeApplications.map((a) =>
        a === 'All' ? 'All applications' : a,
      ),
    )
  if (cond.applications?.includeUserActions?.length)
    appItems.push(...cond.applications.includeUserActions)
  if (appItems.length) {
    const id = `${policyId}-cond-apps`
    ids.push(id)
    nodes.push({
      id,
      type: 'condition',
      position: { x: 0, y: 0 },
      data: { label: 'Applications', items: appItems, category: 'applications' },
    })
  }

  // Platforms
  if (cond.platforms?.includePlatforms?.length) {
    const id = `${policyId}-cond-platforms`
    ids.push(id)
    nodes.push({
      id,
      type: 'condition',
      position: { x: 0, y: 0 },
      data: { label: 'Platforms', items: cond.platforms.includePlatforms, category: 'platforms' },
    })
  }

  // Locations
  if (cond.locations?.includeLocations?.length) {
    const id = `${policyId}-cond-locations`
    ids.push(id)
    nodes.push({
      id,
      type: 'condition',
      position: { x: 0, y: 0 },
      data: { label: 'Locations', items: cond.locations.includeLocations, category: 'locations' },
    })
  }

  // Risk levels
  const riskItems: string[] = []
  if (cond.signInRiskLevels?.length)
    riskItems.push(...cond.signInRiskLevels.map((r) => `Sign-in: ${r}`))
  if (cond.userRiskLevels?.length)
    riskItems.push(...cond.userRiskLevels.map((r) => `User: ${r}`))
  if (riskItems.length) {
    const id = `${policyId}-cond-risk`
    ids.push(id)
    nodes.push({
      id,
      type: 'condition',
      position: { x: 0, y: 0 },
      data: { label: 'Risk Levels', items: riskItems, category: 'risk' },
    })
  }

  // Client app types
  if (cond.clientAppTypes?.length) {
    const id = `${policyId}-cond-clientapps`
    ids.push(id)
    nodes.push({
      id,
      type: 'condition',
      position: { x: 0, y: 0 },
      data: { label: 'Client Apps', items: cond.clientAppTypes, category: 'clientApps' },
    })
  }

  return { nodes, ids }
}

/**
 * Extracts grant and session control nodes from a policy.
 */
function extractControls(
  policy: ConditionalAccessPolicy,
  policyId: string,
): { nodes: Node<ControlNodeData>[]; ids: string[] } {
  const nodes: Node<ControlNodeData>[] = []
  const ids: string[] = []

  // Grant controls
  if (policy.grantControls?.builtInControls?.length) {
    const id = `${policyId}-grant`
    ids.push(id)
    nodes.push({
      id,
      type: 'control',
      position: { x: 0, y: 0 },
      data: {
        label: 'Grant Controls',
        items: policy.grantControls.builtInControls.map(formatControl),
        operator: policy.grantControls.operator,
        kind: 'grant',
      },
    })
  }

  // Session controls
  const sessionItems: string[] = []
  const sc = policy.sessionControls
  if (sc?.applicationEnforcedRestrictions?.isEnabled)
    sessionItems.push('App-enforced restrictions')
  if (sc?.cloudAppSecurity?.isEnabled)
    sessionItems.push('Cloud App Security')
  if (sc?.signInFrequency?.isEnabled)
    sessionItems.push(`Sign-in frequency: ${sc.signInFrequency.value ?? '?'} ${sc.signInFrequency.type ?? ''}`.trim())
  if (sc?.persistentBrowser?.isEnabled)
    sessionItems.push(`Persistent browser: ${sc.persistentBrowser.mode ?? 'default'}`)
  if (sessionItems.length) {
    const id = `${policyId}-session`
    ids.push(id)
    nodes.push({
      id,
      type: 'control',
      position: { x: 0, y: 0 },
      data: { label: 'Session Controls', items: sessionItems, kind: 'session' },
    })
  }

  return { nodes, ids }
}

/**
 * Converts a single ConditionalAccessPolicy into React Flow nodes and edges.
 * Layout: PolicyNode → ConditionNodes → ControlNodes
 */
export function policyToGraph(policy: ConditionalAccessPolicy): { nodes: Node[]; edges: Edge[] } {
  const policyId = policy.id
  const nodes: Node[] = []
  const edges: Edge[] = []

  // Root policy node
  const policyNodeId = `${policyId}-root`
  const policyNode: Node<PolicyNodeData> = {
    id: policyNodeId,
    type: 'policy',
    position: { x: 0, y: 0 },
    data: { displayName: policy.displayName, state: policy.state },
  }
  nodes.push(policyNode)

  // Condition nodes
  const conditions = extractConditions(policy, policyId)
  nodes.push(...conditions.nodes)

  // Edge: policy → each condition
  for (const condId of conditions.ids) {
    edges.push({
      id: `${policyNodeId}->${condId}`,
      source: policyNodeId,
      target: condId,
      type: 'smoothstep',
    })
  }

  // Control nodes
  const controls = extractControls(policy, policyId)
  nodes.push(...controls.nodes)

  // Edge: each condition → each control
  // If no conditions, connect policy directly to controls
  const sourceIds = conditions.ids.length > 0 ? conditions.ids : [policyNodeId]
  for (const sourceId of sourceIds) {
    for (const controlId of controls.ids) {
      edges.push({
        id: `${sourceId}->${controlId}`,
        source: sourceId,
        target: controlId,
        type: 'smoothstep',
      })
    }
  }

  return { nodes, edges }
}

/**
 * Converts an array of policies into a single graph.
 */
export function policiesToGraph(policies: ConditionalAccessPolicy[]): { nodes: Node[]; edges: Edge[] } {
  const allNodes: Node[] = []
  const allEdges: Edge[] = []

  for (const policy of policies) {
    const { nodes, edges } = policyToGraph(policy)
    allNodes.push(...nodes)
    allEdges.push(...edges)
  }

  return { nodes: allNodes, edges: allEdges }
}

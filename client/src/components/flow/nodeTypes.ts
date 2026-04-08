import type { NodeTypes } from 'reactflow'
import { PolicyNode } from './PolicyNode'
import { ConditionNode } from './ConditionNode'
import { ControlNode } from './ControlNode'

export const nodeTypes: NodeTypes = {
  policy: PolicyNode,
  condition: ConditionNode,
  control: ControlNode,
}

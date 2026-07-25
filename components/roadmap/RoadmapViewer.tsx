"use client";

import React, { useCallback, useMemo, useEffect } from 'react';
import ReactFlow, { 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState,
  MarkerType,
  Handle,
  Position,
  Node as FlowNode,
  Edge as FlowEdge
} from 'reactflow';
import 'reactflow/dist/style.css';
import { cn } from '@/lib/utils';
import { CheckCircle2, Lock, PlayCircle } from 'lucide-react';
import dagre from 'dagre';

// 1. Strictly define the Node Data locally to include isRoot and remove 'any'
export interface ViewerNodeData {
  id: string;
  title: string;
  description?: string;
  type?: string;
  status?: string;
  isRoot?: boolean;
}

// 2. Strictly define ViewerProps to match the roadmap structure
interface ViewerProps {
  roadmap: {
    title?: string;
    description?: string;
    nodes?: ViewerNodeData[];
  };
  userProgress: Record<string, string>[]; 
  onNodeSelect: (nodeId: string) => void; 
}

// 3. Remove 'any' from CustomNode by using our strict interface
const CustomNode = ({ data }: { data: ViewerNodeData }) => {
  const { title, description, status } = data;
  
  const isCompleted = status === 'completed';
  const isAvailable = status === 'available';
  const isLocked = status === 'locked' || !status;

  return (
    <div className={cn(
      "px-4 py-3 rounded-xl border-2 shadow-sm min-w-64 transition-all duration-300 cursor-pointer hover:scale-105",
      isCompleted && "bg-emerald-50 border-emerald-500/50 dark:bg-emerald-950/30 dark:border-emerald-500/30",
      isAvailable && "bg-white border-blue-500 shadow-blue-500/20 dark:bg-slate-900 dark:border-blue-500",
      isLocked && "bg-white border-dashed border-slate-300 dark:bg-slate-900 dark:border-slate-700 text-slate-500"
    )}>
      <Handle type="target" position={Position.Top} className="w-2 h-2 opacity-0" />
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          {isCompleted && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
          {isAvailable && <PlayCircle className="w-5 h-5 text-blue-500" />}
          {isLocked && <Lock className="w-5 h-5 text-slate-400" />}
        </div>
        <div>
          <h3 className={cn("font-semibold text-sm", isLocked ? "text-slate-500" : "text-slate-900 dark:text-slate-100")}>
            {title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
            {description}
          </p>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 opacity-0" />
    </div>
  );
};

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes: FlowNode[], edges: FlowEdge[], direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction, ranksep: 80, nodesep: 100 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 250, height: 120 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: { x: nodeWithPosition.x - 125, y: nodeWithPosition.y - 60 },
    };
  });

  return { nodes: layoutedNodes, edges };
};

export function RoadmapViewer({ roadmap, userProgress, onNodeSelect }: ViewerProps) {
  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  const progressMap = useMemo(() => {
    const map: Record<string, string> = {};
    if (userProgress && Array.isArray(userProgress)) {
      userProgress.forEach((p) => {
        if (p?.nodeId) map[p.nodeId] = p.status;
      });
    }
    return map;
  }, [userProgress]);

  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    // 4. Safely extract nodes without using 'any'
    const validNodes: ViewerNodeData[] = roadmap?.nodes || [];

    // 5. Create a local copy of progressMap to prevent ESLint immutability mutation errors
    const localProgress = { ...progressMap };

    // Auto-unlock the first node if nothing is started
    if (validNodes.length > 0 && !validNodes.some(n => localProgress[n.id] === 'completed' || localProgress[n.id] === 'available')) {
      const rootNode = validNodes.find(n => n.isRoot) || validNodes[0];
      localProgress[rootNode.id] = 'available'; // Mutating the local copy is completely safe
    }

    const rNodes: FlowNode[] = validNodes.map((n) => ({
      id: n.id,
      type: 'custom',
      data: { ...n, status: localProgress[n.id] || 'locked' },
      position: { x: 0, y: 0 },
    }));

    const rEdges: FlowEdge[] = validNodes.flatMap((n, index, array) => {
      if (index < array.length - 1) {
        const nextNode = array[index + 1];
        const targetStatus = localProgress[nextNode.id] || 'locked';
        const sourceCompleted = localProgress[n.id] === 'completed';
        
        // Auto-unlock next node if current is completed
        if (sourceCompleted && targetStatus === 'locked') {
          localProgress[nextNode.id] = 'available';
          // Update the node data so it renders correctly
          const targetReactFlowNode = rNodes.find(rn => rn.id === nextNode.id);
          if (targetReactFlowNode) {
            targetReactFlowNode.data.status = 'available';
          }
        }

        const updatedTargetStatus = localProgress[nextNode.id] || 'locked';
        const color = updatedTargetStatus === 'locked' ? '#cbd5e1' : '#3b82f6';
        
        return [{
          id: `e-${n.id}-${nextNode.id}`,
          source: n.id,
          target: nextNode.id,
          type: 'smoothstep',
          animated: sourceCompleted,
          style: { stroke: color, strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color },
        }];
      }
      return [];
    });

    return getLayoutedElements(rNodes, rEdges);
  }, [roadmap, progressMap]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  useEffect(() => {
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [layoutedNodes, layoutedEdges, setNodes, setEdges]); 

  const onNodeClick = useCallback((event: React.MouseEvent, node: FlowNode) => {
    onNodeSelect(node.id);
  }, [onNodeSelect]);

  return (
    <div className="w-full h-full bg-slate-50/50 dark:bg-[#0f172a] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3, minZoom: 0.5, maxZoom: 1.5 }}
        className="bg-grid-slate-100 dark:bg-grid-slate-900"
      >
        <Background gap={16} size={1} />
        <Controls className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800" />
      </ReactFlow>
    </div>
  );
}
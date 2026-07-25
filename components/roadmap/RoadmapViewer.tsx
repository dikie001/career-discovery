"use client";

import React, {  useMemo, useEffect } from 'react';
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

export interface ViewerNodeData {
  id: string;
  title: string;
  description?: string;
  type?: string;
  status?: string;
  isRoot?: boolean;
}

interface ViewerProps {
  roadmap: {
    title?: string;
    description?: string;
    nodes?: ViewerNodeData[];
    edges?: { id?: string; sourceId: string; targetId: string; label?: string }[];
  };
  userProgress: Record<string, string>[]; 
  onNodeSelect: (nodeId: string) => void; 
}

// FIX: Added direct onClick to the wrapper div to guarantee clickability
const CustomNode = ({ data }: { data: ViewerNodeData & { onSelect: (id: string) => void } }) => {
  const { id, title, description, status, onSelect } = data;
  
  const isCompleted = status === 'completed';
  const isAvailable = status === 'available';
  const isLocked = status === 'locked' || !status;

  return (
    <div 
      onClick={() => onSelect(id)}
      className={cn(
        "px-4 py-3 rounded-xl border-2 shadow-sm min-w-64 transition-all duration-300 cursor-pointer hover:scale-105 pointer-events-auto",
        isCompleted && "bg-emerald-50 border-emerald-500/50 dark:bg-emerald-950/30 dark:border-emerald-500/30",
        isAvailable && "bg-white border-blue-500 shadow-blue-500/20 dark:bg-slate-900 dark:border-blue-500",
        isLocked && "bg-white border-dashed border-slate-300 dark:bg-slate-900 dark:border-slate-700 text-slate-500"
      )}
    >
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
  dagreGraph.setGraph({ rankdir: direction, ranksep: 80, nodesep: 150 }); // Increased nodesep for branching

  nodes.forEach((node) => dagreGraph.setNode(node.id, { width: 260, height: 100 }));
  edges.forEach((edge) => dagreGraph.setEdge(edge.source, edge.target));

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: { x: nodeWithPosition.x - 130, y: nodeWithPosition.y - 50 },
    };
  });

  return { nodes: layoutedNodes, edges };
};

export function RoadmapViewer({ roadmap, userProgress, onNodeSelect }: ViewerProps) {
  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  const progressMap = useMemo(() => {
    const map: Record<string, string> = {};
    if (userProgress && Array.isArray(userProgress)) {
      userProgress.forEach((p) => { if (p?.nodeId) map[p.nodeId] = p.status; });
    }
    return map;
  }, [userProgress]);

  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    const validNodes = roadmap?.nodes || [];
    // FIX: Extract actual edges from DB to allow branching!
    const validEdges = roadmap?.edges || []; 
    const localProgress = { ...progressMap };

    // Find root nodes (nodes that are not a target of any edge)
    const targetIds = new Set(validEdges.map(e => e.targetId));
    const rootNodes = validNodes.filter(n => !targetIds.has(n.id) || n.isRoot);
    
    rootNodes.forEach(rn => {
      if (!localProgress[rn.id]) localProgress[rn.id] = 'available';
    });

    // Determine availability based on DB edges
    validEdges.forEach(edge => {
      if (localProgress[edge.sourceId] === 'completed' && !localProgress[edge.targetId]) {
        localProgress[edge.targetId] = 'available';
      }
    });

    const rNodes: FlowNode[] = validNodes.map((n) => ({
      id: n.id,
      type: 'custom',
      // Pass onNodeSelect directly into the node data
      data: { ...n, status: localProgress[n.id] || 'locked', onSelect: onNodeSelect },
      position: { x: 0, y: 0 },
    }));

    const rEdges: FlowEdge[] = validEdges.map((e, idx) => {
      const sourceCompleted = localProgress[e.sourceId] === 'completed';
      const targetStatus = localProgress[e.targetId] || 'locked';
      const color = targetStatus === 'locked' ? '#cbd5e1' : '#3b82f6';
      
      return {
        id: e.id || `e-${e.sourceId}-${e.targetId}-${idx}`,
        source: e.sourceId,
        target: e.targetId,
        label: e.label, // Show "Choose Frontend" labels if they exist
        type: 'smoothstep',
        animated: sourceCompleted,
        style: { stroke: color, strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color },
        labelStyle: { fill: '#64748b', fontWeight: 600, fontSize: 11 },
        labelBgStyle: { fill: '#ffffff', fillOpacity: 0.8 },
      };
    });

    return getLayoutedElements(rNodes, rEdges);
  }, [roadmap, progressMap, onNodeSelect]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  useEffect(() => {
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [layoutedNodes, layoutedEdges, setNodes, setEdges]); 

  return (
    <div className="w-full h-full bg-slate-50/50 dark:bg-[#0f172a] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
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
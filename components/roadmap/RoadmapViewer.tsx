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

// --- TYPES ---
export interface CustomNodeData {
  title: string;
  description?: string;
  status?: string;
  type?: string;
}

export interface RoadmapEdgeData {
  id?: string;
  sourceId: string;
  targetId: string;
  label?: string;
}

export interface RoadmapNodeData {
  id: string;
  title: string;
  description?: string;
  type?: string;
  status?: string;
  edgesOut?: RoadmapEdgeData[];
}

export interface RoadmapData {
  nodes?: RoadmapNodeData[];
  title?: string;
  description?: string;
}

interface ViewerProps {
  roadmap: RoadmapData;
  // Completely removed 'any' and replaced it with a strict Record type
  // that matches exactly what page.tsx is sending.
  userProgress: Record<string, string>[]; 
  onNodeComplete: (nodeId: string) => void;
}

// --- Custom Node Component ---
const CustomNode = ({ data }: { data: CustomNodeData }) => {
  const { title, description, status, type } = data;
  
  const isCompleted = status === 'completed';
  const isAvailable = status === 'available';
  const isLocked = status === 'locked' || !status;

  return (
    <div className={cn(
      "px-4 py-3 rounded-xl border-2 shadow-sm min-w-50 transition-all duration-300",
      isCompleted && "bg-emerald-50 border-emerald-500/50 dark:bg-emerald-950/30 dark:border-emerald-500/30",
      isAvailable && "bg-white border-blue-500 shadow-blue-500/20 dark:bg-slate-900 dark:border-blue-500 cursor-pointer hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20",
      isLocked && "bg-slate-50 border-slate-200 dark:bg-slate-900/50 dark:border-slate-800 opacity-60 grayscale"
    )}>
      <Handle type="target" position={Position.Top} className="w-2 h-2 opacity-0" />
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          {isCompleted && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
          {isAvailable && <PlayCircle className="w-5 h-5 text-blue-500" />}
          {isLocked && <Lock className="w-5 h-5 text-slate-400" />}
        </div>
        <div>
          <h3 className={cn(
            "font-semibold text-sm",
            isLocked ? "text-slate-500 dark:text-slate-400" : "text-slate-900 dark:text-slate-100"
          )}>
            {title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
            {description}
          </p>
          <div className="mt-2">
             <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
               {type ? type.replace('_', ' ') : 'NODE'}
             </span>
          </div>
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
      position: {
        x: nodeWithPosition.x - 125,
        y: nodeWithPosition.y - 60,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

export function RoadmapViewer({ roadmap, userProgress, onNodeComplete }: ViewerProps) {
  
  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  const progressMap = useMemo(() => {
    const map: Record<string, string> = {};
    if (userProgress && Array.isArray(userProgress)) {
      // Replaced 'any' with 'Record<string, string>' to satisfy ESLint
      userProgress.forEach((p: Record<string, string>) => {
        if (p?.nodeId) {
          map[p.nodeId] = p.status;
        }
      });
    }
    return map;
  }, [userProgress]);

  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    const validNodes: RoadmapNodeData[] = roadmap?.nodes || [];

    const rNodes: FlowNode[] = validNodes.map((n) => ({
      id: n.id,
      type: 'custom',
      data: {
        ...n,
        status: progressMap[n.id] || 'locked'
      },
      position: { x: 0, y: 0 },
    }));

    const rEdges: FlowEdge[] = validNodes.flatMap((n, index, array) => {
      
      if (n.edgesOut && Array.isArray(n.edgesOut) && n.edgesOut.length > 0) {
        return n.edgesOut.map((e) => {
          const targetStatus = progressMap[e.targetId] || 'locked';
          const sourceCompleted = progressMap[e.sourceId] === 'completed';
          const color = targetStatus === 'locked' ? '#cbd5e1' : '#3b82f6';
          
          return {
            id: e.id || `e-${e.sourceId}-${e.targetId}`,
            source: e.sourceId,
            target: e.targetId,
            type: 'smoothstep',
            animated: sourceCompleted && targetStatus === 'available',
            label: e.label,
            style: { stroke: color, strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color },
          };
        });
      }

      if (index < array.length - 1) {
        const nextNode = array[index + 1];
        const targetStatus = progressMap[nextNode.id] || 'locked';
        const sourceCompleted = progressMap[n.id] === 'completed';
        const color = targetStatus === 'locked' ? '#cbd5e1' : '#3b82f6';

        return [{
          id: `fallback-edge-${n.id}-${nextNode.id}`,
          source: n.id,
          target: nextNode.id,
          type: 'smoothstep',
          animated: sourceCompleted && targetStatus === 'available',
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
    if (node.data.status === 'available') {
      if (window.confirm(`Do you want to complete this node: ${node.data.title}?`)) {
        onNodeComplete(node.id);
      }
    } else if (node.data.status === 'locked') {
        window.alert("This path is locked. Complete previous nodes to unlock it.");
    }
  }, [onNodeComplete]);

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
        className="bg-grid-slate-100 dark:bg-grid-slate-900"
      >
        <Background gap={16} size={1} />
        <Controls className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800" />
      </ReactFlow>
    </div>
  );
}
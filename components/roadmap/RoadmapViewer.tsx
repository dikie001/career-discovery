"use client";

import React, { useCallback, useMemo } from 'react';
import ReactFlow, { 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState,
  MarkerType,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import { cn } from '@/lib/utils';
import { CheckCircle2, Lock, PlayCircle, Star } from 'lucide-react';
import dagre from 'dagre';

// --- Custom Node Component ---
const CustomNode = ({ data }: any) => {
  const { title, description, status, type } = data;
  
  const isCompleted = status === 'completed';
  const isAvailable = status === 'available';
  const isLocked = status === 'locked' || !status;

  return (
    <div className={cn(
      "px-4 py-3 rounded-xl border-2 shadow-sm min-w-[200px] transition-all duration-300",
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
               {type.replace('_', ' ')}
             </span>
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 opacity-0" />
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes: any[], edges: any[], direction = 'TB') => {
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
      // Shift slightly to center
      position: {
        x: nodeWithPosition.x - 125,
        y: nodeWithPosition.y - 60,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};


interface ViewerProps {
  roadmap: any;
  userProgress: any[];
  onNodeComplete: (nodeId: string) => void;
}

export function RoadmapViewer({ roadmap, userProgress, onNodeComplete }: ViewerProps) {
  
  const progressMap = useMemo(() => {
    const map: Record<string, string> = {};
    userProgress.forEach(p => {
      map[p.nodeId] = p.status;
    });
    return map;
  }, [userProgress]);

  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const rNodes = roadmap.nodes.map((n: any) => ({
      id: n.id,
      type: 'custom',
      data: {
        ...n,
        status: progressMap[n.id] || 'locked'
      },
      position: { x: 0, y: 0 },
    }));

    const rEdges = roadmap.nodes.flatMap((n: any) => 
      n.edgesOut.map((e: any) => ({
        id: e.id,
        source: e.sourceId,
        target: e.targetId,
        type: 'smoothstep',
        animated: progressMap[e.sourceId] === 'completed' && progressMap[e.targetId] === 'available',
        label: e.label,
        style: { stroke: progressMap[e.targetId] === 'locked' ? '#cbd5e1' : '#3b82f6', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: progressMap[e.targetId] === 'locked' ? '#cbd5e1' : '#3b82f6',
        },
      }))
    );

    return getLayoutedElements(rNodes, rEdges);
  }, [roadmap, progressMap]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when progress changes
  React.useEffect(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      roadmap.nodes.map((n: any) => ({
        id: n.id,
        type: 'custom',
        data: {
          ...n,
          status: progressMap[n.id] || 'locked'
        },
        position: { x: 0, y: 0 },
      })),
      edges // Keep existing edges to preserve layout
    );
    
    // Update edges styling dynamically
    const updatedEdges = edges.map(e => {
        const sourceCompleted = progressMap[e.source] === 'completed';
        const targetStatus = progressMap[e.target] || 'locked';
        const color = targetStatus === 'locked' ? '#cbd5e1' : '#3b82f6';
        return {
            ...e,
            animated: sourceCompleted && targetStatus === 'available',
            style: { stroke: color, strokeWidth: 2 },
            markerEnd: {
                type: MarkerType.ArrowClosed,
                color,
            }
        }
    });

    setNodes(layoutedNodes);
    setEdges(updatedEdges);
  }, [progressMap, roadmap, setNodes, setEdges]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: any) => {
    if (node.data.status === 'available') {
      if (confirm(`Do you want to complete this node: ${node.data.title}?`)) {
        onNodeComplete(node.id);
      }
    } else if (node.data.status === 'locked') {
        alert("This path is locked. Complete previous nodes to unlock it.");
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

import React, { useCallback, useRef, useState } from 'react';
import ReactFlow, {
    Background,
    Controls,
    Panel,
    ReactFlowInstance,
    ReactFlowProvider,
    NodeTypes
} from 'reactflow';
import 'reactflow/dist/style.css';
import { v4 as uuidv4 } from 'uuid';
import { useArchitectureStore } from '../../store/useArchitectureStore';
import { CustomNode } from './CustomNode';
import { AnimatedEdge } from './AnimatedEdge';
import { SystemNode, SystemNodeType } from '../../types';

const nodeTypes: NodeTypes = {
    custom: CustomNode,
};

const edgeTypes = {
    animated: AnimatedEdge,
};

const ArchitectureCanvas = () => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

    const {
        nodes, edges,
        onNodesChange, onEdgesChange, onConnect,
        setSelectedNodeId, addNode
    } = useArchitectureStore();

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow') as SystemNodeType;

            if (typeof type === 'undefined' || !type) {
                return;
            }

            if (reactFlowInstance && wrapperRef.current) {
                const reactFlowBounds = wrapperRef.current.getBoundingClientRect();
                const position = reactFlowInstance.project({
                    x: event.clientX - reactFlowBounds.left,
                    y: event.clientY - reactFlowBounds.top,
                });

                // Define base data based on type
                let nodeData: any = {
                    label: `New ${type}`,
                    type,
                    status: 'healthy',
                };

                if (type === 'server') {
                    nodeData = { ...nodeData, capacityRps: 100, baseLatencyMs: 50, failureRate: 0 };
                } else if (type === 'database') {
                    nodeData = { ...nodeData, readLatencyMs: 10, writeLatencyMs: 50, maxThroughput: 500 };
                } else if (type === 'cache') {
                    nodeData = { ...nodeData, hitRate: 0.8, ttl: 300, baseLatencyMs: 2 };
                } else if (type === 'loadBalancer') {
                    nodeData = { ...nodeData, algorithm: 'roundRobin' };
                } else if (type === 'queue') {
                    nodeData = { ...nodeData, maxSize: 1000, processRate: 50 };
                }

                const newNode: SystemNode = {
                    id: uuidv4(),
                    type: 'custom',
                    position,
                    data: nodeData,
                };

                addNode(newNode);
            }
        },
        [reactFlowInstance, addNode]
    );

    return (
        <div className="w-full h-full" ref={wrapperRef}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onInit={setReactFlowInstance}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onNodeClick={(_, node) => setSelectedNodeId(node.id)}
                onPaneClick={() => setSelectedNodeId(null)}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                className="bg-[#0f1117]"
                defaultEdgeOptions={{
                    type: 'animated',
                    style: { stroke: 'var(--color-border-subtle)', strokeWidth: 2 },
                    animated: false // We are drawing custom animated particles now, no need for the default stroke-dasharray animation
                }}
            >
                <Background color="var(--color-border-subtle)" gap={16} size={1} />
                <Controls className="fill-[var(--color-text-secondary)]" />
            </ReactFlow>
        </div>
    );
};

export const Canvas = () => (
    <ReactFlowProvider>
        <ArchitectureCanvas />
    </ReactFlowProvider>
);

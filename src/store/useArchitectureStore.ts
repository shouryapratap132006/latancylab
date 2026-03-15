import { create } from 'zustand';
import {
    Connection,
    Edge,
    EdgeChange,
    Node,
    NodeChange,
    addEdge,
    OnNodesChange,
    OnEdgesChange,
    OnConnect,
    applyNodeChanges,
    applyEdgeChanges
} from 'reactflow';
import { SystemNode, SystemEdge, SystemNodeData } from '../types';

interface ArchitectureState {
    nodes: SystemNode[];
    edges: SystemEdge[];
    selectedNodeId: string | null;

    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onConnect: OnConnect;

    setNodes: (nodes: SystemNode[]) => void;
    setEdges: (edges: SystemEdge[]) => void;
    addNode: (node: SystemNode) => void;
    updateNodeData: (id: string, data: Partial<SystemNodeData>) => void;
    removeNode: (id: string) => void;
    setSelectedNodeId: (id: string | null) => void;
    clear: () => void;
}

export const useArchitectureStore = create<ArchitectureState>((set, get) => ({
    nodes: [],
    edges: [],
    selectedNodeId: null,

    onNodesChange: (changes: NodeChange[]) => {
        set({
            nodes: applyNodeChanges(changes, get().nodes) as SystemNode[],
        });
    },

    onEdgesChange: (changes: EdgeChange[]) => {
        set({
            edges: applyEdgeChanges(changes, get().edges) as SystemEdge[],
        });
    },

    onConnect: (connection: Connection) => {
        set({
            edges: addEdge({ ...connection, animated: false }, get().edges) as SystemEdge[],
        });
    },

    setNodes: (nodes) => set({ nodes }),
    setEdges: (edges) => set({ edges }),

    addNode: (node) => {
        set({ nodes: [...get().nodes, node] });
    },

    updateNodeData: (id, data) => {
        set({
            nodes: get().nodes.map((node) =>
                node.id === id
                    ? { ...node, data: { ...node.data, ...data } }
                    : node
            ) as SystemNode[],
        });
    },

    removeNode: (id) => {
        set({
            nodes: get().nodes.filter((node) => node.id !== id),
            edges: get().edges.filter((edge) => edge.source !== id && edge.target !== id),
            selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId
        });
    },

    setSelectedNodeId: (id) => set({ selectedNodeId: id }),

    clear: () => set({ nodes: [], edges: [], selectedNodeId: null }),
}));

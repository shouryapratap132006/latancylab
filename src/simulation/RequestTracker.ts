import { SimulatedRequest, SystemEdge, SystemNode, ServerNodeData, DatabaseNodeData, QueueNodeData } from '../types';

export class RequestTracker {

    public static getNextHop(currentId: string, edges: SystemEdge[]): { targetId: string, edgeId: string } | null {
        const outgoingEdges = edges.filter(e => e.source === currentId);
        if (outgoingEdges.length === 0) return null;
        // Simple random routing 
        const edge = outgoingEdges[Math.floor(Math.random() * outgoingEdges.length)];
        return { targetId: edge.target, edgeId: edge.id };
    }

    public static getEdgeLatency(targetNodeId: string, nodes: SystemNode[]): number {
        const targetNode = nodes.find(n => n.id === targetNodeId);
        if (!targetNode) return 200; // Default fallback latency
        
        switch (targetNode.data.type) {
            case 'server': return (targetNode.data as ServerNodeData).baseLatencyMs || 50;
            case 'database': return (targetNode.data as DatabaseNodeData).readLatencyMs || 100;
            case 'cache': return (targetNode.data as any).baseLatencyMs || 20; // 'any' for cache node latency if baseLatencyMs is not guaranteed
            case 'client': return 10;
            case 'loadBalancer': return 20;
            case 'queue': return 10;
            default: return 50;
        }
    }

    public static getNodeCapacity(node: SystemNode): number {
        switch (node.data.type) {
            case 'server': return (node.data as ServerNodeData).capacityRps || 100;
            case 'database': return (node.data as DatabaseNodeData).maxThroughput || 500;
            case 'queue': return (node.data as QueueNodeData).processRate || 50;
            case 'loadBalancer': return 1000;
            case 'cache': return 1000;
            case 'client': return Infinity;
            default: return 100;
        }
    }
}

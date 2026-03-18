import { v4 as uuidv4 } from 'uuid';
import { useArchitectureStore } from '../store/useArchitectureStore';
import { useSimulationStore } from '../store/useSimulationStore';
import {
    SimulatedRequest,
    SystemNode,
    SystemEdge,
    SimulationMetrics,
    ClientNodeData,
    ServerNodeData,
    DatabaseNodeData,
    CacheNodeData,
    QueueNodeData,
    LoadBalancerNodeData
} from '../types';

class SimulationEngine {
    private timer: number | null = null;
    private lastTick: number = 0;

    start() {
        if (this.timer) return;
        this.lastTick = performance.now();
        const { tickRateMs } = useSimulationStore.getState().config;
        this.timer = window.setInterval(() => this.tick(), tickRateMs);
        useSimulationStore.getState().startSimulation();
    }

    stop() {
        if (this.timer) {
            window.clearInterval(this.timer);
            this.timer = null;
        }
        useSimulationStore.getState().stopSimulation();
    }

    private tick() {
        const now = performance.now();
        const deltaMs = now - this.lastTick;
        this.lastTick = now;

        const { config, requests, updateRequests, addRequests, updateMetrics } = useSimulationStore.getState();
        const { nodes, edges } = useArchitectureStore.getState();

        if (!config.isRunning || nodes.length === 0) return;

        // 1. Generate new requests from Client nodes
        const clientNodes = nodes.filter(n => n.data.type === 'client');
        const newRequests: SimulatedRequest[] = [];

        // Calculate how many requests to generate this tick based on loadRps
        // e.g., 100 rps, tick rate 50ms (0.05s) => 5 requests per tick
        const requestsToGenerate = (config.loadRps * deltaMs) / 1000;

        // Probabilistic generation to handle fractional requests (e.g. 0.5 per tick)
        const intReqs = Math.floor(requestsToGenerate);
        const fractional = requestsToGenerate - intReqs;
        const actualGenerations = intReqs + (Math.random() < fractional ? 1 : 0);

        if (actualGenerations > 0 && clientNodes.length > 0) {
            for (let i = 0; i < actualGenerations; i++) {
                // Pick a random client node
                const client = clientNodes[Math.floor(Math.random() * clientNodes.length)];
                const nextHop = this.getNextHop(client.id, edges);

                newRequests.push({
                    id: uuidv4(),
                    sourceNodeId: client.id,
                    currentNodeId: client.id,
                    targetNodeId: nextHop?.targetId || null,
                    status: 'pending',
                    startTime: now,
                    accumulatedLatency: 0,
                    path: [client.id],
                    nodeProgressMs: 0,
                    currentEdgeId: nextHop?.edgeId,
                    progress: 0
                });
            }
            addRequests(newRequests);
        }

        // 2. Process active requests
        const updatedRequests: SimulatedRequest[] = [];
        let completedCount = 0;
        let failedCount = 0;
        let accumulatedLatencySum = 0;

        // We only process a slice or just map over them
        requests.forEach(req => {
            if (req.status === 'completed' || req.status === 'failed' || req.status === 'dropped') {
                return; // Already terminal
            }

            if (req.status === 'pending') {
                req.status = 'processing';
            }

            req.accumulatedLatency += deltaMs;
            req.nodeProgressMs = (req.nodeProgressMs || 0) + deltaMs;

            // Find current node
            const currentNode = nodes.find(n => n.id === req.currentNodeId);

            if (!currentNode) {
                req.status = 'failed';
                failedCount++;
                updatedRequests.push(req);
                return;
            }

            // Calculate node processing time based on properties and failure injection
            const processingTimeReq = this.calculateProcessingTime(currentNode, req);
            
            // Calculate visual progress along the edge approaching this node (or at it)
            // If processing time is 0 (like client), instantly 1. Else mapped from 0 to 1 based on nodeProgressMs
            req.progress = processingTimeReq > 0 ? Math.min(1, req.nodeProgressMs / processingTimeReq) : 1;

            if (req.nodeProgressMs >= processingTimeReq) {
                // Done with this node, move to next
                const nextHop = this.getNextHop(currentNode.id, edges);

                if (nextHop) {
                    req.currentNodeId = nextHop.targetId;
                    
                    const futureHop = this.getNextHop(nextHop.targetId, edges);
                    req.targetNodeId = futureHop?.targetId || null;
                    
                    req.path.push(nextHop.targetId);
                    req.currentEdgeId = nextHop.edgeId;
                    req.nodeProgressMs = 0; // Reset for the next node
                    req.progress = 0;
                } else {
                    // No next node, request completed
                    req.status = 'completed';
                    completedCount++;
                    accumulatedLatencySum += req.accumulatedLatency;
                }
            }

            // Check failures (basic implementation)
            if (this.shouldFail(currentNode)) {
                req.status = 'failed';
                failedCount++;
            }

            updatedRequests.push(req);
        });

        if (updatedRequests.length > 0) {
            updateRequests(updatedRequests);
        }

        // 3. Update Metrics
        updateMetrics((prev) => this.calculateNewMetrics(prev, actualGenerations, completedCount, failedCount, accumulatedLatencySum, deltaMs, requests.length));
    }

    private getNextHop(currentId: string, edges: SystemEdge[]): { targetId: string, edgeId: string } | null {
        const outgoingEdges = edges.filter(e => e.source === currentId);
        if (outgoingEdges.length === 0) return null;
        // Simple random routing for now. In a real load balancer, apply algorithm.
        const edge = outgoingEdges[Math.floor(Math.random() * outgoingEdges.length)];
        return { targetId: edge.target, edgeId: edge.id };
    }

    private calculateProcessingTime(node: SystemNode, req: SimulatedRequest): number {
        switch (node.data.type) {
            case 'server':
                return (node.data as ServerNodeData).baseLatencyMs || 50;
            case 'database':
                return (node.data as DatabaseNodeData).readLatencyMs || 100;
            case 'cache':
                return (node.data as CacheNodeData).baseLatencyMs || 5;
            case 'loadBalancer':
                return 10;
            case 'client':
                return 0;
            default:
                return 50;
        }
    }

    private shouldFail(node: SystemNode): boolean {
        if (node.data.isFailing) return true;
        if (node.data.type === 'server') {
            const rate = (node.data as ServerNodeData).failureRate || 0;
            return Math.random() < rate;
        }
        return false;
    }

    private calculateNewMetrics(
        prev: SimulationMetrics,
        newReqs: number,
        completed: number,
        failed: number,
        latencySum: number,
        deltaMs: number,
        activeCount: number
    ): SimulationMetrics {
        // Very basic rolling averages for metrics
        const smoothing = 0.1;

        // Convert to per-second rates
        const currentRps = (newReqs / deltaMs) * 1000;
        const currentThroughput = (completed / deltaMs) * 1000;
        const currentErrorRate = prev.requestsPerSecond > 0 ? (failed / (newReqs || 1)) : 0;

        const avgLat = completed > 0 ? latencySum / completed : prev.avgLatency;

        return {
            requestsPerSecond: prev.requestsPerSecond * (1 - smoothing) + currentRps * smoothing,
            throughput: prev.throughput * (1 - smoothing) + currentThroughput * smoothing,
            errorRate: prev.errorRate * (1 - smoothing) + currentErrorRate * smoothing,
            avgLatency: prev.avgLatency * (1 - smoothing) + avgLat * smoothing,
            p50Latency: avgLat, // Simplified
            p95Latency: avgLat * 1.5, // Simplified 
            p99Latency: avgLat * 2, // Simplified
            activeRequests: activeCount
        };
    }
}

export const engine = new SimulationEngine();

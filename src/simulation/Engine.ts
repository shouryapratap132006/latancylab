import { v4 as uuidv4 } from 'uuid';
import { useArchitectureStore } from '../store/useArchitectureStore';
import { useSimulationStore } from '../store/useSimulationStore';
import { RequestTracker } from './RequestTracker';
import {
    SimulatedRequest,
    SimulationMetrics,
    NodeMetrics
} from '../types';

class SimulationEngine {
    private timer: number | null = null;
    private lastTick: number = 0;
    private nodeTokens: Record<string, number> = {}; // Allows fractional processing capacity per tick

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

        const { config, requests, updateRequests, removeRequests, addRecentRequests, addRequests, updateMetrics, updateAllNodeMetrics, nodeMetrics } = useSimulationStore.getState();
        const { nodes, edges } = useArchitectureStore.getState();

        if (!config.isRunning || nodes.length === 0) return;

        // 1. Generate new requests from Client nodes
        const clientNodes = nodes.filter(n => n.data.type === 'client');
        const newRequests: SimulatedRequest[] = [];
        const requestsToGenerate = (config.loadRps * deltaMs) / 1000;
        const intReqs = Math.floor(requestsToGenerate);
        const fractional = requestsToGenerate - intReqs;
        const actualGenerations = intReqs + (Math.random() < fractional ? 1 : 0);

        if (actualGenerations > 0 && clientNodes.length > 0) {
            for (let i = 0; i < actualGenerations; i++) {
                const client = clientNodes[Math.floor(Math.random() * clientNodes.length)];
                const nextHop = RequestTracker.getNextHop(client.id, edges);

                newRequests.push({
                    id: uuidv4(),
                    sourceNodeId: client.id,
                    currentNodeId: client.id,
                    targetNodeId: nextHop?.targetId || null,
                    status: 'processing', // starts processing immediately
                    startTime: now,
                    accumulatedLatency: 0,
                    path: [client.id],
                    nodeProgressMs: 0,
                    currentEdgeId: nextHop?.edgeId,
                    progress: 0
                });
            }
            addRequests(newRequests);
            // We append to local requests array so we can process them in this tick
            requests.push(...newRequests);
        }

        const updatedRequests: SimulatedRequest[] = [];
        const finishedRequests: SimulatedRequest[] = [];
        let completedCount = 0;
        let failedCount = 0;
        let accumulatedLatencySum = 0;

        // Setup maps for quick access
        const reqsByNode = new Map<string, SimulatedRequest[]>();
        nodes.forEach(n => reqsByNode.set(n.id, []));

        // 2. Process edge traversal
        for (const req of requests) {
            if (req.status === 'completed' || req.status === 'failed' || req.status === 'dropped') {
                finishedRequests.push(req);
                continue;
            }

            if (req.status === 'pending') {
                req.status = 'processing';
            }

            req.accumulatedLatency += deltaMs;

            if (req.currentEdgeId) {
                // Moving along edge
                const targetNodeLatency = req.targetNodeId ? RequestTracker.getEdgeLatency(req.targetNodeId, nodes) : 50;
                req.nodeProgressMs = (req.nodeProgressMs || 0) + deltaMs;
                req.progress = Math.min(1, req.nodeProgressMs / targetNodeLatency);

                if (req.progress >= 1) {
                    // Arrived at target node
                    req.currentEdgeId = undefined;
                    req.nodeProgressMs = 0;
                    req.progress = 0;
                    if (req.targetNodeId) {
                        req.currentNodeId = req.targetNodeId;
                    } else {
                        req.status = 'completed';
                        completedCount++;
                        accumulatedLatencySum += req.accumulatedLatency;
                    }
                }
            }

            if (req.status === 'processing' && !req.currentEdgeId && req.currentNodeId) {
                // Sits at a node, enqueue for processing
                if (!reqsByNode.has(req.currentNodeId)) {
                    reqsByNode.set(req.currentNodeId, []);
                }
                reqsByNode.get(req.currentNodeId)!.push(req);
            }

            // Failure injection check (simplified)
            if (req.currentNodeId && req.status === 'processing') {
                const node = nodes.find(n => n.id === req.currentNodeId);
                if (node && node.data.isFailing) {
                    req.status = 'failed';
                    failedCount++;
                } else if (node && node.data.type === 'server' && Math.random() < ((node.data as any).failureRate || 0)) {
                    req.status = 'failed';
                    failedCount++;
                }
            }

            if (req.status === 'completed' || req.status === 'failed' || req.status === 'dropped') {
                finishedRequests.push(req);
            } else {
                updatedRequests.push(req);
            }
        }

        const newNodeMetricsMap: Record<string, NodeMetrics> = {};

        // 3. Process node queues based on processing limits
        nodes.forEach(node => {
            const waitingReqs = reqsByNode.get(node.id) || [];
            
            // Client nodes do not queue requests, they just emit them
            if (node.data.type === 'client') {
                newNodeMetricsMap[node.id] = { queueSize: 0, processingCapacity: Infinity, activeConnections: 0, processedCount: 0, errorCount: 0, loadRatio: 0 };
                return;
            }

            const capacityRps = RequestTracker.getNodeCapacity(node);
            let tokens = this.nodeTokens[node.id] || 0;
            tokens += capacityRps * (deltaMs / 1000);

            let processedThisTick = 0;
            const processCount = Math.floor(tokens);
            
            if (waitingReqs.length > 0 && processCount > 0) {
                const toProcess = waitingReqs.slice(0, processCount);
                processedThisTick = toProcess.length;
                tokens -= processedThisTick;

                toProcess.forEach(req => {
                    const nextHop = RequestTracker.getNextHop(node.id, edges);
                    if (nextHop) {
                        req.currentEdgeId = nextHop.edgeId;
                        req.targetNodeId = nextHop.targetId;
                        req.nodeProgressMs = 0;
                        req.progress = 0;
                        req.path.push(nextHop.targetId);
                    } else {
                        req.status = 'completed';
                        completedCount++;
                        accumulatedLatencySum += req.accumulatedLatency;
                        finishedRequests.push(req);
                    }
                });
            }
            
            // Cap tokens so they don't accrue indefinitely during idle periods
            this.nodeTokens[node.id] = Math.min(tokens, capacityRps);

            // Phase 2 & 3: Node Health & Queue computation
            // Current Load is treated as the number of requests arriving or actively at the node during this tick.
            // Queue size is whatever is waiting *before* we process, or remaining. Let's show remaining waiting reqs.
            const remainingQueueSize = waitingReqs.length - processedThisTick;
            const loadRatio = capacityRps > 0 ? (waitingReqs.length / capacityRps) : 0;

            const existingMetrics = nodeMetrics[node.id] || { processedCount: 0, errorCount: 0 };

            newNodeMetricsMap[node.id] = {
                queueSize: Math.max(0, remainingQueueSize),
                processingCapacity: capacityRps,
                activeConnections: waitingReqs.length,
                processedCount: existingMetrics.processedCount + processedThisTick,
                errorCount: existingMetrics.errorCount, // Add failures if tracked per node
                loadRatio: loadRatio
            };
        });

        if (updatedRequests.length > 0) {
            updateRequests(updatedRequests);
        }

        if (finishedRequests.length > 0) {
            addRecentRequests(finishedRequests);
            removeRequests(finishedRequests.map(r => r.id));
        }

        updateAllNodeMetrics(newNodeMetricsMap);

        // Update overall simulation metrics
        updateMetrics((prev) => this.calculateNewMetrics(prev, actualGenerations, completedCount, failedCount, accumulatedLatencySum, deltaMs, requests.length));
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
        const smoothing = 0.1;
        const currentRps = (newReqs / deltaMs) * 1000;
        const currentThroughput = (completed / deltaMs) * 1000;
        const currentErrorRate = prev.requestsPerSecond > 0 ? (failed / (newReqs || 1)) : 0;
        const avgLat = completed > 0 ? latencySum / completed : prev.avgLatency;

        return {
            requestsPerSecond: prev.requestsPerSecond * (1 - smoothing) + currentRps * smoothing,
            throughput: prev.throughput * (1 - smoothing) + currentThroughput * smoothing,
            errorRate: prev.errorRate * (1 - smoothing) + currentErrorRate * smoothing,
            avgLatency: prev.avgLatency * (1 - smoothing) + avgLat * smoothing,
            p50Latency: avgLat, 
            p95Latency: avgLat * 1.5, 
            p99Latency: avgLat * 2, 
            activeRequests: activeCount
        };
    }
}

export const engine = new SimulationEngine();

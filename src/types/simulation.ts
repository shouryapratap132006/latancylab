export interface SimulationMetrics {
    requestsPerSecond: number;
    throughput: number; // successful responses per second
    errorRate: number; // 0 to 1
    avgLatency: number;
    p50Latency: number;
    p95Latency: number;
    p99Latency: number;
    activeRequests: number;
}

export interface TimestampedMetrics extends SimulationMetrics {
    timestamp: number;
}

export interface SimulationConfig {
    loadRps: number;
    isRunning: boolean;
    tickRateMs: number;
}

export interface SimulatedRequest {
    id: string;
    sourceNodeId: string;
    currentNodeId: string;
    targetNodeId: string | null;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'dropped';
    startTime: number;
    accumulatedLatency: number;
    path: string[]; // Node IDs visited
    nodeProgressMs?: number; // Time spent processing at the current node / edge
    currentEdgeId?: string; // ID of the edge it is currently traversing visually
    progress?: number; // 0 to 1 value representing traversal progress across currentEdgeId
}

export interface NodeMetrics {
    queueSize: number;
    activeConnections: number;
    processedCount: number;
    errorCount: number;
    processingCapacity: number;
    loadRatio: number;
}

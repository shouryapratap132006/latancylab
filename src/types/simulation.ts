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
}

export interface NodeMetrics {
    queueSize: number;
    activeConnections: number;
    processedCount: number;
    errorCount: number;
}

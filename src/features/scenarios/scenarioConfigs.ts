import { SystemNode, SystemEdge } from '../../types';

export interface ScenarioConfig {
    name: string;
    description: string;
    nodes: SystemNode[];
    edges: SystemEdge[];
}

export const scenarioConfigs: Record<string, ScenarioConfig> = {
    chat: {
        name: "Chat System",
        description: "Real-time Messaging with high concurrency and async delivery.",
        nodes: [
            { id: 'client-1', type: 'custom', position: { x: 0, y: 150 }, data: { label: 'Clients', type: 'client', status: 'healthy' } },
            { id: 'api-gw', type: 'custom', position: { x: 200, y: 150 }, data: { label: 'API Gateway', type: 'loadBalancer', algorithm: 'roundRobin', status: 'healthy' } },
            { id: 'lb-1', type: 'custom', position: { x: 400, y: 150 }, data: { label: 'Internal LB', type: 'loadBalancer', algorithm: 'leastConnections', status: 'healthy' } },
            { id: 'chat-svr-1', type: 'custom', position: { x: 600, y: 50 }, data: { label: 'Chat Server 1', type: 'server', capacityRps: 5000, baseLatencyMs: 10, failureRate: 0.001, status: 'healthy' } },
            { id: 'chat-svr-2', type: 'custom', position: { x: 600, y: 250 }, data: { label: 'Chat Server 2', type: 'server', capacityRps: 5000, baseLatencyMs: 10, failureRate: 0.001, status: 'healthy' } },
            { id: 'queue-1', type: 'custom', position: { x: 850, y: 150 }, data: { label: 'Message Queue', type: 'queue', maxSize: 50000, processRate: 3000, status: 'healthy' } },
            { id: 'db-1', type: 'custom', position: { x: 1100, y: 150 }, data: { label: 'Messages DB', type: 'database', readLatencyMs: 10, writeLatencyMs: 30, maxThroughput: 5000, status: 'healthy' } }
        ],
        edges: [
            { id: 'e1', source: 'client-1', target: 'api-gw' },
            { id: 'e2', source: 'api-gw', target: 'lb-1' },
            { id: 'e3', source: 'lb-1', target: 'chat-svr-1' },
            { id: 'e4', source: 'lb-1', target: 'chat-svr-2' },
            { id: 'e5', source: 'chat-svr-1', target: 'queue-1' },
            { id: 'e6', source: 'chat-svr-2', target: 'queue-1' },
            { id: 'e7', source: 'queue-1', target: 'db-1' }
        ]
    },
    video: {
        name: "Video Streaming",
        description: "Read-heavy traffic with high CDN caching.",
        nodes: [
            { id: 'client-1', type: 'custom', position: { x: 0, y: 150 }, data: { label: 'Viewers', type: 'client', status: 'healthy' } },
            { id: 'cdn-1', type: 'custom', position: { x: 250, y: 150 }, data: { label: 'Global CDN', type: 'cache', hitRate: 0.85, ttl: 86400, baseLatencyMs: 5, status: 'healthy' } },
            { id: 'lb-1', type: 'custom', position: { x: 500, y: 150 }, data: { label: 'Load Balancer', type: 'loadBalancer', algorithm: 'leastConnections', status: 'healthy' } },
            { id: 'origin-1', type: 'custom', position: { x: 750, y: 50 }, data: { label: 'Origin Server A', type: 'server', capacityRps: 1000, baseLatencyMs: 40, failureRate: 0.01, status: 'healthy' } },
            { id: 'origin-2', type: 'custom', position: { x: 750, y: 250 }, data: { label: 'Origin Server B', type: 'server', capacityRps: 1000, baseLatencyMs: 40, failureRate: 0.01, status: 'healthy' } },
            { id: 'storage-1', type: 'custom', position: { x: 1000, y: 150 }, data: { label: 'Blob Storage', type: 'database', readLatencyMs: 60, writeLatencyMs: 150, maxThroughput: 2000, status: 'healthy' } }
        ],
        edges: [
            { id: 'e1', source: 'client-1', target: 'cdn-1' },
            { id: 'e2', source: 'cdn-1', target: 'lb-1' },
            { id: 'e3', source: 'lb-1', target: 'origin-1' },
            { id: 'e4', source: 'lb-1', target: 'origin-2' },
            { id: 'e5', source: 'origin-1', target: 'storage-1' },
            { id: 'e6', source: 'origin-2', target: 'storage-1' }
        ]
    },
    rideSharing: {
        name: "Ride Sharing",
        description: "Real-time matching with heavy queued background workers.",
        nodes: [
            { id: 'client-1', type: 'custom', position: { x: 0, y: 150 }, data: { label: 'Riders/Drivers', type: 'client', status: 'healthy' } },
            { id: 'api-gw', type: 'custom', position: { x: 200, y: 150 }, data: { label: 'API Gateway', type: 'loadBalancer', algorithm: 'roundRobin', status: 'healthy' } },
            { id: 'matching-srv', type: 'custom', position: { x: 450, y: 150 }, data: { label: 'Matching Service', type: 'server', capacityRps: 2000, baseLatencyMs: 30, failureRate: 0.005, status: 'healthy' } },
            { id: 'queue-1', type: 'custom', position: { x: 700, y: 150 }, data: { label: 'Dispatch Queue', type: 'queue', maxSize: 10000, processRate: 1500, status: 'healthy' } },
            { id: 'driver-srv', type: 'custom', position: { x: 950, y: 150 }, data: { label: 'Driver Service', type: 'server', capacityRps: 1500, baseLatencyMs: 25, failureRate: 0.01, status: 'healthy' } },
            { id: 'db-1', type: 'custom', position: { x: 1200, y: 150 }, data: { label: 'Trips DB', type: 'database', readLatencyMs: 15, writeLatencyMs: 40, maxThroughput: 3000, status: 'healthy' } }
        ],
        edges: [
            { id: 'e1', source: 'client-1', target: 'api-gw' },
            { id: 'e2', source: 'api-gw', target: 'matching-srv' },
            { id: 'e3', source: 'matching-srv', target: 'queue-1' },
            { id: 'e4', source: 'queue-1', target: 'driver-srv' },
            { id: 'e5', source: 'driver-srv', target: 'db-1' }
        ]
    },
    socialMedia: {
        name: "Social Media Feed",
        description: "Heavy reads optimized by caching layers.",
        nodes: [
            { id: 'client-1', type: 'custom', position: { x: 0, y: 150 }, data: { label: 'Users', type: 'client', status: 'healthy' } },
            { id: 'lb-1', type: 'custom', position: { x: 200, y: 150 }, data: { label: 'Load Balancer', type: 'loadBalancer', algorithm: 'leastConnections', status: 'healthy' } },
            { id: 'feed-srv', type: 'custom', position: { x: 450, y: 150 }, data: { label: 'Feed Service', type: 'server', capacityRps: 4000, baseLatencyMs: 35, failureRate: 0.02, status: 'healthy' } },
            { id: 'cache-1', type: 'custom', position: { x: 700, y: 50 }, data: { label: 'Redis Cluster', type: 'cache', hitRate: 0.9, ttl: 3600, baseLatencyMs: 2, status: 'healthy' } },
            { id: 'db-1', type: 'custom', position: { x: 950, y: 250 }, data: { label: 'Graph DB', type: 'database', readLatencyMs: 45, writeLatencyMs: 90, maxThroughput: 2000, status: 'healthy' } }
        ],
        edges: [
            { id: 'e1', source: 'client-1', target: 'lb-1' },
            { id: 'e2', source: 'lb-1', target: 'feed-srv' },
            { id: 'e3', source: 'feed-srv', target: 'cache-1' },
            { id: 'e4', source: 'cache-1', target: 'db-1' }
        ]
    },
    payment: {
        name: "Payment Processing",
        description: "Critical latency, low failure rate chained services.",
        nodes: [
            { id: 'client-1', type: 'custom', position: { x: 0, y: 150 }, data: { label: 'Merchants', type: 'client', status: 'healthy' } },
            { id: 'api-gw', type: 'custom', position: { x: 200, y: 150 }, data: { label: 'Payment Gateway', type: 'loadBalancer', algorithm: 'roundRobin', status: 'healthy' } },
            { id: 'pay-srv', type: 'custom', position: { x: 450, y: 150 }, data: { label: 'Payment Service', type: 'server', capacityRps: 1000, baseLatencyMs: 100, failureRate: 0.001, status: 'healthy' } },
            { id: 'fraud-srv', type: 'custom', position: { x: 700, y: 50 }, data: { label: 'Fraud Detection (ML)', type: 'server', capacityRps: 800, baseLatencyMs: 250, failureRate: 0.005, status: 'healthy' } },
            { id: 'db-1', type: 'custom', position: { x: 950, y: 250 }, data: { label: 'Ledger DB', type: 'database', readLatencyMs: 15, writeLatencyMs: 50, maxThroughput: 500, status: 'healthy' } }
        ],
        edges: [
            { id: 'e1', source: 'client-1', target: 'api-gw' },
            { id: 'e2', source: 'api-gw', target: 'pay-srv' },
            { id: 'e3', source: 'pay-srv', target: 'fraud-srv' },
            { id: 'e4', source: 'fraud-srv', target: 'db-1' }
        ]
    },
    search: {
        name: "Search System",
        description: "Distributed querying with multiple backends.",
        nodes: [
            { id: 'client-1', type: 'custom', position: { x: 0, y: 150 }, data: { label: 'Users', type: 'client', status: 'healthy' } },
            { id: 'lb-1', type: 'custom', position: { x: 200, y: 150 }, data: { label: 'Global LB', type: 'loadBalancer', algorithm: 'consistentHash', status: 'healthy' } },
            { id: 'search-srv', type: 'custom', position: { x: 450, y: 150 }, data: { label: 'Search Coordinator', type: 'server', capacityRps: 8000, baseLatencyMs: 15, failureRate: 0.002, status: 'healthy' } },
            { id: 'index-1', type: 'custom', position: { x: 750, y: 0 }, data: { label: 'Index Node A', type: 'database', readLatencyMs: 25, writeLatencyMs: 200, maxThroughput: 3000, status: 'healthy' } },
            { id: 'index-2', type: 'custom', position: { x: 750, y: 150 }, data: { label: 'Index Node B', type: 'database', readLatencyMs: 25, writeLatencyMs: 200, maxThroughput: 3000, status: 'healthy' } },
            { id: 'index-3', type: 'custom', position: { x: 750, y: 300 }, data: { label: 'Index Node C', type: 'database', readLatencyMs: 25, writeLatencyMs: 200, maxThroughput: 3000, status: 'healthy' } }
        ],
        edges: [
            { id: 'e1', source: 'client-1', target: 'lb-1' },
            { id: 'e2', source: 'lb-1', target: 'search-srv' },
            { id: 'e3', source: 'search-srv', target: 'index-1' },
            { id: 'e4', source: 'search-srv', target: 'index-2' },
            { id: 'e5', source: 'search-srv', target: 'index-3' }
        ]
    }
};

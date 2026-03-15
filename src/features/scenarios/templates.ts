import { SystemNode, SystemEdge } from '../../types';
import { v4 as uuidv4 } from 'uuid';

export const scenarios: Record<string, { name: string, description: string, nodes: SystemNode[], edges: SystemEdge[] }> = {
    urlShortener: {
        name: "URL Shortener",
        description: "High read, low write. Client -> LB -> App -> DB + Cache",
        nodes: [
            { id: 'client-1', type: 'custom', position: { x: 0, y: 150 }, data: { label: 'Clients', type: 'client', status: 'healthy' } },
            { id: 'lb-1', type: 'custom', position: { x: 250, y: 150 }, data: { label: 'API Gateway', type: 'loadBalancer', status: 'healthy', algorithm: 'roundRobin' } },
            { id: 'server-1', type: 'custom', position: { x: 500, y: 50 }, data: { label: 'App Server A', type: 'server', status: 'healthy', capacityRps: 1000, baseLatencyMs: 20, failureRate: 0.01 } },
            { id: 'server-2', type: 'custom', position: { x: 500, y: 250 }, data: { label: 'App Server B', type: 'server', status: 'healthy', capacityRps: 1000, baseLatencyMs: 20, failureRate: 0.01 } },
            { id: 'cache-1', type: 'custom', position: { x: 750, y: 50 }, data: { label: 'Redis Cache', type: 'cache', status: 'healthy', hitRate: 0.9, ttl: 3600, baseLatencyMs: 2 } },
            { id: 'db-1', type: 'custom', position: { x: 750, y: 250 }, data: { label: 'PostgreSQL', type: 'database', status: 'healthy', readLatencyMs: 20, writeLatencyMs: 50, maxThroughput: 5000 } }
        ],
        edges: [
            { id: 'e1', source: 'client-1', target: 'lb-1' },
            { id: 'e2', source: 'lb-1', target: 'server-1' },
            { id: 'e3', source: 'lb-1', target: 'server-2' },
            { id: 'e4', source: 'server-1', target: 'cache-1' },
            { id: 'e5', source: 'server-2', target: 'cache-1' },
            { id: 'e6', source: 'server-1', target: 'db-1' },
            { id: 'e7', source: 'server-2', target: 'db-1' },
        ]
    },
    ecommerce: {
        name: "E-Commerce",
        description: "Complex system with queues: App -> Queue -> Background Workers",
        nodes: [
            { id: 'c1', type: 'custom', position: { x: 0, y: 150 }, data: { label: 'Users', type: 'client', status: 'healthy' } },
            { id: 'lb1', type: 'custom', position: { x: 200, y: 150 }, data: { label: 'Load Balancer', type: 'loadBalancer', status: 'healthy', algorithm: 'leastConnections' } },
            { id: 's1', type: 'custom', position: { x: 400, y: 50 }, data: { label: 'Checkout Service', type: 'server', status: 'healthy', capacityRps: 500, baseLatencyMs: 50, failureRate: 0 } },
            { id: 'db1', type: 'custom', position: { x: 600, y: -50 }, data: { label: 'Orders DB', type: 'database', status: 'healthy', readLatencyMs: 10, writeLatencyMs: 100, maxThroughput: 1000 } },
            { id: 'q1', type: 'custom', position: { x: 600, y: 150 }, data: { label: 'Event Bus', type: 'queue', status: 'healthy', maxSize: 10000, processRate: 200 } },
            { id: 's2', type: 'custom', position: { x: 800, y: 150 }, data: { label: 'Inventory Worker', type: 'server', status: 'healthy', capacityRps: 200, baseLatencyMs: 150, failureRate: 0.05 } },
            { id: 'db2', type: 'custom', position: { x: 1000, y: 150 }, data: { label: 'Inventory DB', type: 'database', status: 'healthy', readLatencyMs: 5, writeLatencyMs: 20, maxThroughput: 2000 } },
        ],
        edges: [
            { id: 'e1', source: 'c1', target: 'lb1' },
            { id: 'e2', source: 'lb1', target: 's1' },
            { id: 'e3', source: 's1', target: 'db1' },
            { id: 'e4', source: 's1', target: 'q1' },
            { id: 'e5', source: 'q1', target: 's2' },
            { id: 'e6', source: 's2', target: 'db2' },
        ]
    }
};

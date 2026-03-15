import { Node, Edge } from 'reactflow';

export type SystemNodeType =
    | 'client'
    | 'loadBalancer'
    | 'server'
    | 'database'
    | 'cache'
    | 'queue';

export type NodeStatus = 'healthy' | 'high_load' | 'overloaded' | 'offline';

export interface BaseNodeData {
    label: string;
    type: SystemNodeType;
    status: NodeStatus;
    isFailing?: boolean; // For failure injection
}

export interface ClientNodeData extends BaseNodeData {
    type: 'client';
}

export interface LoadBalancerNodeData extends BaseNodeData {
    type: 'loadBalancer';
    algorithm: 'roundRobin' | 'leastConnections' | 'consistentHash';
}

export interface ServerNodeData extends BaseNodeData {
    type: 'server';
    capacityRps: number;
    baseLatencyMs: number;
    failureRate: number; // 0 to 1
}

export interface DatabaseNodeData extends BaseNodeData {
    type: 'database';
    readLatencyMs: number;
    writeLatencyMs: number;
    maxThroughput: number;
}

export interface CacheNodeData extends BaseNodeData {
    type: 'cache';
    hitRate: number; // 0 to 1
    ttl: number;
    baseLatencyMs: number;
}

export interface QueueNodeData extends BaseNodeData {
    type: 'queue';
    maxSize: number;
    processRate: number;
}

export type SystemNodeData =
    | ClientNodeData
    | LoadBalancerNodeData
    | ServerNodeData
    | DatabaseNodeData
    | CacheNodeData
    | QueueNodeData;

export type SystemNode = Node<SystemNodeData>;
export type SystemEdge = Edge;

export interface SystemTopology {
    nodes: SystemNode[];
    edges: SystemEdge[];
}

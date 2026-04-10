import { create } from 'zustand';
import { SimulationConfig, SimulationMetrics, SimulatedRequest, NodeMetrics } from '../types';

interface SimulationState {
    config: SimulationConfig;
    metrics: SimulationMetrics;
    requests: SimulatedRequest[];
    nodeMetrics: Record<string, NodeMetrics>;

    setConfig: (config: Partial<SimulationConfig>) => void;
    setMetrics: (metrics: Partial<SimulationMetrics>) => void;
    updateMetrics: (fn: (prev: SimulationMetrics) => SimulationMetrics) => void;
    setNodeMetrics: (nodeId: string, metrics: Partial<NodeMetrics>) => void;
    updateAllNodeMetrics: (metricsMap: Record<string, NodeMetrics>) => void;

    startSimulation: () => void;
    stopSimulation: () => void;

    addRequests: (reqs: SimulatedRequest[]) => void;
    updateRequests: (reqs: SimulatedRequest[]) => void;
    removeRequests: (ids: string[]) => void;
    clearRequests: () => void;

    resetMetrics: () => void;
}

const initialMetrics: SimulationMetrics = {
    requestsPerSecond: 0,
    throughput: 0,
    errorRate: 0,
    avgLatency: 0,
    p50Latency: 0,
    p95Latency: 0,
    p99Latency: 0,
    activeRequests: 0,
};

const initialConfig: SimulationConfig = {
    loadRps: 10,
    isRunning: false,
    tickRateMs: 50, // 20 ticks per second
};

export const useSimulationStore = create<SimulationState>((set, get) => ({
    config: initialConfig,
    metrics: initialMetrics,
    requests: [],
    nodeMetrics: {},

    setConfig: (configUpdate) => set({ config: { ...get().config, ...configUpdate } }),

    setMetrics: (metricsUpdate) => set({ metrics: { ...get().metrics, ...metricsUpdate } }),

    updateMetrics: (fn) => set({ metrics: fn(get().metrics) }),

    setNodeMetrics: (nodeId, metricsUpdate) => set(state => ({
        nodeMetrics: {
            ...state.nodeMetrics,
            [nodeId]: {
                ...(state.nodeMetrics[nodeId] || { queueSize: 0, activeConnections: 0, processedCount: 0, errorCount: 0, processingCapacity: 100, loadRatio: 0 }),
                ...metricsUpdate
            }
        }
    })),

    updateAllNodeMetrics: (metricsMap) => set({ nodeMetrics: metricsMap }),

    startSimulation: () => set({ config: { ...get().config, isRunning: true } }),

    stopSimulation: () => set({
        config: { ...get().config, isRunning: false },
        requests: [],
        nodeMetrics: {}
    }),

    addRequests: (newReqs) => set({ requests: [...get().requests, ...newReqs] }),

    updateRequests: (updatedReqs) => {
        const updatedMap = new Map(updatedReqs.map(r => [r.id, r]));
        set({
            requests: get().requests.map(r => updatedMap.get(r.id) || r)
        });
    },

    removeRequests: (ids) => {
        const idSet = new Set(ids);
        set({ requests: get().requests.filter(r => !idSet.has(r.id)) });
    },

    clearRequests: () => set({ requests: [] }),

    resetMetrics: () => set({ metrics: initialMetrics }),
}));

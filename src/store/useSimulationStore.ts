import { create } from 'zustand';
import { SimulationConfig, SimulationMetrics, SimulatedRequest } from '../types';

interface SimulationState {
    config: SimulationConfig;
    metrics: SimulationMetrics;
    requests: SimulatedRequest[];

    setConfig: (config: Partial<SimulationConfig>) => void;
    setMetrics: (metrics: Partial<SimulationMetrics>) => void;
    updateMetrics: (fn: (prev: SimulationMetrics) => SimulationMetrics) => void;

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

    setConfig: (configUpdate) => set({ config: { ...get().config, ...configUpdate } }),

    setMetrics: (metricsUpdate) => set({ metrics: { ...get().metrics, ...metricsUpdate } }),

    updateMetrics: (fn) => set({ metrics: fn(get().metrics) }),

    startSimulation: () => set({ config: { ...get().config, isRunning: true } }),

    stopSimulation: () => set({
        config: { ...get().config, isRunning: false },
        requests: []
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

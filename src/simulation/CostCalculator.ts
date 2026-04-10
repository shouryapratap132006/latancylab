import { SystemNode } from '../types';

export const COMPONENT_COSTS: Record<string, number> = {
    server: 20,
    database: 100,
    cache: 40,
    queue: 30,
    loadBalancer: 25,
    client: 0
};

export const calculateCost = (nodes: SystemNode[]) => {
    let total = 0;
    const breakdown: Record<string, { count: number; cost: number }> = {};

    nodes.forEach(node => {
        const type = node.data.type;
        const costPerNode = COMPONENT_COSTS[type] || 0;
        
        if (costPerNode > 0) {
            total += costPerNode;
            if (!breakdown[type]) {
                breakdown[type] = { count: 0, cost: 0 };
            }
            breakdown[type].count++;
            breakdown[type].cost += costPerNode;
        }
    });

    return { total, breakdown };
};

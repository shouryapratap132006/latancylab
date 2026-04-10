import React, { useMemo } from 'react';
import { useArchitectureStore } from '../../store/useArchitectureStore';
import { useSimulationStore } from '../../store/useSimulationStore';
import { calculateCost } from '../../simulation/CostCalculator';
import { DollarSign, X } from 'lucide-react';

export const CostPanel = () => {
    const { nodes } = useArchitectureStore();
    const { isCostVisible, setCostVisible } = useSimulationStore();
    
    const { total, breakdown } = useMemo(() => calculateCost(nodes), [nodes]);

    if (!isCostVisible) return null;
    if (total === 0) return null;

    return (
        <div className="absolute left-4 bottom-4 w-64 bg-[var(--color-bg-panel)]/95 backdrop-blur border border-[var(--color-border-subtle)] rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-[var(--color-border-subtle)] flex items-center justify-between shadow-sm bg-[var(--color-bg-base)]">
                <h3 className="font-semibold text-sm flex items-center gap-2 text-[var(--color-text-primary)]">
                    <DollarSign className="w-4 h-4 text-green-400" /> Infrastructure Cost
                </h3>
                <button
                    onClick={() => setCostVisible(false)}
                    className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors p-1 rounded-md hover:bg-white/5"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
            <div className="p-4 space-y-4">
                <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold font-mono text-[var(--color-text-primary)]">
                        ${total}
                    </span>
                    <span className="text-sm text-[var(--color-text-muted)] mb-1">/mo</span>
                </div>

                <div className="space-y-2 pt-2 border-t border-[var(--color-border-subtle)]">
                    <p className="text-xs uppercase tracking-wider font-semibold text-[var(--color-text-muted)] mb-2">Breakdown</p>
                    {Object.entries(breakdown).map(([type, data]) => (
                        <div key={type} className="flex items-center justify-between text-sm">
                            <span className="text-[var(--color-text-secondary)] capitalize flex items-center gap-2">
                                {type}{' '}
                                <span className="text-xs px-1.5 py-0.5 rounded-md bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)]">
                                    x{data.count}
                                </span>
                            </span>
                            <span className="font-mono text-[var(--color-text-primary)]">
                                ${data.cost}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

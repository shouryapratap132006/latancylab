import React from 'react';
import { useArchitectureStore } from '../../store/useArchitectureStore';
import { Settings, Trash2, AlertTriangle, Activity } from 'lucide-react';
import { SystemNodeData } from '../../types';

export const PropertiesPanel = () => {
    const { nodes, selectedNodeId, updateNodeData, removeNode } = useArchitectureStore();

    const selectedNode = nodes.find(n => n.id === selectedNodeId);

    if (!selectedNode) {
        return (
            <div className="flex flex-col h-full bg-[var(--color-bg-panel)] p-6 items-center justify-center text-center opacity-50">
                <Settings className="w-12 h-12 mb-4 text-[var(--color-text-muted)]" />
                <h3 className="text-lg font-medium text-[var(--color-text-secondary)]">No Component Selected</h3>
                <p className="text-sm text-[var(--color-text-muted)] mt-2">Click on a node in the canvas to configure its properties.</p>
            </div>
        );
    }

    const { data } = selectedNode;

    const handleUpdate = (updates: Partial<SystemNodeData>) => {
        updateNodeData(selectedNode.id, updates);
    };

    const renderSpecificProperties = () => {
        switch (data.type) {
            case 'server':
                return (
                    <>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--color-text-secondary)] flex justify-between">
                                <span>Capacity (req/s)</span>
                                <span className="text-brand">{(data as any).capacityRps}</span>
                            </label>
                            <input
                                type="range" min="10" max="10000" step="10"
                                value={(data as any).capacityRps}
                                onChange={e => handleUpdate({ capacityRps: parseInt(e.target.value) })}
                                className="w-full accent-[var(--color-brand-500)]"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--color-text-secondary)] flex justify-between">
                                <span>Base Latency (ms)</span>
                                <span>{(data as any).baseLatencyMs}</span>
                            </label>
                            <input
                                type="range" min="1" max="1000"
                                value={(data as any).baseLatencyMs}
                                onChange={e => handleUpdate({ baseLatencyMs: parseInt(e.target.value) })}
                                className="w-full accent-[var(--color-brand-500)]"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--color-text-secondary)] flex justify-between">
                                <span>Failure Rate (%)</span>
                                <span className="text-[var(--color-status-red)]">{((data as any).failureRate * 100).toFixed(1)}%</span>
                            </label>
                            <input
                                type="range" min="0" max="1" step="0.01"
                                value={(data as any).failureRate}
                                onChange={e => handleUpdate({ failureRate: parseFloat(e.target.value) })}
                                className="w-full accent-[var(--color-status-red)]"
                            />
                        </div>
                    </>
                );

            case 'database':
                return (
                    <>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--color-text-secondary)] flex justify-between">
                                <span>Read Latency (ms)</span>
                                <span>{(data as any).readLatencyMs}</span>
                            </label>
                            <input
                                type="range" min="1" max="500"
                                value={(data as any).readLatencyMs}
                                onChange={e => handleUpdate({ readLatencyMs: parseInt(e.target.value) })}
                                className="w-full accent-[var(--color-brand-500)]"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--color-text-secondary)] flex justify-between">
                                <span>Write Latency (ms)</span>
                                <span>{(data as any).writeLatencyMs}</span>
                            </label>
                            <input
                                type="range" min="5" max="1000"
                                value={(data as any).writeLatencyMs}
                                onChange={e => handleUpdate({ writeLatencyMs: parseInt(e.target.value) })}
                                className="w-full accent-[var(--color-brand-500)]"
                            />
                        </div>
                    </>
                );

            case 'cache':
                return (
                    <>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--color-text-secondary)] flex justify-between">
                                <span>Hit Rate (%)</span>
                                <span className="text-[var(--color-status-green)]">{((data as any).hitRate * 100).toFixed(0)}%</span>
                            </label>
                            <input
                                type="range" min="0" max="1" step="0.01"
                                value={(data as any).hitRate}
                                onChange={e => handleUpdate({ hitRate: parseFloat(e.target.value) })}
                                className="w-full accent-[var(--color-brand-500)]"
                            />
                        </div>
                    </>
                );

            case 'loadBalancer':
                return (
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--color-text-secondary)] block">Algorithm</label>
                        <select
                            value={(data as any).algorithm}
                            onChange={e => handleUpdate({ algorithm: e.target.value as any })}
                            className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] rounded-lg p-2 text-sm focus:outline-none focus:border-[var(--color-brand-500)]"
                        >
                            <option value="roundRobin">Round Robin</option>
                            <option value="leastConnections">Least Connections</option>
                            <option value="consistentHash">Consistent Hashing</option>
                        </select>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col h-full bg-[var(--color-bg-panel)] overflow-hidden">
            <div className="p-4 border-b border-[var(--color-border-subtle)] shrink-0 flex justify-between items-center">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)] flex items-center gap-2">
                    <Settings className="w-4 h-4" /> Properties
                </h2>
                <button
                    onClick={() => removeNode(selectedNode.id)}
                    className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-status-red)] hover:bg-[var(--color-status-red)]/10 rounded-md transition-colors"
                    title="Delete Node"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-8">
                {/* Basic Properties */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--color-text-secondary)] block">Name</label>
                        <input
                            type="text"
                            value={data.label}
                            onChange={e => handleUpdate({ label: e.target.value })}
                            className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] rounded-lg p-2 text-sm focus:outline-none focus:border-[var(--color-brand-500)] transition-colors"
                        />
                    </div>

                    <div className="flex items-center gap-2 px-3 py-2 bg-[var(--color-bg-base)] rounded-lg border border-[var(--color-border-subtle)] text-sm text-[var(--color-text-secondary)]">
                        <span className="font-mono text-xs opacity-50">ID:</span>
                        <span className="font-mono text-xs truncate" title={selectedNode.id}>{selectedNode.id}</span>
                    </div>
                </div>

                {/* Component Specific Properties */}
                {data.type !== 'client' && (
                    <div className="space-y-6">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] border-b border-[var(--color-border-subtle)] pb-2 flex items-center gap-2">
                            <Activity className="w-3 h-3" /> Configuration
                        </h3>

                        {renderSpecificProperties()}
                    </div>
                )}

                {/* Failure Injection */}
                {data.type !== 'client' && (
                    <div className="space-y-4 pt-4 border-t border-[var(--color-border-subtle)]">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] flex items-center gap-2 text-[var(--color-status-red)]">
                            <AlertTriangle className="w-3 h-3" /> Failure Injection
                        </h3>

                        <button
                            onClick={() => handleUpdate({ isFailing: !data.isFailing })}
                            className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all shadow-md ${data.isFailing
                                    ? 'bg-[var(--color-status-red)] text-white hover:bg-red-600 shadow-red-900/40'
                                    : 'bg-[var(--color-bg-base)] border border-[var(--color-status-red)]/50 text-[var(--color-status-red)] hover:bg-[var(--color-status-red)]/10'
                                }`}
                        >
                            {data.isFailing ? 'Recover Node' : 'Kill Node Instance'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

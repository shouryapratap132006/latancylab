import React from 'react';
import { useSimulationStore } from '../../store/useSimulationStore';
import { useArchitectureStore } from '../../store/useArchitectureStore';
import { Activity, X, CheckCircle, XCircle, Clock } from 'lucide-react';

export const TracingPanel = () => {
    const { requests, recentRequests, selectedRequestId, setSelectedRequestId, isTracingVisible, setTracingVisible } = useSimulationStore();
    const { nodes } = useArchitectureStore();

    const allRequests = [...requests, ...recentRequests];
    const selectedReq = allRequests.find(r => r.id === selectedRequestId);

    const getNodeLabel = (nodeId: string) => {
        const node = nodes.find(n => n.id === nodeId);
        return node ? node.data.label : nodeId;
    };

    if (!isTracingVisible) {
        return null;
    }

    if (!selectedRequestId && recentRequests.length === 0) {
        return (
            <div className="absolute right-4 bottom-4 w-80 bg-[var(--color-bg-panel)]/95 backdrop-blur border border-[var(--color-border-subtle)] rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden p-4">
                <div className="flex items-center justify-between mb-4 shadow-sm bg-[var(--color-bg-base)]">
                    <h3 className="font-semibold text-sm flex items-center gap-2 text-[var(--color-text-primary)]">
                        <Activity className="w-4 h-4 text-[var(--color-brand-400)]" /> Request Tracing
                    </h3>
                    <button
                        onClick={() => setTracingVisible(false)}
                        className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors p-1 rounded-md hover:bg-white/5"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="text-sm text-[var(--color-text-muted)] text-center py-4">No recent requests yet. Start the simulation to trace requests.</div>
            </div>
        );
    }

    return (
        <div className="absolute right-4 bottom-4 w-80 bg-[var(--color-bg-panel)]/95 backdrop-blur border border-[var(--color-border-subtle)] rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-[var(--color-border-subtle)] flex items-center justify-between shadow-sm bg-[var(--color-bg-base)]">
                <h3 className="font-semibold text-sm flex items-center gap-2 text-[var(--color-text-primary)]">
                    <Activity className="w-4 h-4 text-[var(--color-brand-400)]" /> Request Tracing
                </h3>
                <div className="flex items-center gap-2">
                    {selectedRequestId && (
                        <button
                            onClick={() => setSelectedRequestId(null)}
                            className="text-xs px-2 py-1 bg-[var(--color-bg-base)] rounded-md border border-[var(--color-border-subtle)] text-[var(--color-text-muted)] hover:text-white"
                        >
                            Back
                        </button>
                    )}
                    <button
                        onClick={() => setTracingVisible(false)}
                        className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors p-1 rounded-md hover:bg-white/5"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto max-h-96 relative">
                {selectedReq ? (
                    <div className="p-4 space-y-4">
                        <div className="flex items-center justify-between text-xs font-medium text-[var(--color-text-secondary)] bg-[var(--color-bg-base)] p-2 rounded-lg border border-[var(--color-border-subtle)]">
                            <span className="truncate max-w-[150px]" title={selectedReq.id}>#{selectedReq.id.slice(0, 8)}</span>
                            <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-purple-400" />
                                    {selectedReq.accumulatedLatency.toFixed(1)} ms
                                </span>
                                {selectedReq.status === 'completed' ? (
                                    <span className="flex items-center gap-1 text-green-400 drop-shadow-[0_0_8px_rgba(7ade80,0.5)]"><CheckCircle className="w-3 h-3" /> Success</span>
                                ) : selectedReq.status === 'failed' ? (
                                    <span className="flex items-center gap-1 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]"><XCircle className="w-3 h-3" /> Failed</span>
                                ) : (
                                    <span className="text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)] capitalize">{selectedReq.status}</span>
                                )}
                            </div>
                        </div>

                        <div className="relative pl-3 border-l-2 border-[var(--color-border-subtle)] py-2 space-y-4 ml-2">
                            {selectedReq.path.map((nodeId, idx) => (
                                <div key={idx} className="relative">
                                    <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-[var(--color-brand-500)] shadow-[0_0_10px_var(--color-brand-500)] ring-4 ring-[var(--color-bg-panel)]" />
                                    <div className="text-sm font-medium text-[var(--color-text-primary)]">
                                        {getNodeLabel(nodeId)}
                                    </div>
                                    {idx === 0 && <div className="text-xs text-[var(--color-text-muted)] mt-0.5">Origin</div>}
                                    {idx === selectedReq.path.length - 1 && selectedReq.status === 'completed' && <div className="text-xs text-[var(--color-text-muted)] mt-0.5">Destination</div>}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="p-4 space-y-2">
                        <p className="text-xs text-[var(--color-text-muted)] mb-3 uppercase tracking-wider font-semibold">Recent Requests</p>
                        {recentRequests.slice(0, 10).map(req => (
                            <div
                                key={req.id}
                                onClick={() => setSelectedRequestId(req.id)}
                                className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] hover:border-[var(--color-brand-400)] cursor-pointer transition-all group"
                            >
                                <div className="flex flex-col gap-1 overflow-hidden">
                                    <span className="text-xs font-mono text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] truncate">
                                        {req.id.slice(0, 8)}
                                    </span>
                                    <span className="text-[10px] text-[var(--color-text-muted)] truncate">
                                        {req.path.length} hops
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                                        {req.accumulatedLatency.toFixed(0)}ms
                                    </span>
                                    {req.status === 'completed' ? (
                                        <CheckCircle className="w-4 h-4 text-green-400 drop-shadow-[0_0_8px_rgba(7ade80,0.5)]" />
                                    ) : req.status === 'failed' ? (
                                        <XCircle className="w-4 h-4 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                                    ) : null}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

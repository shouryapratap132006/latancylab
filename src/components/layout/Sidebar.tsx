import React from 'react';
import { Server, Database, Activity, Layers, HardDrive, MessageSquare, BookOpen } from 'lucide-react';
import { scenarioConfigs } from '../../features/scenarios/scenarioConfigs';
import { useArchitectureStore } from '../../store/useArchitectureStore';

const nodeTypes = [
    { type: 'client', label: 'Client', icon: <Activity className="w-4 h-4 text-blue-400" /> },
    { type: 'loadBalancer', label: 'Load Balancer', icon: <Layers className="w-4 h-4 text-purple-400" /> },
    { type: 'server', label: 'App Server', icon: <Server className="w-4 h-4 text-green-400" /> },
    { type: 'database', label: 'Database', icon: <HardDrive className="w-4 h-4 text-orange-400" /> },
    { type: 'cache', label: 'Cache', icon: <Database className="w-4 h-4 text-yellow-400" /> },
    { type: 'queue', label: 'Message Queue', icon: <MessageSquare className="w-4 h-4 text-pink-400" /> },
];

export const Sidebar = () => {
    const { setNodes, setEdges, clear } = useArchitectureStore();

    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    const loadScenario = (key: string) => {
        if (!key) return;
        // Basic confirmation
        if (confirm("Replace current architecture with this scenario?")) {
            clear();
            // setTimeout to allow clear to flush
            setTimeout(() => {
                const s = scenarioConfigs[key];
                if (s) {
                    setNodes(s.nodes);
                    setEdges(s.edges);
                }
            }, 50);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[var(--color-bg-panel)] overflow-hidden">
            <div className="p-4 border-b border-[var(--color-border-subtle)] shrink-0">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Components</h2>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-3 pb-24">
                <p className="text-xs text-[var(--color-text-secondary)] mb-4 leading-relaxed">Drag components to the canvas to build architecture.</p>

                {nodeTypes.map((node) => (
                    <div
                        key={node.type}
                        className="flex items-center gap-3 p-3 bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] rounded-lg cursor-grab hover:border-[var(--color-brand-500)] hover:shadow-[0_0_10px_rgba(170,59,255,0.15)] transition-all active:cursor-grabbing"
                        onDragStart={(event) => onDragStart(event, node.type)}
                        draggable
                    >
                        <div className="flex items-center justify-center p-2 bg-[var(--color-bg-panel)] rounded-md border border-[var(--color-border-subtle)] shrink-0">
                            {node.icon}
                        </div>
                        <span className="text-sm font-medium">{node.label}</span>
                    </div>
                ))}

                <div className="pt-6 mt-6 border-t border-[var(--color-border-subtle)]">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)] flex items-center gap-2 mb-4">
                        <BookOpen className="w-4 h-4" /> Scenarios
                    </h2>
                    
                    <div className="flex flex-col gap-2">
                        <select 
                            className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] rounded-lg p-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand-500)]"
                            onChange={(e) => {
                                loadScenario(e.target.value);
                                e.target.value = ""; // Reset after selection
                            }}
                            defaultValue=""
                        >
                            <option value="" disabled>Load a scenario...</option>
                            {Object.entries(scenarioConfigs).map(([key, s]) => (
                                <option key={key} value={key}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-[var(--color-text-secondary)] mt-2">
                            Selecting a scenario will replace the current architecture.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

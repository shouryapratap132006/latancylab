import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Server, Database, Box, Layers, HardDrive, MessageSquare, Activity } from 'lucide-react';
import { SystemNodeData } from '../../types';

// Icons mapping based on type
const iconMap = {
    client: <Activity className="w-5 h-5 text-blue-400" />,
    loadBalancer: <Layers className="w-5 h-5 text-purple-400" />,
    server: <Server className="w-5 h-5 text-green-400" />,
    database: <HardDrive className="w-5 h-5 text-orange-400" />,
    cache: <Database className="w-5 h-5 text-yellow-400" />,
    queue: <MessageSquare className="w-5 h-5 text-pink-400" />
};

const getStatusColor = (status: SystemNodeData['status']) => {
    switch (status) {
        case 'healthy': return 'bg-[var(--color-status-green)]';
        case 'high_load': return 'bg-[var(--color-status-yellow)]';
        case 'overloaded': return 'bg-[var(--color-status-red)]';
        case 'offline': return 'bg-gray-500';
        default: return 'bg-gray-500';
    }
};

export const CustomNode = memo(({ data, selected }: { data: SystemNodeData, selected?: boolean }) => {
    const isClient = data.type === 'client';

    return (
        <div className={`relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all shadow-xl bg-[var(--color-bg-panel)] backdrop-blur-md min-w-[160px]
      ${selected ? 'border-[var(--color-brand-500)] shadow-[0_0_15px_rgba(170,59,255,0.3)]' : 'border-[var(--color-border-subtle)]'}
      ${data.isFailing ? 'animate-pulse border-[var(--color-status-red)] opacity-80' : ''}
    `}>

            {!isClient && (
                <Handle
                    type="target"
                    position={Position.Left}
                    className="w-3 h-3 bg-[var(--color-border-subtle)] border-2 border-[var(--color-bg-panel)]"
                />
            )}

            <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)]">
                {iconMap[data.type as keyof typeof iconMap] || <Box className="w-5 h-5" />}
            </div>

            <div className="flex flex-col flex-1">
                <span className="font-medium text-sm text-[var(--color-text-primary)]">{data.label}</span>
                <span className="text-[10px] uppercase text-[var(--color-text-muted)] tracking-wider">
                    {data.type}
                </span>
            </div>

            <div className="absolute -top-1 -right-1 flex gap-1">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(data.status)} border-2 border-[var(--color-bg-panel)]`} />
            </div>

            <Handle
                type="source"
                position={Position.Right}
                className="w-3 h-3 bg-[var(--color-brand-500)] border-2 border-[var(--color-bg-panel)]"
            />
        </div>
    );
});

CustomNode.displayName = 'CustomNode';

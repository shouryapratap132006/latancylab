import React from 'react';
import { EdgeProps, getBezierPath, BaseEdge } from 'reactflow';
import { motion } from 'framer-motion';
import { useSimulationStore } from '../../store/useSimulationStore';

export function AnimatedEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
}: EdgeProps) {
    const [edgePath] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const requests = useSimulationStore((state) => state.requests);
    const activeRequests = requests.filter(
        (req) => req.status === 'processing' && req.currentEdgeId === id
    );

    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
            
            {activeRequests.map((req) => (
                <motion.circle
                    key={req.id}
                    r="4"
                    fill="#3b82f6"
                    style={{
                        offsetPath: `path("${edgePath}")`,
                        offsetDistance: `${(req.progress || 0) * 100}%`,
                        offsetRotate: "auto"
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                />
            ))}
        </>
    );
}

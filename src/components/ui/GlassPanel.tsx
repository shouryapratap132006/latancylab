import React from 'react';

export const GlassPanel = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => {
    return (
        <div className={`glass-panel rounded-xl p-4 ${className}`}>
            {children}
        </div>
    );
};

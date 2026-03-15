import React, { useEffect } from 'react';
import { Header } from './Header';
import { engine } from '../../simulation/Engine';

interface MainLayoutProps {
    children: React.ReactNode;
    sidebar: React.ReactNode;
    propertiesPanel: React.ReactNode;
    metricsDashboard: React.ReactNode;
}

export const MainLayout = ({ children, sidebar, propertiesPanel, metricsDashboard }: MainLayoutProps) => {
    useEffect(() => {
        return () => {
            engine.stop();
        };
    }, []);

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden bg-[var(--color-bg-base)] text-[var(--color-text-primary)]!">
            <Header />

            <div className="flex flex-1 overflow-hidden relative">
                <div className="w-64 border-r border-[var(--color-border-subtle)] bg-[var(--color-bg-panel)] flex flex-col z-10 relative overflow-y-auto">
                    {sidebar}
                </div>

                <main className="flex-1 relative bg-[#0f1117] overflow-hidden">
                    {children}
                </main>

                <div className="w-80 border-l border-[var(--color-border-subtle)] bg-[var(--color-bg-panel)]/95 backdrop-blur flex flex-col z-10 relative overflow-y-auto">
                    {propertiesPanel}
                </div>
            </div>

            <div className="h-64 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-panel)] z-10 relative shrink-0">
                {metricsDashboard}
            </div>
        </div>
    );
};

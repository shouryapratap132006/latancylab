import { Play, Square, Activity, FileSearch, DollarSign } from 'lucide-react';
import { useSimulationStore } from '../../store/useSimulationStore';
import { engine } from '../../simulation/Engine';

export const Header = () => {
    const { 
        config, startSimulation, stopSimulation, setConfig,
        isTracingVisible, setTracingVisible,
        isCostVisible, setCostVisible
    } = useSimulationStore();

    const handleStart = () => {
        engine.start();
    };

    const handleStop = () => {
        engine.stop();
    };

    return (
        <header className="h-16 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-panel)] flex items-center justify-between px-6 z-10 relative shrink-0">
            <div className="flex items-center gap-3">
                <Activity className="w-6 h-6 text-brand" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent !m-0 !text-xl !tracking-normal">
                    Latency Lab
                </h1>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                    <span className="text-sm text-[var(--color-text-secondary)] w-32">Load: {config.loadRps} req/s</span>
                    <input
                        type="range"
                        min="1" max="1000"
                        value={config.loadRps}
                        onChange={(e) => setConfig({ loadRps: parseInt(e.target.value) })}
                        className="w-48 accent-[var(--color-brand-500)] cursor-pointer"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setTracingVisible(!isTracingVisible)}
                        className={`flex items-center justify-center p-2 rounded-lg border transition-all ${
                            isTracingVisible 
                                ? 'bg-[var(--color-brand-500)]/20 border-[var(--color-brand-500)] text-[var(--color-brand-400)]' 
                                : 'bg-[var(--color-bg-panel-hover)] border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:text-white hover:border-[var(--color-brand-500)]/50'
                        }`}
                        title="Toggle Tracing Panel"
                    >
                        <FileSearch className="w-4 h-4" />
                    </button>
                    
                    <button
                        onClick={() => setCostVisible(!isCostVisible)}
                        className={`flex items-center justify-center p-2 rounded-lg border transition-all ${
                            isCostVisible 
                                ? 'bg-green-500/20 border-green-500 text-green-400' 
                                : 'bg-[var(--color-bg-panel-hover)] border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:text-white hover:border-green-500/50'
                        }`}
                        title="Toggle Cost Panel"
                    >
                        <DollarSign className="w-4 h-4" />
                    </button>

                    <div className="w-px h-6 bg-[var(--color-border-subtle)] mx-2" />

                    {!config.isRunning ? (
                        <button
                            onClick={handleStart}
                            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-brand-500)] hover:bg-[#9024e0] text-white rounded-lg transition-all shadow-lg shadow-purple-500/20 active:scale-95 cursor-pointer border-none font-medium text-sm"
                        >
                            <Play className="w-4 h-4 fill-current" /> Start Simulation
                        </button>
                    ) : (
                        <button
                            onClick={handleStop}
                            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-bg-panel-hover)] border border-[var(--color-border-subtle)] hover:bg-[#2d313f] text-white rounded-lg transition-all active:scale-95 cursor-pointer font-medium text-sm"
                        >
                            <Square className="w-4 h-4 fill-current text-[var(--color-status-red)]" /> Stop Simulation
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};

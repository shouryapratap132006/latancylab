import React from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { useSimulationStore } from '../../store/useSimulationStore';
import { Activity, Zap, AlertCircle, Clock } from 'lucide-react';

export const MetricsDashboard = () => {
    const { metrics, config } = useSimulationStore();

    // In a real app we'd keep historical data, here we just show live gauges for simplicity,
    // or use a small array in local state if we want charts.
    // For the sake of the beautiful UI requested, let's create a simulated history for the area charts.
    const [history, setHistory] = React.useState<any[]>([]);

    React.useEffect(() => {
        if (!config.isRunning) return;

        const interval = setInterval(() => {
            setHistory(prev => {
                const newEntry = {
                    time: new Date().toLocaleTimeString().split(' ')[0], // HH:MM:SS
                    rps: useSimulationStore.getState().metrics.requestsPerSecond,
                    latency: useSimulationStore.getState().metrics.avgLatency,
                };
                const newHist = [...prev, newEntry];
                if (newHist.length > 20) newHist.shift(); // keep last 20 ticks
                return newHist;
            });
        }, 1000); // 1 update per second for charting

        return () => clearInterval(interval);
    }, [config.isRunning]);

    const MetricCard = ({ title, value, unit, icon, color }: any) => (
        <div className="flex flex-col p-4 bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] rounded-xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                {React.cloneElement(icon, { className: "w-24 h-24" })}
            </div>
            <div className="flex items-center gap-2 text-[var(--color-text-secondary)] mb-2 z-10">
                {React.cloneElement(icon, { className: `w-4 h-4 ${color}` })}
                <span className="text-sm font-medium">{title}</span>
            </div>
            <div className="flex items-baseline gap-1 z-10">
                <span className="text-3xl font-bold font-mono tracking-tight text-[var(--color-text-primary)]">
                    {typeof value === 'number' ?
                        (value % 1 === 0 ? value : value.toFixed(1))
                        : value}
                </span>
                <span className="text-sm font-medium text-[var(--color-text-muted)]">{unit}</span>
            </div>
        </div>
    );

    return (
        <div className="flex h-full w-full overflow-hidden bg-[var(--color-bg-panel)] p-4 gap-4">
            {/* Cards Column */}
            <div className="w-80 flex flex-col gap-3 shrink-0">
                <div className="flex gap-3">
                    <div className="flex-1">
                        <MetricCard
                            title="Throughput"
                            value={metrics.throughput}
                            unit="req/s"
                            icon={<Zap />}
                            color="text-brand"
                        />
                    </div>
                    <div className="flex-1">
                        <MetricCard
                            title="Error Rate"
                            value={metrics.errorRate * 100}
                            unit="%"
                            icon={<AlertCircle />}
                            color="text-[var(--color-status-red)]"
                        />
                    </div>
                </div>
                <div className="flex gap-3">
                    <div className="flex-1">
                        <MetricCard
                            title="Avg Latency"
                            value={metrics.avgLatency}
                            unit="ms"
                            icon={<Clock />}
                            color="text-[var(--color-status-yellow)]"
                        />
                    </div>
                    <div className="flex-1">
                        <MetricCard
                            title="Active Reqs"
                            value={metrics.activeRequests}
                            unit="reqs"
                            icon={<Activity />}
                            color="text-[var(--color-status-green)]"
                        />
                    </div>
                </div>
            </div>

            {/* Chart Column */}
            <div className="flex-1 min-w-0 flex gap-4 h-full">
                {/* RPS Chart */}
                <div className="flex-1 h-full bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] rounded-xl p-4 flex flex-col pb-6">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-4">Traffic (RPS)</h3>
                    <div className="flex-1 w-full h-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={history} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRps" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-brand-500)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--color-brand-500)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} />
                                <XAxis dataKey="time" stroke="var(--color-text-muted)" fontSize={10} tickMargin={10} minTickGap={30} />
                                <YAxis stroke="var(--color-text-muted)" fontSize={10} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--color-bg-panel)', borderColor: 'var(--color-border-subtle)', borderRadius: '8px' }}
                                    itemStyle={{ color: 'var(--color-text-primary)' }}
                                />
                                <Area type="monotone" dataKey="rps" stroke="var(--color-brand-500)" strokeWidth={2} fillOpacity={1} fill="url(#colorRps)" isAnimationActive={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Latency Chart */}
                <div className="flex-1 h-full bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] rounded-xl p-4 flex flex-col pb-6">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-4">Avg Latency (ms)</h3>
                    <div className="flex-1 w-full h-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={history} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorLat" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-status-yellow)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--color-status-yellow)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} />
                                <XAxis dataKey="time" stroke="var(--color-text-muted)" fontSize={10} tickMargin={10} minTickGap={30} />
                                <YAxis stroke="var(--color-text-muted)" fontSize={10} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--color-bg-panel)', borderColor: 'var(--color-border-subtle)', borderRadius: '8px' }}
                                    itemStyle={{ color: 'var(--color-text-primary)' }}
                                />
                                <Area type="monotone" dataKey="latency" stroke="var(--color-status-yellow)" strokeWidth={2} fillOpacity={1} fill="url(#colorLat)" isAnimationActive={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

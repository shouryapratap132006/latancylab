import React from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { Sidebar } from './components/layout/Sidebar';
import { PropertiesPanel } from './features/properties/PropertiesPanel';
import { MetricsDashboard } from './features/metrics/MetricsDashboard';
import { Canvas } from './features/canvas/Canvas';

function App() {
  return (
    <MainLayout
      sidebar={<Sidebar />}
      propertiesPanel={<PropertiesPanel />}
      metricsDashboard={<MetricsDashboard />}
    >
      <Canvas />
    </MainLayout>
  );
}

export default App;

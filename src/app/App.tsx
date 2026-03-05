import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import LoadingSpinner from '../components/LoadingSpinner';

// Lazy load feature components for performance optimization
const Dashboard = lazy(() => import('../features/dashboard/Dashboard'));
const Converter = lazy(() => import('../features/converter/Converter'));
const Notes = lazy(() => import('../features/notes/Notes'));
const SystemInfo = lazy(() => import('../features/system-info/SystemInfo'));
const AIChat = lazy(() => import('../features/ai-chat/AIChat'));
const Terminal = lazy(() => import('../features/terminal/Terminal'));

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="converter" element={<Converter />} />
            <Route path="notes" element={<Notes />} />
            <Route path="system" element={<SystemInfo />} />
            <Route path="ai-chat" element={<AIChat />} />
            <Route path="terminal" element={<Terminal />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;

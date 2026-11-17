import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfilePage from './pages/ProfilePage';
import AuthPage from './pages/AuthPage';
import { RefreshCw } from 'lucide-react';

export default function App() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'analytics' | 'profile'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black text-black dark:text-white font-mono text-xs">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold tracking-tighter text-sm animate-pulse">
            //
          </div>
          <div className="flex items-center gap-2 text-neutral-400">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Initializing Aura.Cal...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors">
        <Navbar activeTab="" setActiveTab={() => {}} />
        <main>
          <AuthPage />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors flex flex-col">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'analytics' && <AnalyticsPage />}
        {activeTab === 'profile' && <ProfilePage />}
      </main>

      {/* Footer */}
      <footer className="border-t border-black/10 dark:border-white/10 py-6 text-center font-mono text-[11px] text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-black dark:text-white">Calorie tracker - AI powered</span>
          </div>
          <div>
            AI Vision Nutrition Analysis
          </div>
        </div>
      </footer>
    </div>
  );
}

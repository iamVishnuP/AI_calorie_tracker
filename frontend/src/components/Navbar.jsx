import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Sun, Moon, LogOut, User, Activity, BarChart3, Flame 
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 dark:border-white/10 bg-white/80 dark:bg-black/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Title */}
        <div className="flex items-center gap-8">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-sm transition-transform group-hover:scale-105">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <span className="font-mono font-bold tracking-tight text-base text-black dark:text-white">
                Calorie tracker - AI powered
              </span>
            </div>
          </button>

          {/* Navigation Links */}
          {user && (
            <nav className="hidden md:flex items-center gap-1 font-mono text-xs uppercase tracking-wider">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                  activeTab === 'dashboard'
                    ? 'bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white font-semibold'
                    : 'text-neutral-500 hover:text-black dark:hover:text-white'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                  activeTab === 'analytics'
                    ? 'bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white font-semibold'
                    : 'text-neutral-500 hover:text-black dark:hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Analytics
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                  activeTab === 'profile'
                    ? 'bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white font-semibold'
                    : 'text-neutral-500 hover:text-black dark:hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                Targets & Profile
              </button>
            </nav>
          )}
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dark / Light Toggle */}
          <button
            onClick={toggleTheme}
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            className="p-2 rounded-lg border border-black/10 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors text-black dark:text-white"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-black/10 dark:border-white/10">
              <button
                onClick={() => setActiveTab('profile')}
                className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
              >
                <span className="w-2 h-2 rounded-full bg-black dark:bg-white inline-block"></span>
                {user.username}
              </button>
              <button
                onClick={logout}
                title="Log out"
                className="p-2 rounded-lg border border-transparent hover:border-black/10 dark:hover:border-white/10 text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      {user && (
        <div className="md:hidden flex items-center justify-around border-t border-black/10 dark:border-white/10 py-2 px-4 bg-white dark:bg-black font-mono text-[11px] uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1 py-1 px-3 rounded ${activeTab === 'dashboard' ? 'bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white font-bold' : 'text-neutral-500'}`}
          >
            <Activity className="w-3.5 h-3.5" /> Dashboard
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-1 py-1 px-3 rounded ${activeTab === 'analytics' ? 'bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white font-bold' : 'text-neutral-500'}`}
          >
            <BarChart3 className="w-3.5 h-3.5" /> Analytics
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-1 py-1 px-3 rounded ${activeTab === 'profile' ? 'bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white font-bold' : 'text-neutral-500'}`}
          >
            <User className="w-3.5 h-3.5" /> Targets & Profile
          </button>
        </div>
      )}
    </header>
  );
}

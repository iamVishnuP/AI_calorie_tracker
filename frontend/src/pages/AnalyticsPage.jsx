import React, { useState, useEffect } from 'react';
import api from '../api';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine, Legend 
} from 'recharts';
import { useTheme } from '../context/ThemeContext';
import { 
  BarChart3, TrendingUp, Target, Award, Calendar, 
  RefreshCw, PieChart 
} from 'lucide-react';

export default function AnalyticsPage() {
  const { isDark } = useTheme();
  const [period, setPeriod] = useState('daily'); // 'daily' | 'monthly' | 'yearly'
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async (selectedPeriod) => {
    setLoading(true);
    try {
      const res = await api.get(`/analytics/?period=${selectedPeriod}`);
      setData(res.data);
    } catch (err) {
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(period);
  }, [period]);

  const strokeColor = isDark ? '#ffffff' : '#000000';
  const gridColor = isDark ? '#262626' : '#e5e5e5';
  const textColor = isDark ? '#a3a3a3' : '#737373';
  const tooltipBg = isDark ? '#0a0a0a' : '#ffffff';
  const tooltipBorder = isDark ? '#404040' : '#d4d4d4';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      
      {/* Header & Period Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/10 dark:border-white/10 font-mono">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Calorie & Macro Analytics
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Historical trends, intake averages, and goal compliance
          </p>
        </div>

        {/* Timeframe Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-xs">
          <button
            onClick={() => setPeriod('daily')}
            className={`px-3 py-1.5 rounded-lg uppercase tracking-wider transition-all ${
              period === 'daily'
                ? 'bg-black dark:bg-white text-white dark:text-black font-bold shadow-sm'
                : 'text-neutral-500 hover:text-black dark:hover:text-white'
            }`}
          >
            14 Days
          </button>
          <button
            onClick={() => setPeriod('monthly')}
            className={`px-3 py-1.5 rounded-lg uppercase tracking-wider transition-all ${
              period === 'monthly'
                ? 'bg-black dark:bg-white text-white dark:text-black font-bold shadow-sm'
                : 'text-neutral-500 hover:text-black dark:hover:text-white'
            }`}
          >
            30 Days
          </button>
          <button
            onClick={() => setPeriod('yearly')}
            className={`px-3 py-1.5 rounded-lg uppercase tracking-wider transition-all ${
              period === 'yearly'
                ? 'bg-black dark:bg-white text-white dark:text-black font-bold shadow-sm'
                : 'text-neutral-500 hover:text-black dark:hover:text-white'
            }`}
          >
            Yearly (12M)
          </button>
        </div>
      </div>

      {loading && !data ? (
        <div className="py-24 flex flex-col items-center justify-center font-mono text-xs text-neutral-400 space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin text-black dark:text-white" />
          <span>Crunching nutrition analytics...</span>
        </div>
      ) : data ? (
        <>
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 shadow-sm">
              <div className="flex items-center justify-between text-neutral-400 text-[10px] uppercase tracking-wider mb-1">
                <span>Avg Daily Calories</span>
                <TrendingUp className="w-4 h-4 text-black dark:text-white" />
              </div>
              <div className="text-2xl font-black text-black dark:text-white">
                {Math.round(data.summary.avg_daily_calories)} <span className="text-xs font-normal text-neutral-400">kcal</span>
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">
                Target: {data.summary.target_calories} kcal
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 shadow-sm">
              <div className="flex items-center justify-between text-neutral-400 text-[10px] uppercase tracking-wider mb-1">
                <span>Total Consumed</span>
                <Calendar className="w-4 h-4 text-black dark:text-white" />
              </div>
              <div className="text-2xl font-black text-black dark:text-white">
                {Math.round(data.summary.total_calories).toLocaleString()} <span className="text-xs font-normal text-neutral-400">kcal</span>
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">
                Across tracked entries
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 shadow-sm">
              <div className="flex items-center justify-between text-neutral-400 text-[10px] uppercase tracking-wider mb-1">
                <span>Protein Intake</span>
                <Award className="w-4 h-4 text-black dark:text-white" />
              </div>
              <div className="text-2xl font-black text-black dark:text-white">
                {Math.round(data.summary.total_macros.protein).toLocaleString()} <span className="text-xs font-normal text-neutral-400">g</span>
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">
                ~{Math.round(data.summary.total_macros.protein * 4).toLocaleString()} kcal
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 shadow-sm">
              <div className="flex items-center justify-between text-neutral-400 text-[10px] uppercase tracking-wider mb-1">
                <span>Carbs & Fats</span>
                <Target className="w-4 h-4 text-black dark:text-white" />
              </div>
              <div className="text-2xl font-black text-black dark:text-white">
                {Math.round(data.summary.total_macros.carbs)}g / {Math.round(data.summary.total_macros.fat)}g
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">
                Carb / Fat intake
              </div>
            </div>
          </div>

          {/* Primary Trend Chart */}
          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 shadow-sm space-y-4">
            <div className="flex items-center justify-between font-mono">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                  Calorie Intake History
                </h3>
                <span className="text-[11px] text-neutral-400">
                  {period === 'daily' && 'Daily calories vs. daily goal (Last 14 days)'}
                  {period === 'monthly' && 'Daily calories over the last 30 days'}
                  {period === 'yearly' && 'Monthly totals and averages for this year'}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-black dark:bg-white"></div>
                  <span className="text-neutral-500 text-[11px]">Intake</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 border-t border-dashed border-neutral-400"></div>
                  <span className="text-neutral-500 text-[11px]">Target Goal</span>
                </div>
              </div>
            </div>

            <div className="h-80 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.chart_data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="monoGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={strokeColor} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis 
                    dataKey="label" 
                    stroke={textColor} 
                    tick={{ fill: textColor, fontSize: 11, fontFamily: 'JetBrains Mono' }} 
                  />
                  <YAxis 
                    stroke={textColor} 
                    tick={{ fill: textColor, fontSize: 11, fontFamily: 'JetBrains Mono' }} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: tooltipBg, 
                      borderColor: tooltipBorder, 
                      borderRadius: '0.75rem',
                      fontFamily: 'JetBrains Mono',
                      fontSize: '12px'
                    }} 
                    itemStyle={{ color: strokeColor }}
                  />
                  <ReferenceLine 
                    y={data.summary.target_calories} 
                    stroke={textColor} 
                    strokeDasharray="4 4" 
                    label={{ value: 'Target', fill: textColor, fontSize: 10, position: 'right' }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey={period === 'yearly' ? 'total_calories' : 'calories'} 
                    name="Calories (kcal)"
                    stroke={strokeColor} 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#monoGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Secondary Chart: Macronutrient Distribution */}
          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 shadow-sm space-y-4">
            <div className="font-mono">
              <h3 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                Macronutrient Breakdown (Protein, Carbs, Fat)
              </h3>
              <span className="text-[11px] text-neutral-400">
                Grams consumed per period
              </span>
            </div>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.chart_data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis 
                    dataKey="label" 
                    stroke={textColor} 
                    tick={{ fill: textColor, fontSize: 11, fontFamily: 'JetBrains Mono' }} 
                  />
                  <YAxis 
                    stroke={textColor} 
                    tick={{ fill: textColor, fontSize: 11, fontFamily: 'JetBrains Mono' }} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: tooltipBg, 
                      borderColor: tooltipBorder, 
                      borderRadius: '0.75rem',
                      fontFamily: 'JetBrains Mono',
                      fontSize: '12px'
                    }} 
                  />
                  <Legend wrapperStyle={{ fontFamily: 'JetBrains Mono', fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="protein" name="Protein (g)" fill={isDark ? '#e5e5e5' : '#262626'} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="carbs" name="Carbs (g)" fill={isDark ? '#a3a3a3' : '#737373'} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="fat" name="Fat (g)" fill={isDark ? '#525252' : '#d4d4d4'} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : null}

    </div>
  );
}

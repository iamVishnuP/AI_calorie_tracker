import React from 'react';
import { Flame, CheckCircle2 } from 'lucide-react';

export default function CalorieRing({ consumed = 0, target = 2000, remaining = 0 }) {
  const percentage = target > 0 ? Math.min(100, Math.round((consumed / target) * 100)) : 0;
  const isOver = consumed > target;
  const size = 180;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-2xl shadow-sm">
      <div className="relative flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-neutral-200 dark:stroke-neutral-800"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Active Fill Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-black dark:stroke-white transition-all duration-700 ease-out"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute flex flex-col items-center text-center">
          <Flame className="w-5 h-5 mb-1 text-neutral-400 dark:text-neutral-500" />
          <span className="font-mono text-3xl font-extrabold tracking-tight text-black dark:text-white">
            {Math.round(consumed)}
          </span>
          <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-400">
            / {target} kcal
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between w-full px-2 pt-3 border-t border-black/5 dark:border-white/5 text-xs font-mono">
        <div className="text-left">
          <div className="text-neutral-400 uppercase text-[10px] tracking-wider">Remaining</div>
          <div className="font-bold text-black dark:text-white text-sm">
            {isOver ? `+${Math.round(consumed - target)}` : Math.round(remaining)} <span className="text-[10px] font-normal">kcal</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-neutral-400 uppercase text-[10px] tracking-wider">Progress</div>
          <div className="font-bold text-black dark:text-white text-sm">
            {percentage}%
          </div>
        </div>
      </div>
    </div>
  );
}

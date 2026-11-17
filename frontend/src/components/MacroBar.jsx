import React from 'react';

export default function MacroBar({ totals = {}, targets = {} }) {
  const macros = [
    {
      name: 'Protein',
      consumed: totals.protein || 0,
      target: targets.protein || 150,
      unit: 'g',
      kcalPerGram: 4,
    },
    {
      name: 'Carbs',
      consumed: totals.carbs || 0,
      target: targets.carbs || 220,
      unit: 'g',
      kcalPerGram: 4,
    },
    {
      name: 'Fat',
      consumed: totals.fat || 0,
      target: targets.fat || 65,
      unit: 'g',
      kcalPerGram: 9,
    },
  ];

  return (
    <div className="p-6 bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-2xl shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
        <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-black dark:text-white">
          Macronutrient Breakdown
        </h3>
        <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
          Target vs Actual
        </span>
      </div>

      <div className="space-y-4 my-auto pt-3">
        {macros.map((m) => {
          const pct = m.target > 0 ? Math.min(100, Math.round((m.consumed / m.target) * 100)) : 0;
          return (
            <div key={m.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-semibold text-black dark:text-white">
                  {m.name}
                </span>
                <span className="text-neutral-500 text-[11px]">
                  <strong className="text-black dark:text-white">{Math.round(m.consumed)}</strong> / {m.target}{m.unit} ({pct}%)
                </span>
              </div>
              
              {/* Sleek monochrome bar */}
              <div className="w-full h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                <div 
                  className="h-full bg-black dark:bg-white rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-black/5 dark:border-white/5 text-center text-xs font-mono">
        <div className="p-2 rounded bg-neutral-50 dark:bg-neutral-900">
          <div className="text-[10px] text-neutral-400 uppercase">Protein</div>
          <div className="font-bold text-black dark:text-white">{Math.round((totals.protein || 0) * 4)} kcal</div>
        </div>
        <div className="p-2 rounded bg-neutral-50 dark:bg-neutral-900">
          <div className="text-[10px] text-neutral-400 uppercase">Carbs</div>
          <div className="font-bold text-black dark:text-white">{Math.round((totals.carbs || 0) * 4)} kcal</div>
        </div>
        <div className="p-2 rounded bg-neutral-50 dark:bg-neutral-900">
          <div className="text-[10px] text-neutral-400 uppercase">Fat</div>
          <div className="font-bold text-black dark:text-white">{Math.round((totals.fat || 0) * 9)} kcal</div>
        </div>
      </div>
    </div>
  );
}

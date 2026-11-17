import React from 'react';
import { Plus, Camera, Trash2, Sparkles, Utensils } from 'lucide-react';

export default function MealSection({ 
  mealKey, 
  title, 
  icon: Icon = Utensils,
  data = { items: [], calories: 0, protein: 0, carbs: 0, fat: 0 }, 
  onAddManual, 
  onOpenScanner,
  onDeleteItem 
}) {
  return (
    <div className="bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-2xl p-5 shadow-sm transition-all hover:border-black/30 dark:hover:border-white/30">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-black/5 dark:border-white/5">
            <Icon className="w-4 h-4 text-black dark:text-white" />
          </div>
          <div>
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-black dark:text-white">
              {title}
            </h3>
            <span className="text-[11px] font-mono text-neutral-400">
              {data.items.length} {data.items.length === 1 ? 'item' : 'items'} logged
            </span>
          </div>
        </div>

        {/* Calories and macros badge */}
        <div className="text-right font-mono">
          <div className="text-base font-extrabold text-black dark:text-white">
            {Math.round(data.calories)} <span className="text-xs font-normal text-neutral-400">kcal</span>
          </div>
          <div className="text-[10px] text-neutral-400 space-x-1">
            <span>P:{Math.round(data.protein)}g</span>
            <span>•</span>
            <span>C:{Math.round(data.carbs)}g</span>
            <span>•</span>
            <span>F:{Math.round(data.fat)}g</span>
          </div>
        </div>
      </div>

      {/* Food Items List */}
      <div className="py-3 space-y-2 min-h-[60px]">
        {data.items.length === 0 ? (
          <div className="py-6 text-center text-xs font-mono text-neutral-400 dark:text-neutral-600">
            No items logged yet
          </div>
        ) : (
          data.items.map((item) => (
            <div 
              key={item.id}
              className="group flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-900/50 border border-transparent hover:border-black/10 dark:hover:border-white/10 transition-colors"
            >
              <div className="flex items-center gap-2 overflow-hidden pr-2">
                {item.is_ai_scanned && (
                  <span title="Scanned with AI Vision" className="flex-shrink-0 text-black dark:text-white">
                    <Sparkles className="w-3.5 h-3.5" />
                  </span>
                )}
                <div className="truncate">
                  <div className="font-mono text-xs font-medium text-black dark:text-white truncate">
                    {item.name}
                  </div>
                  <div className="text-[10px] font-mono text-neutral-400">
                    {item.serving_size} {item.grams ? `(${item.grams}g)` : ''} • P:{Math.round(item.protein)}g C:{Math.round(item.carbs)}g F:{Math.round(item.fat)}g
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0 font-mono">
                <span className="text-xs font-bold text-black dark:text-white">
                  {Math.round(item.calories)} kcal
                </span>
                <button
                  onClick={() => onDeleteItem(item.id)}
                  title="Remove item"
                  className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-400 hover:text-black dark:hover:text-white transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Actions */}
      <div className="pt-3 border-t border-black/5 dark:border-white/5 flex items-center gap-2 font-mono text-xs">
        <button
          onClick={() => onAddManual(mealKey)}
          className="flex-1 py-2 px-3 rounded-xl border border-black/10 dark:border-white/10 hover:border-black/40 dark:hover:border-white/40 bg-transparent hover:bg-neutral-50 dark:hover:bg-neutral-900 text-black dark:text-white flex items-center justify-center gap-1.5 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Manual</span>
        </button>
        <button
          onClick={() => onOpenScanner(mealKey)}
          className="flex-1 py-2 px-3 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:opacity-90 flex items-center justify-center gap-1.5 font-semibold transition-all shadow-sm"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Scan Food</span>
        </button>
      </div>

    </div>
  );
}

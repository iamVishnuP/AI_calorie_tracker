import React, { useState } from 'react';
import { X, Plus, Calculator } from 'lucide-react';

export default function AddFoodModal({ isOpen, onClose, defaultMeal = 'breakfast', onSave }) {
  const [mealType, setMealType] = useState(defaultMeal);
  const [formData, setFormData] = useState({
    name: '',
    serving_size: '1 serving',
    grams: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const autoCalculateCalories = () => {
    const p = parseFloat(formData.protein) || 0;
    const c = parseFloat(formData.carbs) || 0;
    const f = parseFloat(formData.fat) || 0;
    const calc = Math.round((p * 4) + (c * 4) + (f * 9));
    setFormData((prev) => ({ ...prev, calories: calc.toString() }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Please provide a food name.');
      return;
    }
    const cal = parseFloat(formData.calories);
    if (isNaN(cal) || cal < 0) {
      setError('Please enter valid calories.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await onSave({
        meal_type: mealType,
        name: formData.name.trim(),
        serving_size: formData.serving_size.trim() || '1 serving',
        grams: formData.grams ? parseFloat(formData.grams) : null,
        calories: cal,
        protein: parseFloat(formData.protein) || 0,
        carbs: parseFloat(formData.carbs) || 0,
        fat: parseFloat(formData.fat) || 0,
        is_ai_scanned: false,
      });
      onClose();
    } catch (err) {
      setError('Failed to save food entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-neutral-950 border border-black/20 dark:border-white/20 rounded-2xl shadow-2xl p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10">
          <div>
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-black dark:text-white">
              Log Food Manually
            </h3>
            <p className="text-xs text-neutral-400 font-mono mt-0.5">
              Enter nutritional data directly
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs font-mono text-red-500">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 font-mono text-xs">
          
          {/* Meal Category Select */}
          <div>
            <label className="block uppercase tracking-wider text-neutral-500 mb-1">
              Meal Category
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setMealType(type)}
                  className={`py-2 px-1 text-center capitalize rounded-lg border transition-all ${
                    mealType === type
                      ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white font-bold'
                      : 'border-black/10 dark:border-white/10 text-neutral-500 hover:text-black dark:hover:text-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Food Name */}
          <div>
            <label className="block uppercase tracking-wider text-neutral-500 mb-1">
              Food Item Name *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Grilled Chicken Breast, Oatmeal"
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-black/20 dark:border-white/20 rounded-lg text-black dark:text-white placeholder:text-neutral-400 focus:border-black dark:focus:border-white"
            />
          </div>

          {/* Serving info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block uppercase tracking-wider text-neutral-500 mb-1">
                Serving Size Description
              </label>
              <input
                type="text"
                name="serving_size"
                value={formData.serving_size}
                onChange={handleChange}
                placeholder="1 cup / 1 slice / 1 bowl"
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-black/20 dark:border-white/20 rounded-lg text-black dark:text-white placeholder:text-neutral-400 focus:border-black dark:focus:border-white"
              />
            </div>
            <div>
              <label className="block uppercase tracking-wider text-neutral-500 mb-1">
                Weight in Grams (Optional)
              </label>
              <input
                type="number"
                name="grams"
                value={formData.grams}
                onChange={handleChange}
                placeholder="150"
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-black/20 dark:border-white/20 rounded-lg text-black dark:text-white placeholder:text-neutral-400 focus:border-black dark:focus:border-white"
              />
            </div>
          </div>

          {/* Calories with auto-calculate helper */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="uppercase tracking-wider text-neutral-500">
                Calories (kcal) *
              </label>
              <button
                type="button"
                onClick={autoCalculateCalories}
                className="text-[10px] text-neutral-500 hover:text-black dark:hover:text-white flex items-center gap-1 underline"
              >
                <Calculator className="w-3 h-3" /> Auto-calc from macros
              </button>
            </div>
            <input
              type="number"
              step="0.1"
              required
              name="calories"
              value={formData.calories}
              onChange={handleChange}
              placeholder="e.g., 250"
              className="w-full px-3 py-2 font-bold text-sm bg-neutral-50 dark:bg-neutral-900 border border-black/20 dark:border-white/20 rounded-lg text-black dark:text-white placeholder:text-neutral-400 focus:border-black dark:focus:border-white"
            />
          </div>

          {/* Macronutrients */}
          <div>
            <label className="block uppercase tracking-wider text-neutral-500 mb-1">
              Macros (Grams)
            </label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <span className="text-[10px] text-neutral-400 block mb-0.5">Protein (g)</span>
                <input
                  type="number"
                  step="0.1"
                  name="protein"
                  value={formData.protein}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-black/20 dark:border-white/20 rounded-lg text-black dark:text-white"
                />
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 block mb-0.5">Carbs (g)</span>
                <input
                  type="number"
                  step="0.1"
                  name="carbs"
                  value={formData.carbs}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-black/20 dark:border-white/20 rounded-lg text-black dark:text-white"
                />
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 block mb-0.5">Fat (g)</span>
                <input
                  type="number"
                  step="0.1"
                  name="fat"
                  value={formData.fat}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-black/20 dark:border-white/20 rounded-lg text-black dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/10 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-black/10 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 font-bold rounded-xl bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{loading ? 'Adding...' : 'Add to Log'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

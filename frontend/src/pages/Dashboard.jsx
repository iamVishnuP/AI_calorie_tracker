import React, { useState, useEffect } from 'react';
import api from '../api';
import CalorieRing from '../components/CalorieRing';
import MacroBar from '../components/MacroBar';
import MealSection from '../components/MealSection';
import AddFoodModal from '../components/AddFoodModal';
import AiScannerModal from '../components/AiScannerModal';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, 
  Sparkles, Plus, Coffee, Sun, Sunset, Cookie, RefreshCw 
} from 'lucide-react';

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [scannerModalOpen, setScannerModalOpen] = useState(false);
  const [activeMealType, setActiveMealType] = useState('breakfast');

  const fetchSummary = async (dateStr) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/meals/summary/?date=${dateStr}`);
      setSummaryData(res.data);
    } catch (err) {
      console.error('Error fetching summary:', err);
      setError('Failed to load food log for this day.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary(selectedDate);
  }, [selectedDate]);

  const changeDateBy = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const setDateToToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const handleOpenManual = (mealType) => {
    setActiveMealType(mealType || 'breakfast');
    setManualModalOpen(true);
  };

  const handleOpenScanner = (mealType) => {
    setActiveMealType(mealType || 'lunch');
    setScannerModalOpen(true);
  };

  const handleSaveManual = async (foodData) => {
    // Create a meal log with this single item
    await api.post('/meals/logs/', {
      meal_type: foodData.meal_type,
      date: selectedDate,
      items: [foodData],
    });
    await fetchSummary(selectedDate);
  };

  const handleSaveScannedMeal = async (mealPayload) => {
    await api.post('/meals/logs/', {
      meal_type: mealPayload.meal_type,
      date: selectedDate,
      notes: mealPayload.notes,
      items: mealPayload.items,
    });
    await fetchSummary(selectedDate);
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await api.delete(`/meals/items/${itemId}/`);
      await fetchSummary(selectedDate);
    } catch (err) {
      console.error('Delete item failed:', err);
    }
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  const formatDisplayDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      
      {/* Date Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/10 dark:border-white/10">
        
        {/* Date Navigator */}
        <div className="flex items-center gap-2 font-mono">
          <button
            onClick={() => changeDateBy(-1)}
            className="p-2 rounded-xl border border-black/10 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4 text-black dark:text-white" />
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-neutral-900/50">
            <CalendarIcon className="w-4 h-4 text-neutral-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-black dark:text-white uppercase tracking-wider cursor-pointer"
            />
          </div>

          <button
            onClick={() => changeDateBy(1)}
            className="p-2 rounded-xl border border-black/10 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4 text-black dark:text-white" />
          </button>

          {!isToday && (
            <button
              onClick={setDateToToday}
              className="text-xs px-2.5 py-1.5 rounded-xl border border-black/10 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-500 hover:text-black dark:hover:text-white"
            >
              Today
            </button>
          )}
        </div>

        {/* Global Quick Action Buttons */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => handleOpenManual('lunch')}
            className="px-4 py-2.5 rounded-xl border border-black/20 dark:border-white/20 hover:border-black dark:hover:border-white hover:bg-neutral-50 dark:hover:bg-neutral-900 text-black dark:text-white font-semibold flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Quick Log</span>
          </button>

          <button
            onClick={() => handleOpenScanner('lunch')}
            className="px-4 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:opacity-90 font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Scan Food (AI)</span>
          </button>
        </div>

      </div>

      {loading && !summaryData ? (
        <div className="py-20 flex flex-col items-center justify-center font-mono text-xs text-neutral-400 space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin text-black dark:text-white" />
          <span>Loading nutrition metrics...</span>
        </div>
      ) : summaryData ? (
        <>
          {/* Top Overview: Calorie Ring & Macro Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CalorieRing
              consumed={summaryData.totals.calories}
              target={summaryData.targets.calories}
              remaining={summaryData.remaining_calories}
            />
            <MacroBar
              totals={summaryData.totals}
              targets={summaryData.targets}
            />
          </div>

          {/* Meals Section: Breakfast, Lunch, Dinner, Snacks */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                Daily Meal Breakdown • {formatDisplayDate(selectedDate)}
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MealSection
                mealKey="breakfast"
                title="Breakfast"
                icon={Coffee}
                data={summaryData.meals.breakfast}
                onAddManual={handleOpenManual}
                onOpenScanner={handleOpenScanner}
                onDeleteItem={handleDeleteItem}
              />
              <MealSection
                mealKey="lunch"
                title="Lunch"
                icon={Sun}
                data={summaryData.meals.lunch}
                onAddManual={handleOpenManual}
                onOpenScanner={handleOpenScanner}
                onDeleteItem={handleDeleteItem}
              />
              <MealSection
                mealKey="dinner"
                title="Dinner"
                icon={Sunset}
                data={summaryData.meals.dinner}
                onAddManual={handleOpenManual}
                onOpenScanner={handleOpenScanner}
                onDeleteItem={handleDeleteItem}
              />
              <MealSection
                mealKey="snack"
                title="Snacks"
                icon={Cookie}
                data={summaryData.meals.snack}
                onAddManual={handleOpenManual}
                onOpenScanner={handleOpenScanner}
                onDeleteItem={handleDeleteItem}
              />
            </div>
          </div>
        </>
      ) : null}

      {/* Modals */}
      <AddFoodModal
        isOpen={manualModalOpen}
        onClose={() => setManualModalOpen(false)}
        defaultMeal={activeMealType}
        onSave={handleSaveManual}
      />

      <AiScannerModal
        isOpen={scannerModalOpen}
        onClose={() => setScannerModalOpen(false)}
        defaultMeal={activeMealType}
        onSaveMeal={handleSaveScannedMeal}
      />

    </div>
  );
}

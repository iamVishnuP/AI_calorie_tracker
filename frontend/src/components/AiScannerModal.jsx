import React, { useState, useRef } from 'react';
import api from '../api';
import { 
  Camera, Upload, Sparkles, Check, Trash2, Plus, 
  RefreshCw, AlertCircle, Info, ChevronRight, X 
} from 'lucide-react';

export default function AiScannerModal({ isOpen, onClose, defaultMeal = 'lunch', onSaveMeal }) {
  const fileInputRef = useRef(null);

  const [step, setStep] = useState('upload'); // 'upload' | 'analyzing' | 'review'
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [mealType, setMealType] = useState(defaultMeal);
  
  // Scanned results for review
  const [dishName, setDishName] = useState('');
  const [healthInsights, setHealthInsights] = useState('');
  const [detectedItems, setDetectedItems] = useState([]);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleFileSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file (JPG, PNG, WEBP).');
      return;
    }
    setError('');
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
      triggerAnalysis(file);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const triggerAnalysis = async (file) => {
    setStep('analyzing');
    setError('');
    setNotice('');

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await api.post('/scanner/analyze-image/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const data = res.data;
      setDishName(data.dish_name || 'Detected Meal');
      setHealthInsights(data.health_insights || '');
      setNotice(data.notice || '');

      const items = (data.detected_items || []).map((item, idx) => ({
        id: idx + 1,
        name: item.name || 'Food item',
        serving_size: item.serving_size || '1 serving',
        grams: item.grams || 100,
        calories: item.calories || 0,
        protein: item.protein || 0,
        carbs: item.carbs || 0,
        fat: item.fat || 0,
        confidence: item.confidence || 'high',
      }));

      setDetectedItems(items);
      setStep('review');
    } catch (err) {
      console.error('Scan error:', err);
      setError(err.response?.data?.error || 'Failed to analyze food image. Please try again.');
      setStep('upload');
    }
  };

  // Item adjustments in Review modal
  const handleItemChange = (index, field, value) => {
    setDetectedItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const removeItem = (index) => {
    setDetectedItems((prev) => prev.filter((_, i) => i !== index));
  };

  const addItem = () => {
    setDetectedItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: 'New item',
        serving_size: '1 serving',
        grams: 100,
        calories: 150,
        protein: 10,
        carbs: 15,
        fat: 5,
        confidence: 'manual',
      },
    ]);
  };

  // Dynamic totals
  const totalCalories = Math.round(detectedItems.reduce((acc, item) => acc + (parseFloat(item.calories) || 0), 0));
  const totalProtein = Math.round(detectedItems.reduce((acc, item) => acc + (parseFloat(item.protein) || 0), 0));
  const totalCarbs = Math.round(detectedItems.reduce((acc, item) => acc + (parseFloat(item.carbs) || 0), 0));
  const totalFat = Math.round(detectedItems.reduce((acc, item) => acc + (parseFloat(item.fat) || 0), 0));

  const handleConfirmSave = async () => {
    if (detectedItems.length === 0) {
      setError('Please have at least one food item in the review list.');
      return;
    }
    setIsSaving(true);
    try {
      await onSaveMeal({
        meal_type: mealType,
        notes: `AI Scanned: ${dishName}`,
        items: detectedItems.map((item) => ({
          name: item.name,
          serving_size: item.serving_size,
          grams: item.grams ? parseFloat(item.grams) : null,
          calories: parseFloat(item.calories) || 0,
          protein: parseFloat(item.protein) || 0,
          carbs: parseFloat(item.carbs) || 0,
          fat: parseFloat(item.fat) || 0,
          is_ai_scanned: true,
        })),
      });
      onClose();
    } catch (err) {
      console.error('Error saving meal:', err);
      const detail = err.response?.data?.error || err.response?.data?.detail || err.message;
      setError(`Failed to save scanned meal to log: ${detail || 'Please try again.'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const resetScanner = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setDetectedItems([]);
    setStep('upload');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-white dark:bg-neutral-950 border border-black/20 dark:border-white/20 rounded-2xl shadow-2xl overflow-hidden font-mono text-xs">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-black/10 dark:border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-black dark:bg-white text-white dark:text-black">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
                AI Vision Food Scanner
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-neutral-100 dark:bg-neutral-900 text-neutral-500 border border-neutral-200 dark:border-neutral-800">
                  Gemini Flash
                </span>
              </h3>
              <p className="text-[11px] text-neutral-400 font-normal">
                {step === 'upload' && 'Upload or snap a photo of your food'}
                {step === 'analyzing' && 'Analyzing food items, portions, and calories...'}
                {step === 'review' && 'Review detected items and adjust portions before saving'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {error && (
            <div className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-red-500 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: UPLOAD / SNAP PHOTO */}
          {step === 'upload' && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-neutral-300 dark:border-neutral-800 hover:border-black dark:hover:border-white rounded-2xl p-10 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 bg-neutral-50/50 dark:bg-neutral-900/30 group"
              >
                <div className="w-14 h-14 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6 text-black dark:text-white" />
                </div>
                <div>
                  <div className="font-bold text-sm text-black dark:text-white">
                    Click to browse or drag & drop food photo
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-1">
                    Supports JPG, PNG, WEBP • Max 10MB
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files?.[0])}
                />
              </div>

              {/* Sample test button for instant evaluation */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 text-[11px]">
                  <Sparkles className="w-4 h-4 text-black dark:text-white" />
                  <span>No photo handy? Test with an instant sample bowl.</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const canvas = document.createElement('canvas');
                    canvas.width = 100;
                    canvas.height = 100;
                    const ctx = canvas.getContext('2d');
                    ctx.fillStyle = '#222';
                    ctx.fillRect(0, 0, 100, 100);
                    canvas.toBlob((blob) => {
                      const sampleFile = new File([blob], 'sample-plate.jpg', { type: 'image/jpeg' });
                      handleFileSelect(sampleFile);
                    }, 'image/jpeg');
                  }}
                  className="px-3 py-1.5 rounded-lg border border-black/20 dark:border-white/20 bg-white dark:bg-black font-semibold text-black dark:text-white hover:opacity-80"
                >
                  Test Sample
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: ANALYZING SPINNER */}
          {step === 'analyzing' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-2 border-neutral-300 dark:border-neutral-800 border-t-black dark:border-t-white animate-spin"></div>
                <Sparkles className="w-6 h-6 text-black dark:text-white absolute inset-0 m-auto" />
              </div>
              <div className="space-y-1">
                <div className="font-bold text-sm text-black dark:text-white">
                  Scanning Nutritional Profile
                </div>
                <div className="text-[11px] text-neutral-400 max-w-xs">
                  Identifying individual ingredients, measuring approximate gram weights, and calculating macros...
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW & EDIT MODAL */}
          {step === 'review' && (
            <div className="space-y-5">
              
              {notice && (
                <div className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 text-[11px] flex items-center gap-2">
                  <Info className="w-4 h-4 flex-shrink-0 text-black dark:text-white" />
                  <span>{notice}</span>
                </div>
              )}

              {/* Photo preview + Meal title banner */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-black/10 dark:border-white/10">
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Scanned Food"
                    className="w-20 h-20 object-cover rounded-lg border border-black/10 dark:border-white/10 flex-shrink-0"
                  />
                )}
                <div className="flex-1 space-y-1">
                  <div className="text-[10px] uppercase tracking-wider text-neutral-400">Detected Dish</div>
                  <input
                    type="text"
                    value={dishName}
                    onChange={(e) => setDishName(e.target.value)}
                    className="font-bold text-base bg-transparent text-black dark:text-white border-b border-transparent hover:border-black/20 dark:hover:border-white/20 focus:border-black dark:focus:border-white w-full"
                  />
                  {healthInsights && (
                    <p className="text-[11px] text-neutral-500 italic mt-1">
                      "{healthInsights}"
                    </p>
                  )}
                </div>

                {/* Target Meal Type Picker */}
                <div className="flex-shrink-0">
                  <label className="block text-[10px] uppercase tracking-wider text-neutral-400 mb-1">
                    Log To
                  </label>
                  <select
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-black border border-black/20 dark:border-white/20 text-black dark:text-white uppercase font-bold text-[11px]"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>
              </div>

              {/* Total Macros Banner */}
              <div className="grid grid-cols-4 gap-2 text-center p-3 rounded-xl bg-black dark:bg-white text-white dark:text-black">
                <div>
                  <div className="text-[10px] opacity-70 uppercase tracking-wider">Calories</div>
                  <div className="font-extrabold text-base">{totalCalories} <span className="text-[10px] font-normal">kcal</span></div>
                </div>
                <div>
                  <div className="text-[10px] opacity-70 uppercase tracking-wider">Protein</div>
                  <div className="font-extrabold text-base">{totalProtein}g</div>
                </div>
                <div>
                  <div className="text-[10px] opacity-70 uppercase tracking-wider">Carbs</div>
                  <div className="font-extrabold text-base">{totalCarbs}g</div>
                </div>
                <div>
                  <div className="text-[10px] opacity-70 uppercase tracking-wider">Fat</div>
                  <div className="font-extrabold text-base">{totalFat}g</div>
                </div>
              </div>

              {/* Detected Items Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-1">
                  <span className="uppercase text-[11px] font-bold text-neutral-500 tracking-wider">
                    Itemized Food Breakdown ({detectedItems.length})
                  </span>
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-[11px] font-semibold text-black dark:text-white hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Item
                  </button>
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {detectedItems.map((item, index) => (
                    <div 
                      key={item.id || index}
                      className="p-3 rounded-xl border border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-neutral-900/40 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                          placeholder="Food name"
                          className="font-semibold text-black dark:text-white bg-transparent border-b border-transparent hover:border-black/20 dark:hover:border-white/20 focus:border-black dark:focus:border-white w-full"
                        />
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-neutral-400 hover:text-red-500 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-5 gap-2">
                        <div className="col-span-2">
                          <span className="text-[9px] text-neutral-400 block mb-0.5">Serving / Weight</span>
                          <input
                            type="text"
                            value={item.serving_size}
                            onChange={(e) => handleItemChange(index, 'serving_size', e.target.value)}
                            className="w-full px-2 py-1 rounded bg-white dark:bg-black border border-black/10 dark:border-white/10 text-[11px]"
                          />
                        </div>
                        <div>
                          <span className="text-[9px] text-neutral-400 block mb-0.5">Calories</span>
                          <input
                            type="number"
                            value={item.calories}
                            onChange={(e) => handleItemChange(index, 'calories', e.target.value)}
                            className="w-full px-2 py-1 rounded bg-white dark:bg-black border border-black/10 dark:border-white/10 text-[11px] font-bold"
                          />
                        </div>
                        <div>
                          <span className="text-[9px] text-neutral-400 block mb-0.5">Prot(g)</span>
                          <input
                            type="number"
                            value={item.protein}
                            onChange={(e) => handleItemChange(index, 'protein', e.target.value)}
                            className="w-full px-2 py-1 rounded bg-white dark:bg-black border border-black/10 dark:border-white/10 text-[11px]"
                          />
                        </div>
                        <div>
                          <span className="text-[9px] text-neutral-400 block mb-0.5">Carb/Fat</span>
                          <div className="flex gap-1">
                            <input
                              type="number"
                              title="Carbs"
                              value={item.carbs}
                              onChange={(e) => handleItemChange(index, 'carbs', e.target.value)}
                              className="w-1/2 px-1 py-1 rounded bg-white dark:bg-black border border-black/10 dark:border-white/10 text-[10px]"
                            />
                            <input
                              type="number"
                              title="Fat"
                              value={item.fat}
                              onChange={(e) => handleItemChange(index, 'fat', e.target.value)}
                              className="w-1/2 px-1 py-1 rounded bg-white dark:bg-black border border-black/10 dark:border-white/10 text-[10px]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-black/10 dark:border-white/10 flex items-center justify-between flex-shrink-0 bg-neutral-50 dark:bg-neutral-900/30">
          {step === 'review' ? (
            <>
              <button
                type="button"
                onClick={resetScanner}
                className="px-3 py-2 rounded-xl border border-black/10 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Scan Another
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-black/10 dark:border-white/10 text-neutral-600 dark:text-neutral-400"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleConfirmSave}
                  className="px-5 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSaving ? 'Logging...' : 'Confirm & Add to Log'}</span>
                </button>
              </div>
            </>
          ) : (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-black/10 dark:border-white/10 text-neutral-600 dark:text-neutral-400"
              >
                Close
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

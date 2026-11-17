import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Activity, Target, Check, RefreshCw, Sparkles, Scale, Trash2, AlertTriangle, X } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateProfile, deleteAccount } = useAuth();
  const profile = user?.profile || {};

  const [formData, setFormData] = useState({
    gender: profile.gender || 'M',
    age: profile.age || 25,
    height_cm: profile.height_cm || 175,
    weight_kg: profile.weight_kg || 70,
    activity_level: profile.activity_level || 'moderate',
    goal_type: profile.goal_type || 'maintain',
    daily_calorie_target: profile.daily_calorie_target || 2000,
    daily_protein_target: profile.daily_protein_target || 150,
    daily_carbs_target: profile.daily_carbs_target || 220,
    daily_fat_target: profile.daily_fat_target || 65,
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user?.profile) {
      setFormData({
        gender: user.profile.gender || 'M',
        age: user.profile.age || 25,
        height_cm: user.profile.height_cm || 175,
        weight_kg: user.profile.weight_kg || 70,
        activity_level: user.profile.activity_level || 'moderate',
        goal_type: user.profile.goal_type || 'maintain',
        daily_calorie_target: user.profile.daily_calorie_target || 2000,
        daily_protein_target: user.profile.daily_protein_target || 150,
        daily_carbs_target: user.profile.daily_carbs_target || 220,
        daily_fat_target: user.profile.daily_fat_target || 65,
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRecalculateTargets = () => {
    const w = parseFloat(formData.weight_kg) || 70;
    const h = parseFloat(formData.height_cm) || 175;
    const a = parseFloat(formData.age) || 25;

    let bmr = (10 * w) + (6.25 * h) - (5 * a);
    if (formData.gender === 'M') bmr += 5;
    else if (formData.gender === 'F') bmr -= 161;
    else bmr -= 78;

    const multipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      very_active: 1.725,
      extra_active: 1.9,
    };
    const mult = multipliers[formData.activity_level] || 1.55;
    const tdee = bmr * mult;

    let calories = Math.round(tdee);
    if (formData.goal_type === 'lose') calories = Math.max(1200, Math.round(tdee - 500));
    if (formData.goal_type === 'gain') calories = Math.round(tdee + 500);

    const protein = Math.round((calories * 0.30) / 4);
    const carbs = Math.round((calories * 0.45) / 4);
    const fat = Math.round((calories * 0.25) / 9);

    setFormData((prev) => ({
      ...prev,
      daily_calorie_target: calories,
      daily_protein_target: protein,
      daily_carbs_target: carbs,
      daily_fat_target: fat,
    }));

    setSuccessMsg('Targets recomputed using Mifflin-St Jeor equation!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    // Ensure all numeric values are properly cast
    const cleanedPayload = {
      gender: formData.gender,
      age: parseInt(formData.age, 10) || 25,
      height_cm: parseFloat(formData.height_cm) || 175.0,
      weight_kg: parseFloat(formData.weight_kg) || 70.0,
      activity_level: formData.activity_level,
      goal_type: formData.goal_type,
      daily_calorie_target: parseInt(formData.daily_calorie_target, 10) || 2000,
      daily_protein_target: parseInt(formData.daily_protein_target, 10) || 150,
      daily_carbs_target: parseInt(formData.daily_carbs_target, 10) || 220,
      daily_fat_target: parseInt(formData.daily_fat_target, 10) || 65,
    };

    try {
      await updateProfile(cleanedPayload, false);
      setSuccessMsg('Profile and nutritional targets saved successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      const resData = err.response?.data;
      if (typeof resData === 'object') {
        const firstKey = Object.keys(resData)[0];
        const val = resData[firstKey];
        setErrorMsg(Array.isArray(val) ? `${firstKey}: ${val[0]}` : String(val));
      } else {
        setErrorMsg('Failed to save targets. Please check your inputs.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== user?.username) {
      setErrorMsg(`Please type "${user?.username}" to confirm account deletion.`);
      return;
    }
    setDeleting(true);
    try {
      await deleteAccount();
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to delete account. Please try again.');
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      
      {/* Title */}
      <div className="pb-4 border-b border-black/10 dark:border-white/10 font-mono">
        <h1 className="text-xl font-bold uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
          <User className="w-5 h-5" />
          User Profile & Daily Targets
        </h1>
        <p className="text-xs text-neutral-400 mt-0.5">
          Configure body biometric parameters and Mifflin-St Jeor TDEE energy targets
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 font-mono text-xs flex items-center gap-2 text-black dark:text-white">
          <Check className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-red-300 dark:border-red-900 font-mono text-xs flex items-center gap-2 text-red-500">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 font-mono text-xs">
        
        {/* Section 1: Body Metrics */}
        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
            <h2 className="font-bold uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
              <Scale className="w-4 h-4" />
              Biometric Parameters
            </h2>
            <span className="text-[10px] text-neutral-400">Step 1 of 2</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block uppercase tracking-wider text-neutral-500 mb-1.5">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-black dark:text-white uppercase font-bold text-xs"
              >
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
              </select>
            </div>

            <div>
              <label className="block uppercase tracking-wider text-neutral-500 mb-1.5">Age (Years)</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-black dark:text-white"
              />
            </div>

            <div>
              <label className="block uppercase tracking-wider text-neutral-500 mb-1.5">Height (cm)</label>
              <input
                type="number"
                step="0.1"
                name="height_cm"
                value={formData.height_cm}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-black dark:text-white"
              />
            </div>

            <div>
              <label className="block uppercase tracking-wider text-neutral-500 mb-1.5">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                name="weight_kg"
                value={formData.weight_kg}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-black dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block uppercase tracking-wider text-neutral-500 mb-1.5">Activity Multiplier</label>
              <select
                name="activity_level"
                value={formData.activity_level}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-black dark:text-white text-xs"
              >
                <option value="sedentary">Sedentary (Little or no workout)</option>
                <option value="light">Lightly Active (1-3 days/week)</option>
                <option value="moderate">Moderately Active (3-5 days/week)</option>
                <option value="very_active">Very Active (6-7 days/week)</option>
                <option value="extra_active">Extra Active (Hard training / physical job)</option>
              </select>
            </div>

            <div>
              <label className="block uppercase tracking-wider text-neutral-500 mb-1.5">Health Goal</label>
              <select
                name="goal_type"
                value={formData.goal_type}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-black dark:text-white text-xs"
              >
                <option value="lose">Weight Loss (-500 kcal/day)</option>
                <option value="maintain">Maintain Current Weight</option>
                <option value="gain">Weight Gain (+500 kcal/day)</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleRecalculateTargets}
              className="py-2.5 px-4 rounded-xl border border-black/20 dark:border-white/20 hover:border-black dark:hover:border-white bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white font-bold flex items-center gap-2 hover:opacity-90 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Auto-Calculate Recommended Daily Targets (Mifflin-St Jeor)</span>
            </button>
          </div>
        </div>

        {/* Section 2: Daily Macro & Calorie Targets */}
        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
            <h2 className="font-bold uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
              <Target className="w-4 h-4" />
              Daily Nutrition Goals
            </h2>
            <span className="text-[10px] text-neutral-400">Step 2 of 2</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block uppercase tracking-wider text-neutral-500 mb-1.5 font-bold">
                Daily Calories (kcal)
              </label>
              <input
                type="number"
                name="daily_calorie_target"
                value={formData.daily_calorie_target}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm font-extrabold rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-black dark:text-white"
              />
            </div>

            <div>
              <label className="block uppercase tracking-wider text-neutral-500 mb-1.5">
                Protein Target (g)
              </label>
              <input
                type="number"
                name="daily_protein_target"
                value={formData.daily_protein_target}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-black dark:text-white"
              />
            </div>

            <div>
              <label className="block uppercase tracking-wider text-neutral-500 mb-1.5">
                Carbs Target (g)
              </label>
              <input
                type="number"
                name="daily_carbs_target"
                value={formData.daily_carbs_target}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-black dark:text-white"
              />
            </div>

            <div>
              <label className="block uppercase tracking-wider text-neutral-500 mb-1.5">
                Fat Target (g)
              </label>
              <input
                type="number"
                name="daily_fat_target"
                value={formData.daily_fat_target}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-black dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm"
          >
            <Check className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Profile & Targets'}</span>
          </button>
        </div>

      </form>

      {/* Danger Zone: Delete Account */}
      <div className="mt-12 p-6 rounded-2xl border border-red-200 dark:border-red-950 bg-red-50/20 dark:bg-red-950/10 font-mono text-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-red-200/50 dark:border-red-900/50">
          <div>
            <h3 className="font-bold text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Danger Zone
            </h3>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Permanently delete your account and all logged calorie records
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-neutral-600 dark:text-neutral-400 text-xs">
            Once deleted, all your meal logs, weight history, and custom targets cannot be recovered.
          </p>
          <button
            type="button"
            onClick={() => { setShowDeleteModal(true); setDeleteConfirmText(''); }}
            className="px-4 py-2.5 rounded-xl border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/40 font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 flex-shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Account</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in font-mono text-xs">
          <div className="w-full max-w-md bg-white dark:bg-neutral-950 border border-red-200 dark:border-red-900 rounded-2xl shadow-2xl p-6 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-bold uppercase tracking-wider text-sm">
                  Delete Account Permanently?
                </h3>
              </div>
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="text-neutral-400 hover:text-black dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
              This action is <strong className="text-black dark:text-white">irreversible</strong>. All your personal data, profile targets, and historical meal logs will be completely removed.
            </p>

            <div>
              <label className="block text-[11px] text-neutral-500 uppercase tracking-wider mb-1">
                Type your username <strong className="text-black dark:text-white">"{user?.username}"</strong> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={user?.username}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/20 dark:border-white/20 text-black dark:text-white focus:border-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl border border-black/10 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting || deleteConfirmText !== user?.username}
                onClick={handleDeleteAccount}
                className="px-5 py-2 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 disabled:opacity-40 transition-opacity flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{deleting ? 'Deleting...' : 'Permanently Delete'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

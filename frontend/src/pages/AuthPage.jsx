import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, User, Mail, ArrowRight, Flame } from 'lucide-react';

export default function AuthPage() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    age: 25,
    gender: 'M',
    height_cm: 175,
    weight_kg: 70,
    activity_level: 'moderate',
    goal_type: 'maintain',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.username, formData.password);
      } else {
        await register(formData);
      }
    } catch (err) {
      console.error(err);
      const resData = err.response?.data;
      if (typeof resData === 'object') {
        const firstKey = Object.keys(resData)[0];
        const val = resData[firstKey];
        setError(Array.isArray(val) ? `${firstKey}: ${val[0]}` : String(val));
      } else {
        setError('Authentication failed. Please verify credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-2xl shadow-xl p-8 font-mono text-xs space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-10 h-10 rounded-xl bg-black dark:bg-white text-white dark:text-black items-center justify-center font-bold text-base mb-1">
            <Flame className="w-5 h-5" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-black dark:text-white">
            Calorie tracker - AI powered
          </h1>
          <p className="text-[11px] text-neutral-400">
            {isLogin ? 'Sign in to access your daily calorie log' : 'Create an account to start tracking'}
          </p>
        </div>

        {/* Auth Mode Toggle Tabs */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-center">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`py-2 rounded-lg uppercase tracking-wider transition-all ${
              isLogin 
                ? 'bg-black dark:bg-white text-white dark:text-black font-bold shadow-sm' 
                : 'text-neutral-500 hover:text-black dark:hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`py-2 rounded-lg uppercase tracking-wider transition-all ${
              !isLogin 
                ? 'bg-black dark:bg-white text-white dark:text-black font-bold shadow-sm' 
                : 'text-neutral-500 hover:text-black dark:hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-red-500 text-[11px]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block uppercase tracking-wider text-neutral-500 mb-1">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                placeholder="e.g., alex"
                className="w-full pl-9 pr-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-black/15 dark:border-white/15 rounded-xl text-black dark:text-white placeholder:text-neutral-400 focus:border-black dark:focus:border-white"
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block uppercase tracking-wider text-neutral-500 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="alex@example.com"
                  className="w-full pl-9 pr-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-black/15 dark:border-white/15 rounded-xl text-black dark:text-white placeholder:text-neutral-400 focus:border-black dark:focus:border-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block uppercase tracking-wider text-neutral-500 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-black/15 dark:border-white/15 rounded-xl text-black dark:text-white placeholder:text-neutral-400 focus:border-black dark:focus:border-white"
              />
            </div>
          </div>

          {!isLogin && (
            <div className="pt-2 border-t border-black/5 dark:border-white/5 space-y-3">
              <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">
                Initial Biometrics (For BMR/TDEE calculation)
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-neutral-400 block mb-0.5">Gender</span>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-2 py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-black dark:text-white uppercase"
                  >
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="O">Other</option>
                  </select>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 block mb-0.5">Age</span>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full px-2 py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-black dark:text-white"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 block mb-0.5">Height (cm)</span>
                  <input
                    type="number"
                    name="height_cm"
                    value={formData.height_cm}
                    onChange={handleChange}
                    className="w-full px-2 py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-black dark:text-white"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 block mb-0.5">Weight (kg)</span>
                  <input
                    type="number"
                    name="weight_kg"
                    value={formData.weight_kg}
                    onChange={handleChange}
                    className="w-full px-2 py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-black dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-sm"
          >
            <span>{loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

      </div>
    </div>
  );
}

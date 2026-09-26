import React, { useState } from 'react';

import { fetchApi } from '../api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await fetchApi('/auth/login', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ username, password })
      });
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || 'بيانات غير صحيحة');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900" dir="rtl">
      <div className="max-w-md w-full p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-blue-200">
        <div className="text-center mb-6 flex flex-col items-center">
          <div className="w-full bg-gradient-to-r from-white via-blue-50/50 to-indigo-50/40 py-6 px-4 rounded-2xl mb-5 flex flex-col items-center shadow-xs border-2 border-blue-400/90">
            <img src="/logo-light-theme.png" alt="فلاتر الجمال" className="w-48 h-20 object-contain" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">تسجيل الدخول</h1>
          <p className="text-slate-600 dark:text-gray-400 mt-1 font-bold text-sm">مؤسسة فلاتر الجمال لإدارة العمليات الميدانية</p>
        </div>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">اسم المستخدم</label>
            <input 
              type="text" 
              className="w-full p-2.5 border rounded-xl text-gray-900 bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">كلمة المرور</label>
            <input 
              type="password" 
              className="w-full p-2.5 border rounded-xl text-gray-900 bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              dir="ltr"
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:brightness-110 text-white p-3 rounded-2xl font-black shadow-md shadow-blue-600/25 transition-all hover:scale-[1.02] border border-blue-400/30"
          >
            دخول للنظام
          </button>
        </form>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { X, Calendar, AlertTriangle, Phone, ChevronLeft } from 'lucide-react';
import { fetchApi } from '../api';
import { useNavigate } from 'react-router-dom';

export default function NotificationsPanel({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'all' | 'overdue' | 'today' | 'upcoming'>('all');
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await fetchApi('/customers?isArchived=false&limit=1000');
      if (data.data && Array.isArray(data.data)) {
        setCustomers(data.data);
      } else if (Array.isArray(data)) {
        setCustomers(data);
      } else {
        setCustomers([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getStatus = (nextDateStr: string) => {
    if (!nextDateStr) return null;
    const nextDate = new Date(nextDateStr);
    nextDate.setHours(0,0,0,0);
    const today = new Date();
    today.setHours(0,0,0,0);
    const diffTime = nextDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { type: 'overdue', days: Math.abs(diffDays), label: `متأخرة (${Math.abs(diffDays)} يوم)` };
    if (diffDays === 0) return { type: 'today', days: 0, label: 'اليوم' };
    if (diffDays <= 7) return { type: 'upcoming', days: diffDays, label: `قادمة بعد ${diffDays} أيام` };
    return null;
  };

  const filteredData = customers.map(c => ({ ...c, status: getStatus(c.nextMaintenanceDate) })).filter(c => c.status !== null);
  
  const stats = {
    all: filteredData.length,
    overdue: filteredData.filter(c => c.status?.type === 'overdue').length,
    today: filteredData.filter(c => c.status?.type === 'today').length,
    upcoming: filteredData.filter(c => c.status?.type === 'upcoming').length,
  };

  const displayData = filteredData.filter(c => tab === 'all' || c.status?.type === tab).sort((a, b) => {
    const da = new Date(a.nextMaintenanceDate).getTime();
    const db = new Date(b.nextMaintenanceDate).getTime();
    return da - db;
  });

  return (
    <div className={`fixed inset-y-0 left-0 w-full max-w-sm bg-gray-50 dark:bg-[#0f172a] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col border-r border-gray-200 dark:border-gray-800 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="bg-white dark:bg-[#1e293b] px-5 py-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 shrink-0">
        <button onClick={onClose} className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
          <X size={20} />
        </button>
        <div className="text-center">
          <h2 className="text-lg font-black text-gray-900 dark:text-gray-100">تنبيهات الصيانة</h2>
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400">الاستحقاق: {stats.all} عميل</p>
        </div>
        <div className="w-10 h-10 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center relative shadow-sm">
          <AlertTriangle size={20} />
          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white dark:border-[#1e293b] rounded-full"></span>
        </div>
      </div>

      <div className="p-4 bg-white dark:bg-[#1e293b] border-b border-gray-100 dark:border-gray-800 shrink-0 overflow-x-auto no-scrollbar">
        <div className="flex gap-2">
          <button onClick={() => setTab('all')} className={`px-4 py-2 rounded-full text-[13px] font-black whitespace-nowrap transition-colors ${tab === 'all' ? 'bg-[#0d9488] text-white shadow-md' : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>الكل ({stats.all})</button>
          <button onClick={() => setTab('overdue')} className={`px-4 py-2 rounded-full text-[13px] font-black whitespace-nowrap transition-colors ${tab === 'overdue' ? 'bg-red-500 text-white shadow-md shadow-red-500/20' : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>متأخر ({stats.overdue})</button>
          <button onClick={() => setTab('today')} className={`px-4 py-2 rounded-full text-[13px] font-black whitespace-nowrap transition-colors ${tab === 'today' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>اليوم ({stats.today})</button>
          <button onClick={() => setTab('upcoming')} className={`px-4 py-2 rounded-full text-[13px] font-black whitespace-nowrap transition-colors ${tab === 'upcoming' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>قريباً ({stats.upcoming})</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 relative">
        {loading && <div className="absolute inset-0 bg-white/50 dark:bg-[#0f172a]/50 backdrop-blur-sm z-10 flex items-center justify-center font-bold text-gray-500 dark:text-gray-400">جاري التحميل...</div>}
        
        {displayData.map((c, idx) => (
          <div key={idx} className="bg-white dark:bg-[#1e293b] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col gap-3 transition-transform hover:-translate-y-1 hover:shadow-md">
            <div className="flex justify-between items-start">
              <div className="text-right">
                <h3 className="font-black text-gray-900 dark:text-gray-100 text-[15px]">{c.name}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-[12px] font-bold mt-0.5">{c.governorateName} - {c.cityName}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-md text-[11px] font-black shadow-sm ${
                c.status.type === 'overdue' ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20' :
                c.status.type === 'today' ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-500/20' :
                'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20'
              }`}>
                {c.status.label}
              </span>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-[12px] font-bold rounded-lg p-2.5 flex items-center gap-2">
              <AlertTriangle size={16} className={c.status.type === 'overdue' ? 'text-red-500' : 'text-orange-500'} />
              <span>يحتاج صيانة ({c.filterTypeName} - كل {c.maintenanceIntervalMonths} أشهر)</span>
            </div>

            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center gap-2">
                <button onClick={() => { onClose(); navigate(`/customers/${c.id}`); }} className="bg-[#0d9488] hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm">
                  <ChevronLeft size={14} /> عرض العميل
                </button>
                <a href={`tel:${c.phone1}`} className="w-8 h-8 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded-lg flex items-center justify-center transition-colors">
                  <Phone size={14} />
                </a>
              </div>
              <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-[12px] font-bold" dir="ltr">
                <Calendar size={14} />
                <span>{c.nextMaintenanceDate}</span>
                <span className="ml-1">:الموعد</span>
              </div>
            </div>
          </div>
        ))}
        {!loading && displayData.length === 0 && (
          <div className="text-center py-10 text-gray-400 dark:text-gray-500 font-bold">لا توجد تنبيهات في هذا القسم</div>
        )}
      </div>

      <div className="p-4 bg-white dark:bg-[#1e293b] border-t border-gray-100 dark:border-gray-800 shrink-0">
        <button onClick={() => { onClose(); navigate('/customers'); }} className="w-full py-3 bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white rounded-xl font-bold transition-colors text-sm shadow-md">
          الانتقال إلى سجل العملاء
        </button>
      </div>
    </div>
  );
}

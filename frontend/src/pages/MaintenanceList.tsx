import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '../api';
import { CheckCircle, AlertTriangle, Calendar, Clock, Plus, Wrench, Search, X, Sparkles } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import AddMaintenanceModal from './maintenance/AddMaintenanceModal';
import { formatDate, getMaintenanceTiming } from '../utils/dateFormatter';
import { matchesAnyField } from '../utils/textUtils';

export default function MaintenanceList() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'today' | 'overdue' | 'upcoming' | 'history'>('today');
  const [tasks, setTasks] = useState<any[]>([]);
  const [stats, setStats] = useState({ today: 0, overdue: 0, upcoming: 0, history: 0 });
  const [loadingAction, setLoadingAction] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean | string>(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (location.state && (location.state as any).openAdd) {
      setIsModalOpen(true);
      window.history.replaceState({}, document.title);
    }
    const params = new URLSearchParams(location.search);
    if (params.get('tab')) {
      setActiveTab(params.get('tab') as any);
    }
  }, [location]);

  const { data: maintenanceData, isLoading: loading, refetch: loadTasks } = useQuery({
    queryKey: ['maintenance', activeTab],
    queryFn: async () => {
      return fetchApi(`/maintenance?type=${activeTab}`);
    },
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (maintenanceData) {
      setTasks(maintenanceData.data || []);
      if (maintenanceData.stats) setStats(maintenanceData.stats);
    }
  }, [maintenanceData]);

  // Filter tasks in real-time based on normalized search query
  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return tasks;
    return tasks.filter(t => 
      matchesAnyField([t.name, t.customerCode, t.phone1, t.phone2, t.notes], searchQuery)
    );
  }, [tasks, searchQuery]);

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Unified Executive Header Frame - Balanced Royal Theme */}
      <div className="bg-gradient-to-r from-white via-blue-50/50 to-indigo-50/40 rounded-3xl p-6 md:p-8 text-slate-800 shadow-sm border-2 border-blue-400/90 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-md transition-all">
        {/* Soft, comfortable ambient glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-200/35 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-200/30 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl pointer-events-none"></div>

        {/* Main details & Title */}
        <div className="relative z-10 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-black px-3.5 py-1 rounded-full shadow-xs flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-300" />
              منظومة فلاتر الجمال الذكية
            </span>
            <span className="text-xs font-black text-blue-700 bg-white/95 px-3 py-1 rounded-full border border-blue-200 shadow-2xs">
              متابعة الدوريات والزيارات
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3">
            <div className="p-2.5 bg-blue-100/90 text-blue-700 rounded-2xl border border-blue-200 shadow-2xs shrink-0">
              <Wrench size={26} strokeWidth={2.2} />
            </div>
            <span>إدارة وجداول الصيانات الدورية</span>
          </h1>

          <p className="text-slate-600 text-xs md:text-sm font-semibold mt-2 max-w-2xl leading-relaxed">
            متابعة دقيقة للصيانات المطلوبة اليوم، المتأخرة، والقادمة، وتوثيق مواعيد الزيارات السابقة والمدد المتبقية.
          </p>
        </div>

        {/* Right side: Pills + Coordinated Action Buttons */}
        <div className="relative z-10 flex flex-col items-start md:items-end gap-3 shrink-0 w-full md:w-auto">
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-white/95 px-4 py-1.5 rounded-full text-xs font-black flex items-center gap-2 border border-blue-200 text-slate-700 shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {stats.today > 0 ? `مطلوبة اليوم: ${stats.today}` : 'جاهزية كاملة 100%'}
            </div>
            <div className="text-xs font-bold text-slate-700 bg-white/95 px-4 py-1 rounded-full border border-blue-200 shadow-xs">
              {formatDate(new Date())}
            </div>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:brightness-110 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 shadow-md shadow-blue-600/25 transition-all hover:scale-105 text-xs md:text-sm border border-blue-400/30"
          >
            <Plus size={20} strokeWidth={2.5} />
            <span>تسجيل صيانة جديدة</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 md:gap-3 bg-white p-3 rounded-2xl shadow-sm border border-slate-200/80">
        <button 
          onClick={() => setActiveTab('today')}
          className={`flex-1 min-w-[150px] py-3 px-4 rounded-xl text-sm font-black flex justify-center items-center gap-2 transition-all duration-200 ${
            activeTab === 'today' 
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20' 
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
          }`}
        >
          <Clock size={18} strokeWidth={2.5} />
          <span>صيانات مطلوبة اليوم ({stats.today})</span>
        </button>
        <button 
          onClick={() => setActiveTab('overdue')}
          className={`flex-1 min-w-[150px] py-3 px-4 rounded-xl text-sm font-black flex justify-center items-center gap-2 transition-all duration-200 ${
            activeTab === 'overdue' 
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20' 
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
          }`}
        >
          <AlertTriangle size={18} strokeWidth={2.5} />
          <span>الصيانات المتأخرة ({stats.overdue})</span>
        </button>
        <button 
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 min-w-[150px] py-3 px-4 rounded-xl text-sm font-black flex justify-center items-center gap-2 transition-all duration-200 ${
            activeTab === 'upcoming' 
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
          }`}
        >
          <Calendar size={18} strokeWidth={2.5} />
          <span>صيانات قادمة (خلال 3 أيام) ({stats.upcoming})</span>
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex-1 min-w-[150px] py-3 px-4 rounded-xl text-sm font-black flex justify-center items-center gap-2 transition-all duration-200 ${
            activeTab === 'history' 
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' 
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
          }`}
        >
          <CheckCircle size={18} strokeWidth={2.5} />
          <span>سجل الزيارات المنفذة ({stats.history})</span>
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 space-y-3">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="بحث فوري في قائمة الصيانات (اسم العميل، كود العميل، رقم الهاتف...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-12 pl-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              title="تفريغ البحث"
              className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {searchQuery.trim() && (
          <div className="flex items-center justify-between bg-blue-50/70 border border-blue-200/70 rounded-xl px-4 py-2 text-xs font-bold text-blue-900">
            <span>
              نتائج البحث عن "{searchQuery}": تم العثور على ({filteredTasks.length}) من إجمالي ({tasks.length})
            </span>
            <button 
              onClick={() => setSearchQuery('')}
              className="text-blue-700 hover:text-blue-900 font-black underline flex items-center gap-1"
            >
              <span>إلغاء البحث</span>
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
        {/* Helper Banner */}
        <div className={`p-4 border-b flex items-center justify-between text-sm font-bold ${
          activeTab === 'today' ? 'bg-amber-50/80 border-amber-200 text-amber-900' :
          activeTab === 'overdue' ? 'bg-rose-50/80 border-rose-200 text-rose-900' :
          activeTab === 'upcoming' ? 'bg-blue-50/80 border-blue-200 text-blue-900' :
          'bg-slate-50 border-slate-200 text-slate-800'
        }`}>
          <div className="flex items-center gap-2">
            {activeTab === 'today' && <><Clock size={18} className="text-amber-600" /> العملاء المطلوب تنفيذ صيانة لهم اليوم ({filteredTasks.length} عميل)</>}
            {activeTab === 'overdue' && <><AlertTriangle size={18} className="text-rose-600" /> صيانات متأخرة يجب تنفيذها بأسرع وقت ({filteredTasks.length} عميل)</>}
            {activeTab === 'upcoming' && <><Calendar size={18} className="text-blue-600" /> جدول الصيانات المجدولة للأيام القادمة (خلال 3 أيام) ({filteredTasks.length} عميل)</>}
            {activeTab === 'history' && <><CheckCircle size={18} className="text-emerald-600" /> أحدث زيارات الصيانة التي تم إنجازها بنجاح ({filteredTasks.length} زيارة)</>}
          </div>
          {searchQuery && (
            <span className="text-xs bg-white/80 px-2.5 py-1 rounded-md border border-current shadow-xs">
              فلترة نشطة
            </span>
          )}
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-sm text-right">
            <thead className="bg-[#f8fafc] border-b border-slate-200/80 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-black">كود العميل</th>
                <th className="px-6 py-4 font-black">اسم العميل</th>
                <th className="px-6 py-4 font-black">رقم الهاتف</th>
                {activeTab !== 'history' && (
                  <>
                    <th className="px-6 py-4 font-black">تاريخ آخر صيانة</th>
                    <th className="px-6 py-4 font-black">موعد الصيانة القادمة والمدة</th>
                    <th className="px-6 py-4 font-black text-center">إجراءات</th>
                  </>
                )}
                {activeTab === 'history' && (
                  <>
                    <th className="px-6 py-4 font-black">تاريخ الزيارة المنفذة</th>
                    <th className="px-6 py-4 font-black">تفاصيل وتوثيق الصيانة</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={activeTab === 'history' ? 5 : 6} className="text-center py-20">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-e-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                    <p className="mt-4 text-slate-500 font-bold">جاري تحميل السجلات...</p>
                  </td>
                </tr>
              ) : filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === 'history' ? 5 : 6} className="text-center py-24">
                    {searchQuery ? (
                      <div className="space-y-3">
                        <div className="text-4xl">🔍</div>
                        <h3 className="text-lg font-black text-slate-800">لا توجد نتائج مطابقة لبحثك</h3>
                        <p className="text-slate-500 font-bold text-sm">جرب البحث بكلمات أخرى أو مسح البحث</p>
                        <button
                          onClick={() => setSearchQuery('')}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-lg transition-colors"
                        >
                          مسح البحث وعرض الكل
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="text-[40px] mb-4">🎉</div>
                        <h3 className="text-lg font-black text-slate-800">رائع! لا توجد مهام في هذا القسم.</h3>
                        <p className="text-slate-500 font-bold mt-2">جميع الصيانات الميدانية مكتملة ومحدثة.</p>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filteredTasks.map(t => {
                  const timing = getMaintenanceTiming(t.nextMaintenanceDate);

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4 font-black text-slate-600">
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-xs border border-slate-200/60 font-mono">
                          #{t.customerCode}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-black text-slate-900">
                        <div className="font-extrabold">{t.name}</div>
                        {t.village && (
                          <div className="text-xs text-slate-400 font-bold mt-0.5">{t.village}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-600" dir="ltr" style={{ textAlign: 'right' }}>
                        {t.phone1}
                        {t.phone2 && <div className="text-xs text-slate-400 font-normal">{t.phone2}</div>}
                      </td>

                      {activeTab !== 'history' && (
                        <>
                          {/* Last Maintenance Date */}
                          <td className="px-6 py-4">
                            {t.lastMaintenanceDate ? (
                              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100/90 px-3 py-1.5 rounded-lg border border-slate-200/80 w-fit">
                                <Calendar size={14} className="text-slate-400" />
                                <span dir="ltr" className="font-mono font-bold">{formatDate(t.lastMaintenanceDate)}</span>
                              </div>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-slate-50 text-slate-400 border border-slate-200/60">
                                تركيب أولي / لا توجد زيارة
                              </span>
                            )}
                          </td>

                          {/* Next Maintenance Date + Duration / Delay */}
                          <td className="px-6 py-4">
                            <div className="space-y-1.5">
                              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                <Calendar size={14} className="text-slate-400" />
                                <span dir="ltr" className="font-mono font-bold">{formatDate(t.nextMaintenanceDate)}</span>
                              </div>
                              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black ${timing.badgeClass}`}>
                                <span className={`w-2 h-2 rounded-full ${timing.dotColor}`} />
                                <span>{timing.label}</span>
                              </div>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 text-center">
                            <button 
                              onClick={() => setIsModalOpen(t.id)} 
                              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white hover:brightness-110 rounded-xl text-xs font-black shadow-md shadow-blue-600/20 transition-all hover:scale-102 border border-blue-400/30"
                            >
                              <Wrench size={15} strokeWidth={2.5} />
                              <span>تسجيل صيانة</span>
                            </button>
                          </td>
                        </>
                      )}

                      {activeTab === 'history' && (
                        <>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black bg-blue-50 text-blue-700 border border-blue-200">
                              <Calendar size={14} />
                              <span dir="ltr" className="font-mono">{formatDate(t.visitDate)}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-600 font-bold text-xs max-w-[280px]">
                            {t.isBaseline ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-100">
                                تركيب أولي وتأسيس
                              </span>
                            ) : (
                              <span>{t.notes || 'تمت الصيانة بنجاح'}</span>
                            )}
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <AddMaintenanceModal 
          customerIdOverride={isModalOpen !== true ? isModalOpen : undefined}
          onClose={() => setIsModalOpen(false)} 
          onSaved={() => {
            setIsModalOpen(false);
            loadTasks();
          }} 
        />
      )}
    </div>
  );
}

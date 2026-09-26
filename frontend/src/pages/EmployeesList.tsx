import React, { useState, useEffect, useMemo } from 'react';
import { fetchApi } from '../api';
import { Users, Plus, Search, X, UserCheck, Shield, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { matchesSearch } from '../utils/textUtils';
import { formatDate } from '../utils/dateFormatter';

type Employee = {
  id: string;
  name: string;
  isTechnician: boolean;
  isActive: boolean;
};

export default function EmployeesList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'technician' | 'admin'>('all');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [isTechnician, setIsTechnician] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const data = await fetchApi(`/employees`);
      setEmployees(data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('يرجى كتابة اسم الموظف');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await fetchApi('/employees', {
        method: 'POST',
        body: JSON.stringify({ name: name.trim(), isTechnician })
      });
      setIsModalOpen(false);
      setName('');
      setIsTechnician(true);
      loadEmployees();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء حفظ الموظف');
    } finally {
      setSaving(false);
    }
  };

  // Filter employees using normalized Arabic search
  const filteredEmployees = useMemo(() => {
    return employees.filter(e => {
      if (filterRole === 'technician' && !e.isTechnician) return false;
      if (filterRole === 'admin' && e.isTechnician) return false;
      if (searchQuery.trim() && !matchesSearch(e.name, searchQuery)) return false;
      return true;
    });
  }, [employees, filterRole, searchQuery]);

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto font-sans">
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
              الكادر الميداني والإداري
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3">
            <div className="p-2.5 bg-blue-100/90 text-blue-700 rounded-2xl border border-blue-200 shadow-2xs shrink-0">
              <Users size={26} strokeWidth={2.2} />
            </div>
            <span>فريق العمل والفنيين الميدانيين</span>
          </h1>

          <p className="text-slate-600 text-xs md:text-sm font-semibold mt-2 max-w-2xl leading-relaxed">
            إدارة بيانات فنيي الصيانة والمشرفين الإداريين ومتابعة التعيينات الميدانية وسجلات الزيارات.
          </p>
        </div>

        {/* Right side: Pills + Coordinated Action Buttons */}
        <div className="relative z-10 flex flex-col items-start md:items-end gap-3 shrink-0 w-full md:w-auto">
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-white/95 px-4 py-1.5 rounded-full text-xs font-black flex items-center gap-2 border border-blue-200 text-slate-700 shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              إجمالي الفريق: {employees.length} موظف
            </div>
            <div className="text-xs font-bold text-slate-700 bg-white/95 px-4 py-1 rounded-full border border-blue-200 shadow-xs">
              {formatDate(new Date())}
            </div>
          </div>

          <button 
            onClick={() => { setName(''); setIsTechnician(true); setError(''); setIsModalOpen(true); }}
            className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:brightness-110 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 shadow-md shadow-blue-600/25 transition-all hover:scale-105 text-xs md:text-sm border border-blue-400/30"
          >
            <Plus size={20} strokeWidth={2.5} />
            <span>إضافة موظف / فني جديد</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="بحث باسم الموظف أو الفني..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-11 pl-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                title="تفريغ البحث"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setFilterRole('all')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                filterRole === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              الكل ({employees.length})
            </button>
            <button
              onClick={() => setFilterRole('technician')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                filterRole === 'technician'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              <UserCheck size={14} />
              <span>فنيو الصيانة ({employees.filter(e => e.isTechnician).length})</span>
            </button>
            <button
              onClick={() => setFilterRole('admin')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                filterRole === 'admin'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
              }`}
            >
              <Shield size={14} />
              <span>إداريون ({employees.filter(e => !e.isTechnician).length})</span>
            </button>
          </div>
        </div>

        {searchQuery.trim() && (
          <div className="flex items-center justify-between bg-blue-50/70 border border-blue-200/70 rounded-xl px-4 py-2 text-xs font-bold text-blue-900">
            <span>
              نتائج البحث عن "{searchQuery}": تم العثور على ({filteredEmployees.length}) من إجمالي ({employees.length}) موظف
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

      {/* Table Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-sm text-right">
            <thead className="bg-[#f8fafc] border-b border-slate-200/80 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-black">اسم الموظف / الفني</th>
                <th className="px-6 py-4 font-black text-center">المسمى والوظيفة</th>
                <th className="px-6 py-4 font-black text-center">حالة الحساب</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={3} className="text-center py-20">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-e-transparent align-[-0.125em]"></div>
                    <p className="mt-4 text-slate-500 font-bold">جاري تحميل سجلات الموظفين...</p>
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-20">
                    {searchQuery ? (
                      <div className="space-y-3">
                        <div className="text-4xl">🔍</div>
                        <h3 className="text-lg font-black text-slate-800">لا توجد نتائج مطابقة للبحث "{searchQuery}"</h3>
                        <button
                          onClick={() => setSearchQuery('')}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-lg transition-colors"
                        >
                          مسح البحث وعرض الكل
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Users size={40} className="mx-auto text-slate-300 mb-2" />
                        <h3 className="text-base font-black text-slate-700">لا يوجد موظفين مسجلين حالياً</h3>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filteredEmployees.map(e => (
                  <tr key={e.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-black text-slate-900 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 font-black flex items-center justify-center text-sm border border-blue-200">
                        {e.name.trim().charAt(0)}
                      </div>
                      <span>{e.name}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {e.isTechnician ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-black">
                          <UserCheck size={14} />
                          فني صيانة ميداني
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-xs font-black">
                          <Shield size={14} />
                          إداري / موظف
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {e.isActive !== false ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-black">
                          <CheckCircle size={14} />
                          نشط وفي الخدمة
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-black">
                          موقوف
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Plus size={20} className="text-blue-600" />
                <span>إضافة موظف / فني جديد</span>
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5">اسم الموظف أو الفني بالكامل:</label>
                <input 
                  type="text"
                  required
                  placeholder="مثال: م. أحمد عبد الرحمن"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5">طبيعة الدور والعمل:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setIsTechnician(true)}
                    className={`p-3 rounded-xl border text-xs font-black flex items-center justify-center gap-2 transition-all ${
                      isTechnician 
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-xs' 
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <UserCheck size={16} />
                    <span>فني صيانة ميداني</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsTechnician(false)}
                    className={`p-3 rounded-xl border text-xs font-black flex items-center justify-center gap-2 transition-all ${
                      !isTechnician 
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-xs' 
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Shield size={16} />
                    <span>إداري / مكتبي</span>
                  </button>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 text-xs font-bold rounded-xl transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white rounded-xl text-xs font-black hover:brightness-110 shadow-md shadow-blue-600/20 transition-all disabled:opacity-50 border border-blue-400/30"
                >
                  {saving ? 'جاري الحفظ...' : 'حفظ الموظف'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

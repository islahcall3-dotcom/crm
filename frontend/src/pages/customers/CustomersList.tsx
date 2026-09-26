import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../api';
import { Search, Plus, Edit, Eye, Archive, Trash2, Download, Upload, Columns, Users, RefreshCw, Wrench, Filter, RotateCcw, X, Sparkles } from 'lucide-react';
import CustomerForm from './CustomerForm';
import AddMaintenanceModal from '../maintenance/AddMaintenanceModal';
import { useLocation, useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/dateFormatter';

export default function CustomersList() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ active: 0, archived: 0 });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  
  // Search and Filters
  const [isArchived, setIsArchived] = useState(false);
  const [query, setQuery] = useState('');
  const [govId, setGovId] = useState('');
  const [cityId, setCityId] = useState('');
  const [filterTypeId, setFilterTypeId] = useState('');
  const [status, setStatus] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [dateType, setDateType] = useState('nextMaintenance');
  
  const [lookups, setLookups] = useState<any>({ governorates: [], cities: [], filterTypes: [], maintenanceIntervals: [] });

  const hasActiveFilters = Boolean(query.trim() || govId || cityId || filterTypeId || status || fromDate || toDate);

  const handleClearFilters = () => {
    setQuery('');
    setGovId('');
    setCityId('');
    setFilterTypeId('');
    setStatus('');
    setFromDate('');
    setToDate('');
  };

  const handleClearDates = () => {
    setFromDate('');
    setToDate('');
  };

  // Column Customization
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem('customersVisibleColumns');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      name: true,
      phone1: true,
      phone2: false,
      filterType: true,
      interval: true,
      lastMaintenance: false,
      nextMaintenance: true,
      status: true,
      actions: true
    };
  });

  useEffect(() => {
    localStorage.setItem('customersVisibleColumns', JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  useEffect(() => {
    fetchApi('/lookups').then(setLookups).catch(console.error);
    if (location.state && (location.state as any).openAdd) {
      setEditingId(null);
      setIsFormOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      let url = `/customers?isArchived=${isArchived}&q=${encodeURIComponent(query)}`;
      if (govId) url += `&govId=${govId}`;
      if (cityId) url += `&cityId=${cityId}`;
      if (filterTypeId) url += `&filterTypeId=${filterTypeId}`;
      if (status) url += `&status=${status}`;
      if (fromDate) url += `&from=${fromDate}`;
      if (toDate) url += `&to=${toDate}`;
      if (dateType) url += `&dateType=${dateType}`;
      
      const data = await fetchApi(url);
      setCustomers(data.data || []);
      if (data.stats) setStats(data.stats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [isArchived, govId, cityId, filterTypeId, status, fromDate, toDate, dateType]);

  // Real-time debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadCustomers();
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadCustomers();
  };

  const toggleColumn = (col: keyof typeof visibleColumns) => {
    setVisibleColumns((prev: any) => ({ ...prev, [col]: !prev[col] }));
  };

  const availableCities = lookups.cities.filter((c: any) => c.governorateId === govId);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      
      {/* Unified Executive Header Frame - Balanced Royal Theme */}
      <div className="bg-gradient-to-r from-white via-blue-50/50 to-indigo-50/40 rounded-3xl p-6 md:p-8 text-slate-800 shadow-sm border-2 border-blue-400/90 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-md transition-all mb-6">
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
              قاعدة العملاء والتوزيع الجغرافي
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3">
            <div className="p-2.5 bg-blue-100/90 text-blue-700 rounded-2xl border border-blue-200 shadow-2xs shrink-0">
              <Users size={26} strokeWidth={2.2} />
            </div>
            <span>سجل وقاعدة بيانات العملاء</span>
          </h1>

          <p className="text-slate-600 text-xs md:text-sm font-semibold mt-2 max-w-2xl leading-relaxed">
            البحث والفلترة المتقدمة، متابعة العملاء الفعالين والمؤرشفين، التصدير والاستيراد، وتخصيص أعمدة العرض.
          </p>
        </div>

        {/* Right side: Pills + Coordinated Action Buttons */}
        <div className="relative z-10 flex flex-col items-start md:items-end gap-3 shrink-0 w-full md:w-auto">
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-white/95 px-4 py-1.5 rounded-full text-xs font-black flex items-center gap-2 border border-blue-200 text-slate-700 shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {hasActiveFilters ? `المعروض: ${customers.length} من إجمالي ${stats.active + stats.archived}` : `إجمالي المسجلين: ${stats.active + stats.archived} عميل`}
            </div>
            <div className="text-xs font-bold text-slate-700 bg-white/95 px-4 py-1 rounded-full border border-blue-200 shadow-xs">
              {formatDate(new Date())}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <button 
              onClick={() => { setEditingId(null); setIsFormOpen(true); }} 
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:brightness-110 text-white rounded-2xl font-black transition-all shadow-md shadow-blue-600/25 flex items-center gap-2 hover:scale-105 text-xs md:text-sm border border-blue-400/30"
            >
              <Plus size={18} strokeWidth={2.5} /> إضافة عميل جديد
            </button>
            <button 
              onClick={() => setIsMaintenanceModalOpen(true)} 
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:brightness-110 text-white rounded-2xl font-black transition-all shadow-md shadow-blue-600/25 flex items-center gap-2 hover:scale-105 text-xs md:text-sm border border-blue-400/30"
              title="تسجيل وإضافة صيانة جديدة لأي عميل"
            >
              <Wrench size={18} strokeWidth={2.2} /> 
              <span>إضافة صيانة</span>
            </button>
            <button 
              onClick={() => alert('سيتم تفعيل الاستيراد قريباً')} 
              className="px-4 py-2.5 bg-white hover:bg-blue-50 text-slate-700 rounded-2xl font-bold border-2 border-blue-200 hover:border-blue-400 transition-all flex items-center gap-1.5 shadow-xs text-xs md:text-sm"
            >
              <Upload size={16} /> استيراد
            </button>
            <button 
              onClick={() => {
                const csvData = [
                  ['كود العميل', 'الاسم', 'هاتف رئيسي', 'المحافظة', 'المدينة', 'نوع الفلتر', 'تاريخ التسجيل', 'الصيانة القادمة']
                ];
                customers.forEach(c => {
                  csvData.push([
                    c.customerCode?.toString() || '',
                    c.name || '',
                    c.phone1 || '',
                    lookups.governorates.find((g: any) => g.id === c.governorateId)?.name || '',
                    lookups.cities.find((cit: any) => cit.id === c.cityId)?.name || '',
                    lookups.filterTypes.find((f: any) => f.id === c.filterTypeId)?.name || '',
                    c.createdAt ? formatDate(c.createdAt) : '',
                    c.nextMaintenanceDate ? formatDate(c.nextMaintenanceDate) : ''
                  ]);
                });
                const csvString = '\uFEFF' + csvData.map(row => row.join(',')).join('\n'); // \uFEFF for Arabic BOM
                const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.setAttribute('download', `العملاء_${new Date().toISOString().split('T')[0]}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }} 
              className="px-4 py-2.5 bg-white hover:bg-blue-50 text-slate-700 rounded-2xl font-bold border-2 border-blue-200 hover:border-blue-400 transition-all flex items-center gap-1.5 shadow-xs text-xs md:text-sm"
            >
              <Download size={16} /> تصدير Excel
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div className="flex gap-2">
          <button 
            onClick={() => setIsArchived(false)} 
            className={`px-5 py-2.5 font-black text-xs md:text-sm rounded-2xl flex items-center gap-2.5 transition-all ${
              !isArchived 
                ? 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white shadow-md shadow-blue-600/25' 
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Users size={17} />
            <span>العملاء الفعالون</span>
            <span className={`px-2 py-0.5 rounded-lg text-xs font-black ${!isArchived ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
              {hasActiveFilters ? `${customers.length} من ${stats.active}` : stats.active}
            </span>
          </button>
          <button 
            onClick={() => setIsArchived(true)} 
            className={`px-5 py-2.5 font-black text-xs md:text-sm rounded-2xl flex items-center gap-2.5 transition-all ${
              isArchived 
                ? 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white shadow-md shadow-blue-600/25' 
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Archive size={17} />
            <span>العملاء المؤرشفون</span>
            <span className={`px-2 py-0.5 rounded-lg text-xs font-black ${isArchived ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
              {stats.archived}
            </span>
          </button>
        </div>
      </div>

      {/* Advanced Filters Block */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-5">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-3 relative">
            <div className="relative flex-1">
              <input 
                type="text" 
                placeholder="ابحث باسم العميل، رقم الهاتف، المحافظة، القرية، أو الملاحظات..."
                className="w-full pl-16 pr-4 py-3 text-sm border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold text-slate-900 bg-white"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button 
                  type="button" 
                  onClick={() => { setQuery(''); setTimeout(loadCustomers, 0); }} 
                  className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-600 transition-colors p-1"
                  title="مسح نص البحث"
                >
                  <X size={16} />
                </button>
              )}
              <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors p-1">
                <Search size={18} />
              </button>
            </div>
            
            <div className="relative">
              <button type="button" onClick={() => setShowColumnsMenu(!showColumnsMenu)} className="h-full px-4 border border-slate-200 rounded-2xl font-black text-xs md:text-sm text-slate-700 bg-slate-50 hover:bg-slate-100 flex items-center gap-2 transition-colors">
                <Columns size={17} /> تخصيص الأعمدة
              </button>
              {showColumnsMenu && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-slate-200 shadow-xl rounded-2xl p-4 w-56 z-30 font-bold">
                  <h4 className="font-black text-xs text-slate-900 mb-3 border-b border-slate-100 pb-2">الأعمدة الظاهرة</h4>
                  {Object.keys(visibleColumns).map((col) => (
                    <label key={col} className="flex items-center gap-2 mb-2 cursor-pointer text-xs text-slate-700 hover:text-slate-900">
                      <input type="checkbox" checked={visibleColumns[col as keyof typeof visibleColumns]} onChange={() => toggleColumn(col as keyof typeof visibleColumns)} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                      <span className="font-bold">{
                        col === 'name' ? 'اسم العميل' :
                        col === 'phone1' ? 'الهاتف الرئيسي' :
                        col === 'phone2' ? 'هاتف إضافي' :
                        col === 'filterType' ? 'نوع الفلتر' :
                        col === 'interval' ? 'دورية الصيانة' :
                        col === 'lastMaintenance' ? 'تاريخ آخر صيانة' :
                        col === 'nextMaintenance' ? 'موعد الصيانة القادمة' :
                        col === 'status' ? 'الحالة' : 'الإجراءات'
                      }</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2.5 items-center">
            <select value={govId} onChange={e => { setGovId(e.target.value); setCityId(''); }} className="p-2.5 text-xs font-black border border-slate-300 rounded-xl outline-none text-slate-700 bg-white">
              <option value="">كل المحافظات ({lookups.governorates.length})</option>
              {lookups.governorates.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
            
            <select value={cityId} onChange={e => setCityId(e.target.value)} disabled={!govId} className="p-2.5 text-xs font-black border border-slate-300 rounded-xl outline-none text-slate-700 bg-white disabled:opacity-50">
              <option value="">كل المدن والقرى</option>
              {availableCities.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <select value={filterTypeId} onChange={e => setFilterTypeId(e.target.value)} className="p-2.5 text-xs font-black border border-slate-300 rounded-xl outline-none text-slate-700 bg-white">
              <option value="">كل أنواع الفلاتر</option>
              {lookups.filterTypes.map((f: any) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>

            <select value={status} onChange={e => setStatus(e.target.value)} className="p-2.5 text-xs font-black border border-slate-300 rounded-xl outline-none text-slate-700 bg-white">
              <option value="">كل حالات الصيانة</option>
              <option value="overdue">متأخرة عن الموعد</option>
              <option value="today">مطلوبة اليوم</option>
              <option value="upcoming">قادمة (خلال 3 أيام)</option>
              <option value="valid">سارية</option>
            </select>
            
            <div className="relative">
              <input 
                type="date" 
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                className="w-full p-2 text-xs border border-slate-300 rounded-xl outline-none font-bold text-slate-700 bg-white focus:border-blue-500 shadow-2xs" 
                title="من تاريخ (الصيانة القادمة)" 
              />
              <span className="text-[10px] text-slate-500 font-bold block mt-0.5 px-1">من تاريخ</span>
            </div>

            <div className="relative">
              <input 
                type="date" 
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                className="w-full p-2 text-xs border border-slate-300 rounded-xl outline-none font-bold text-slate-700 bg-white focus:border-blue-500 shadow-2xs" 
                title="إلى تاريخ (الصيانة القادمة)" 
              />
              <span className="text-[10px] text-slate-500 font-bold block mt-0.5 px-1">إلى تاريخ</span>
            </div>

            {(fromDate || toDate) && (
              <button
                type="button"
                onClick={handleClearDates}
                className="p-2.5 px-3 text-xs font-black text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-2xs hover:scale-105"
                title="مسح وتفريغ تواريخ البحث فقط"
              >
                <X size={14} />
                <span>مسح التواريخ ✕</span>
              </button>
            )}

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="p-2.5 px-3 text-xs font-black text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-2xs hover:scale-105"
                title="مسح وتفريغ كافة الفلاتر"
              >
                <RotateCcw size={14} />
                <span>مسح الفلاتر ✕</span>
              </button>
            )}
          </div>

          {/* Dynamic Filter Results Counter Banner with Clear Button */}
          {hasActiveFilters && (
            <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-slate-700 animate-in fade-in duration-200">
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1.5 font-black text-blue-950 bg-blue-50 border border-blue-200 px-3 py-1 rounded-xl shadow-2xs">
                  <Filter size={14} className="text-blue-600" />
                  <span>نتائج التصفية: تم العثور على</span>
                  <span className="text-sm font-black text-blue-700 underline mx-0.5">{customers.length}</span>
                  <span>عميل مطابق</span>
                </span>

                {govId && (
                  <span className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl text-slate-700 flex items-center gap-1">
                    <span className="text-slate-400">المحافظة:</span>
                    <span className="font-black text-slate-900">{lookups.governorates.find((g: any) => g.id === govId)?.name}</span>
                  </span>
                )}

                {cityId && (
                  <span className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl text-slate-700 flex items-center gap-1">
                    <span className="text-slate-400">المدينة:</span>
                    <span className="font-black text-slate-900">{availableCities.find((c: any) => c.id === cityId)?.name}</span>
                  </span>
                )}

                {filterTypeId && (
                  <span className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl text-slate-700 flex items-center gap-1">
                    <span className="text-slate-400">نوع الفلتر:</span>
                    <span className="font-black text-slate-900">{lookups.filterTypes.find((f: any) => f.id === filterTypeId)?.name}</span>
                  </span>
                )}

                {status && (
                  <span className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl text-slate-700 flex items-center gap-1">
                    <span className="text-slate-400">الحالة:</span>
                    <span className="font-black text-slate-900">
                      {status === 'overdue' ? 'متأخرة عن الموعد' : status === 'today' ? 'مطلوبة اليوم' : status === 'upcoming' ? 'قادمة (خلال 3 أيام)' : 'سارية'}
                    </span>
                  </span>
                )}

                {(fromDate || toDate) && (
                  <span className="bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl text-amber-900 flex items-center gap-1">
                    <span className="text-amber-600">فترة الصيانة:</span>
                    <span className="font-black">
                      {fromDate ? formatDate(fromDate) : 'البداية'} ← {toDate ? formatDate(toDate) : 'الآن'}
                    </span>
                  </span>
                )}

                {query && (
                  <span className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl text-slate-700 flex items-center gap-1">
                    <span className="text-slate-400">بحث:</span>
                    <span className="font-black text-slate-900">"{query}"</span>
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleClearFilters}
                className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 border border-rose-200 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all shadow-2xs hover:scale-105"
                title="إلغاء كافة الفلاتر وعرض جميع العملاء"
              >
                <RotateCcw size={13} />
                <span>مسح وتفريغ الفلاتر ✕</span>
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-x-auto relative min-h-[400px]">
        <table className="w-full text-sm text-right whitespace-nowrap">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-600">
            <tr>
              {visibleColumns.name && <th className="px-5 py-4 font-black"><div className="resize-x overflow-hidden min-w-[150px] max-w-[400px]">اسم العميل والملاحظات</div></th>}
              {visibleColumns.phone1 && <th className="px-5 py-4 font-black"><div className="resize-x overflow-hidden min-w-[100px] max-w-[200px]">الهاتف الرئيسي</div></th>}
              {visibleColumns.phone2 && <th className="px-5 py-4 font-black"><div className="resize-x overflow-hidden min-w-[100px] max-w-[200px]">هاتف إضافي</div></th>}
              {visibleColumns.filterType && <th className="px-5 py-4 font-black text-center"><div className="resize-x overflow-hidden min-w-[100px] max-w-[200px] mx-auto">نوع الفلتر</div></th>}
              {visibleColumns.interval && <th className="px-5 py-4 font-black text-center"><div className="resize-x overflow-hidden min-w-[100px] max-w-[200px] mx-auto">دورية الصيانة</div></th>}
              {visibleColumns.lastMaintenance && <th className="px-5 py-4 font-black text-center"><div className="resize-x overflow-hidden min-w-[120px] max-w-[200px] mx-auto">تاريخ آخر صيانة</div></th>}
              {visibleColumns.nextMaintenance && <th className="px-5 py-4 font-black text-center"><div className="resize-x overflow-hidden min-w-[140px] max-w-[250px] mx-auto">موعد الصيانة القادمة ⇅</div></th>}
              {visibleColumns.status && <th className="px-5 py-4 font-black text-center"><div className="resize-x overflow-hidden min-w-[100px] max-w-[200px] mx-auto">الحالة</div></th>}
              {visibleColumns.actions && <th className="px-5 py-4 font-black text-center sticky left-0 bg-gray-50 z-10 border-r border-gray-100 shadow-[-4px_0_10px_rgba(0,0,0,0.02)]">الإجراءات</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={10} className="text-center p-10 text-gray-500 font-bold">جاري تحميل البيانات...</td></tr>
            ) : customers.length === 0 ? (
              <tr><td colSpan={10} className="text-center p-10 text-gray-500 font-bold">لا يوجد عملاء.</td></tr>
            ) : (
              customers.map((c: any) => {
                const filter = lookups.filterTypes.find((f: any) => f.id === c.filterTypeId);
                const interval = lookups.maintenanceIntervals.find((m: any) => m.id === c.maintenanceIntervalId);
                const today = new Date().toISOString().split('T')[0];
                const isOverdue = c.nextMaintenanceDate && c.nextMaintenanceDate < today;
                const overdueDays = isOverdue ? Math.floor((new Date().getTime() - new Date(c.nextMaintenanceDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;
                
                return (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-teal-50/30 transition-colors group">
                    {visibleColumns.name && (
                      <td className="px-5 py-3">
                        <div className="font-black text-gray-900">{c.name}</div>
                      </td>
                    )}
                    {visibleColumns.phone1 && (
                      <td className="px-5 py-3 font-bold text-gray-700" dir="ltr" style={{textAlign: 'right'}}>{c.phone1}</td>
                    )}
                    {visibleColumns.phone2 && (
                      <td className="px-5 py-3 font-semibold text-gray-400" dir="ltr" style={{textAlign: 'right'}}>{c.phone2 || '---'}</td>
                    )}
                    {visibleColumns.filterType && (
                      <td className="px-5 py-3 text-center">
                        {filter ? <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-black">{filter.name}</span> : '---'}
                      </td>
                    )}
                    {visibleColumns.interval && (
                      <td className="px-5 py-3 text-center font-bold text-gray-700">كل {interval ? interval.months : '?'} شهور</td>
                    )}
                    {visibleColumns.lastMaintenance && (
                      <td className="px-5 py-3 text-center font-bold text-gray-800">{c.lastMaintenanceDate ? formatDate(c.lastMaintenanceDate) : '---'}</td>
                    )}
                    {visibleColumns.nextMaintenance && (
                      <td className="px-5 py-3 text-center">
                        {c.nextMaintenanceDate ? (
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[13px] font-black text-teal-700 border border-teal-100 bg-white">
                            {formatDate(c.nextMaintenanceDate)}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">غير محدد</span>
                        )}
                      </td>
                    )}
                    {visibleColumns.status && (
                      <td className="px-5 py-3 text-center">
                        {(() => {
                          if (!c.nextMaintenanceDate) return <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-[12px] font-black border border-gray-200">غير محدد</span>;
                          const nextDate = new Date(c.nextMaintenanceDate);
                          nextDate.setHours(0,0,0,0);
                          const todayDate = new Date();
                          todayDate.setHours(0,0,0,0);
                          
                          const diffTime = nextDate.getTime() - todayDate.getTime();
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                          if (diffDays < 0) {
                            return <span className="bg-red-100 text-red-700 px-3 py-1.5 rounded-full text-[12px] font-black border border-red-200">متأخر ({Math.abs(diffDays)} يوم)</span>;
                          } else if (diffDays === 0) {
                            return <span className="bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-[12px] font-black border border-orange-200 shadow-sm animate-pulse">مطلوبة اليوم</span>;
                          } else if (diffDays <= 7) {
                            return <span className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full text-[12px] font-black border border-amber-200">قادمة قريباً ({diffDays} أيام)</span>;
                          } else {
                            return <span className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-[12px] font-black border border-emerald-200">سارية</span>;
                          }
                        })()}
                      </td>
                    )}
                    {visibleColumns.actions && (
                      <td className="px-5 py-3 flex items-center justify-center gap-1.5 sticky left-0 bg-white z-10 group-hover:bg-slate-50 border-r border-slate-100 shadow-[-4px_0_10px_rgba(0,0,0,0.02)]">
                        <button onClick={() => navigate(`/customers/${c.id}`)} className="p-2 text-blue-600 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-xl transition-all" title="عرض الملف">
                          <Eye size={16} strokeWidth={2.5} />
                        </button>
                        <button onClick={() => setEditingId(c.id)} className="p-2 text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200/70 rounded-xl transition-all" title="تعديل">
                          <Edit size={16} strokeWidth={2.5} />
                        </button>
                        {!isArchived ? (
                          <>
                            <button onClick={async () => { if(confirm('تأكيد أرشفة العميل؟')) { await fetchApi(`/customers/${c.id}/archive`, {method: 'PUT', body: JSON.stringify({})}); loadCustomers(); } }} className="p-2 text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all" title="أرشفة">
                              <Archive size={16} strokeWidth={2.5} />
                            </button>
                            <button onClick={async () => { if(confirm('حذف نهائي للعميل؟')) { await fetchApi(`/customers/${c.id}`, {method: 'DELETE'}); loadCustomers(); } }} className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/70 rounded-xl transition-all" title="حذف نهائي">
                              <Trash2 size={16} strokeWidth={2.5} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={async () => { if(confirm('تأكيد استعادة العميل؟')) { await fetchApi(`/customers/${c.id}/restore`, {method: 'PUT'}); loadCustomers(); } }} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200/70 rounded-xl transition-all" title="استعادة من الأرشيف">
                              <RefreshCw size={16} strokeWidth={2.5} />
                            </button>
                            <button onClick={async () => { if(confirm('حذف نهائي للعميل؟')) { await fetchApi(`/customers/${c.id}`, {method: 'DELETE'}); loadCustomers(); } }} className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/70 rounded-xl transition-all" title="حذف نهائي">
                              <Trash2 size={16} strokeWidth={2.5} />
                            </button>
                          </>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {isFormOpen && (
        <CustomerForm 
          customerId={editingId} 
          onClose={() => { setIsFormOpen(false); setEditingId(null); }} 
          onSaved={() => {
            setIsFormOpen(false);
            setEditingId(null);
            loadCustomers();
          }} 
        />
      )}
      {editingId && !isFormOpen && (
        <CustomerForm 
          customerId={editingId} 
          onClose={() => setEditingId(null)} 
          onSaved={() => {
            setEditingId(null);
            loadCustomers();
          }} 
        />
      )}
      {isMaintenanceModalOpen && (
        <AddMaintenanceModal 
          onClose={() => setIsMaintenanceModalOpen(false)} 
          onSaved={() => {
            setIsMaintenanceModalOpen(false);
            loadCustomers();
          }} 
        />
      )}
    </div>
  );
}

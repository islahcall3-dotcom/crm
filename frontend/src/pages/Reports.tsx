import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '../api';
import { 
  BarChart3, Users, Wrench, Droplets, Calendar, Clock, AlertTriangle, 
  CheckCircle, Search, Filter, Download, Printer, RefreshCw, X, 
  DollarSign, Package, MapPin, Award, Star, Activity, Sparkles, 
  FileText, Layers, ChevronLeft, ChevronDown, ArrowDownRight, Phone, ShieldCheck,
  TrendingUp, ArrowUpRight, ArrowDownLeft, Box, AlertCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  CartesianGrid, Cell, PieChart, Pie, Legend 
} from 'recharts';
import { matchesSearch, matchesAnyField } from '../utils/textUtils';
import { formatDate } from '../utils/dateFormatter';

type ActiveReportTab = 'overview' | 'candles' | 'maintenance' | 'technicians' | 'geography' | 'inventory' | 'visits';

export default function Reports() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveReportTab>('overview');
  const [companyProfile, setCompanyProfile] = useState<any>(null);

  useEffect(() => {
    fetchApi('/settings').then(res => {
      if (res?.companyProfile) setCompanyProfile(res.companyProfile);
    }).catch(console.error);
  }, []);

  // Professional Search & Multi-Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [selectedTech, setSelectedTech] = useState('');
  const [selectedGov, setSelectedGov] = useState('');
  const [selectedFilterType, setSelectedFilterType] = useState('');

  // Warehouse Tab internal filters
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState('all');
  const [inventorySearchQuery, setInventorySearchQuery] = useState('');

  // Geography Tab internal search
  const [govSearchQuery, setGovSearchQuery] = useState('');

  const { data: reportsData, isLoading: loading, refetch: loadReports } = useQuery({
    queryKey: ['reports', selectedPeriod, customFrom, customTo, selectedTech, selectedGov, selectedFilterType, searchQuery],
    queryFn: async () => {
      let queryParams = new URLSearchParams();
      if (selectedPeriod !== 'all' && selectedPeriod !== 'custom') {
        queryParams.append('period', selectedPeriod);
      }
      if (selectedPeriod === 'custom') {
        if (customFrom) queryParams.append('from', customFrom);
        if (customTo) queryParams.append('to', customTo);
      }
      if (searchQuery.trim()) queryParams.append('search', searchQuery.trim());
      if (selectedTech) queryParams.append('technicianId', selectedTech);
      if (selectedGov) queryParams.append('governorateId', selectedGov);
      if (selectedFilterType) queryParams.append('filterTypeId', selectedFilterType);

      const res = await fetchApi(`/reports?${queryParams.toString()}`);
      return res.data;
    },
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (reportsData) {
      setData(reportsData);
    }
  }, [reportsData]);

  // Debounced search for live typing
  useEffect(() => {
    const timer = setTimeout(() => {
      loadReports();
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadReports();
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedPeriod('all');
    setCustomFrom('');
    setCustomTo('');
    setSelectedTech('');
    setSelectedGov('');
    setSelectedFilterType('');
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    if (!data) return;

    let headers: string[] = [];
    let rows: any[] = [];
    let filename = `تقرير_مؤسسة_فلاتر_الجمال_${new Date().toISOString().split('T')[0]}.csv`;

    if (activeTab === 'inventory') {
      headers = ['اسم الصنف', 'الفئة والتصنيف', 'الكمية المتوفرة', 'سعر التكلفة (ج.م)', 'إجمالي قيمة التكلفة (ج.م)', 'سعر البيع التقديري (ج.م)', 'المستهلك في الصيانة', 'مدة كفاية المخزون (شهور)', 'حالة التوفر'];
      rows = (data.warehouseReport?.detailedItems || []).map((i: any) => [
        `"${i.name.replace(/"/g, '""')}"`,
        `"${i.category}"`,
        i.quantity,
        i.unitPrice,
        i.totalCostValue,
        i.retailPrice,
        i.consumedInVisits,
        `${i.coverageMonths} شهر`,
        `"${i.status}"`
      ]);
      filename = `تقرير_جرد_وتقييم_المخزن_${new Date().toISOString().split('T')[0]}.csv`;
    } else if (activeTab === 'candles' || activeTab === 'overview') {
      headers = ['رقم المرحلة', 'اسم الشمعة الكامل', 'دورية التغيير المعتمدة', 'إجمالي المستهلك (قطعة)', 'نسبة الاستهلاك %', 'سعر القطعة (ج.م)', 'إجمالي التكلفة التقديرية (ج.م)'];
      rows = (data.candleStats || []).map((c: any) => [
        `"مرحلة ${c.stageNum}"`,
        `"${c.name.replace(/"/g, '""')}"`,
        `"${c.interval}"`,
        c.count,
        `${c.percentage}%`,
        c.unitPrice,
        c.totalCost
      ]);
      filename = `تقرير_استهلاك_شمع_الفلاتر_${new Date().toISOString().split('T')[0]}.csv`;
    } else if (activeTab === 'technicians') {
      headers = ['اسم الفني', 'إجمالي الزيارات المنفذة', 'إجمالي الشمعات المركبة', 'تقييم الأداء', 'تاريخ آخر زيارة'];
      rows = (data.technicianStats || []).map((t: any) => [
        `"${t.name.replace(/"/g, '""')}"`,
        t.visitsCount,
        t.candlesInstalled,
        `"${t.score}"`,
        t.lastVisitDate
      ]);
      filename = `تقرير_أداء_الفنيين_${new Date().toISOString().split('T')[0]}.csv`;
    } else if (activeTab === 'geography') {
      headers = ['المحافظة', 'عدد العملاء', 'عدد الزيارات', 'النسبة المئوية %', 'حالة التغطية'];
      rows = (data.all27GovernoratesStats || []).map((g: any) => [
        `"${g.name.replace(/"/g, '""')}"`,
        g.customerCount,
        g.visitsCount,
        `${g.percentage}%`,
        `"${g.coverageStatus}"`
      ]);
      filename = `تقرير_تغطية_المحافظات_الـ27_${new Date().toISOString().split('T')[0]}.csv`;
    } else {
      headers = ['تاريخ الزيارة', 'كود العميل', 'اسم العميل', 'رقم الهاتف', 'الفني المنفذ', 'نوع الفلتر', 'المحافظة والمركز', 'الشمعات المستبدلة', 'ملاحظات'];
      rows = (data.detailedVisits || []).map((v: any) => [
        v.visitDate,
        v.customerCode,
        `"${v.customerName.replace(/"/g, '""')}"`,
        v.phone,
        `"${v.technicianName.replace(/"/g, '""')}"`,
        `"${v.filterTypeName.replace(/"/g, '""')}"`,
        `"${v.governorateName} - ${v.cityName}"`,
        `"${v.candlesSummary.replace(/"/g, '""')}"`,
        `"${(v.notes || '').replace(/"/g, '""')}"`
      ]);
      filename = `سجل_زيارات_الصيانة_${new Date().toISOString().split('T')[0]}.csv`;
    }

    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const overview = data?.overview || {
    totalCustomers: 0,
    filteredCustomersCount: 0,
    totalVisits: 0,
    onTimeRate: 100,
    overdueCount: 0,
    todayCount: 0,
    upcomingCount: 0,
    totalCandlesConsumed: 0,
    totalCandlesCost: 0,
    totalInventoryValue: 0,
    totalInventoryUnits: 0,
    totalEstimatedRetailValue: 0,
    lowStockCount: 0,
    activeTechniciansCount: 0,
    totalGovernoratesCount: 27,
    activeGovernoratesCount: 0
  };

  const warehouse = data?.warehouseReport || {
    summary: {
      totalItemTypes: 0,
      totalUnitsInStock: 0,
      totalCapitalCost: 0,
      totalEstimatedRetailValue: 0,
      expectedGrossProfit: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
      healthyStockCount: 0,
      totalCandlesConsumedInVisits: 0,
      totalCandlesCostInVisits: 0
    },
    categoryBreakdown: [],
    fastMovingItems: [],
    slowMovingItems: [],
    lowStockItems: [],
    detailedItems: []
  };

  const lookups = data?.lookups || { technicians: [], governorates: [], filterTypes: [] };
  
  // Vibrant multi-colored palettes
  const candleChartColors = ['#0d9488', '#0284c7', '#6366f1', '#d97706', '#9333ea', '#059669', '#e11d48'];
  const categoryPalette = ['#059669', '#d97706', '#6366f1', '#0284c7', '#8b5cf6', '#e11d48'];
  const govColors = ['#059669', '#d97706', '#6366f1', '#e11d48', '#0284c7', '#8b5cf6', '#f97316', '#0d9488', '#0891b2', '#4f46e5'];

  // Filtered inventory items based on category and search
  const filteredInventoryItems = (warehouse.detailedItems || []).filter((item: any) => {
    if (inventoryCategoryFilter !== 'all' && item.category !== inventoryCategoryFilter) return false;
    if (inventorySearchQuery.trim()) {
      return matchesAnyField([item.name, item.category], inventorySearchQuery);
    }
    return true;
  });

  // Filtered 27 governorates based on search
  const filteredAll27Govs = (data?.all27GovernoratesStats || []).filter((g: any) => {
    if (!govSearchQuery.trim()) return true;
    return matchesSearch(g.name, govSearchQuery);
  });

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-[1600px] mx-auto font-sans">
      
      {/* 1. Unified Executive Header Frame - Balanced Royal Theme */}
      <div className="bg-gradient-to-r from-white via-blue-50/50 to-indigo-50/40 rounded-3xl p-6 md:p-8 text-slate-800 shadow-sm border-2 border-blue-400/90 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-md transition-all">
        {/* Soft Ambient Glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-200/35 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

        <div className="relative z-10 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-black px-3.5 py-1 rounded-full shadow-xs flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-300" />
              منظومة فلاتر الجمال الذكية
            </span>
            <span className="text-xs font-black text-blue-700 bg-white/95 px-3 py-1 rounded-full border border-blue-200 shadow-2xs">
              مركز التقارير والإحصائيات والتحليلات
            </span>
            <span className="text-xs font-bold text-slate-500 bg-white/80 px-2.5 py-1 rounded-full border border-slate-200/60">
              {formatDate(new Date())}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100/90 text-blue-700 rounded-2xl border border-blue-200 shadow-2xs">
              <BarChart3 size={24} strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              مركز تقارير مؤسسة فلاتر الجمال
            </h2>
          </div>
          <p className="text-slate-600 text-xs md:text-sm font-semibold max-w-2xl leading-relaxed">
            متابعة شاملة لقاعدة العملاء، الرقابة على المخزون وحركة الأصناف، استهلاك الشمع، وإنتاجية الفنيين.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={loadReports}
            className="p-3 bg-white hover:bg-blue-50 text-blue-700 rounded-2xl border border-blue-200 transition-all shadow-xs"
            title="تحديث البيانات لحظياً"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-white hover:bg-blue-50 text-blue-800 border-2 border-blue-200 hover:border-blue-400 rounded-2xl font-black text-xs flex items-center gap-2 transition-all hover:scale-105 shadow-xs"
          >
            <Download size={16} />
            <span>تصدير Excel / CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:brightness-110 text-white px-5 py-2.5 rounded-2xl font-black text-xs flex items-center gap-2 shadow-md shadow-blue-600/25 transition-all hover:scale-105 border border-blue-400/30"
          >
            <Printer size={16} />
            <span>طباعة تقرير معتمد 🖨️</span>
          </button>
        </div>
      </div>

      {/* 2. Professional Multi-Criteria Search & Filter Engine */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          
          {/* A. Live Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative w-full lg:w-96">
            <Search size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="بحث بالاسم، كود العميل (مثال: 1001)، أو الهاتف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setTimeout(loadReports, 0); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                title="مسح البحث"
              >
                <X size={16} />
              </button>
            )}
          </form>

          {/* B. Period Dropdown Menu - Space Optimized & Executive Style */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <span className="text-xs font-black text-slate-600 flex items-center gap-1.5 shrink-0">
              <Calendar size={16} className="text-blue-600" />
              الفترة:
            </span>
            <div className="relative flex-1 sm:w-64">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full appearance-none pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-black text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer transition-all shadow-xs"
              >
                <option value="all">كافة الفترات (سجل كامل)</option>
                <option value="today">اليوم الحالي</option>
                <option value="week">آخر 7 أيام</option>
                <option value="month">هذا الشهر الحالي</option>
                <option value="quarter">هذا الربع (3 أشهر)</option>
                <option value="year">هذا العام بالكامل</option>
                <option value="custom">📅 فترة مخصصة (تحديد التواريخ)</option>
              </select>
              <ChevronDown size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* C. Secondary Dropdown Filters (Technician, Governorate, Filter Type, Custom Date) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          
          {/* Filter by Technician */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">الفني المنفذ:</label>
            <select
              value={selectedTech}
              onChange={(e) => setSelectedTech(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:border-blue-500 outline-none"
            >
              <option value="">جميع الفنيين</option>
              {lookups.technicians.map((t: any) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Filter by Governorate (All 27 Governorates Included) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">المحافظة (27 محافظة):</label>
            <select
              value={selectedGov}
              onChange={(e) => setSelectedGov(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:border-blue-500 outline-none"
            >
              <option value="">كافة محافظات الجمهورية ({lookups.governorates.length})</option>
              {lookups.governorates.map((g: any) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          {/* Filter by Filter Type */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">نوع وموديل الفلتر:</label>
            <select
              value={selectedFilterType}
              onChange={(e) => setSelectedFilterType(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:border-blue-500 outline-none"
            >
              <option value="">جميع موديلات الفلاتر</option>
              {lookups.filterTypes.map((ft: any) => (
                <option key={ft.id} value={ft.id}>{ft.name}</option>
              ))}
            </select>
          </div>

          {/* Custom Date Inputs or Reset */}
          {selectedPeriod === 'custom' ? (
            <div className="flex gap-2 items-center">
              <div className="flex-1">
                <label className="block text-[11px] font-bold text-slate-500 mb-1">من تاريخ:</label>
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[11px] font-bold text-slate-500 mb-1">إلى تاريخ:</label>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                />
              </div>
            </div>
          ) : (
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleResetFilters}
                className="w-full py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <X size={15} />
                <span>إعادة ضبط الفلاتر</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Top Executive KPI Cards - Distinct Multi-colored luxury palette */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* KPI 1: TOTAL CUSTOMERS (Balanced Royal Blue) */}
        <div className="bg-gradient-to-br from-blue-50/80 via-white to-blue-50/40 p-5 rounded-3xl shadow-sm border border-blue-200 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-black text-blue-700 bg-blue-100/70 px-2.5 py-1 rounded-xl">قاعدة العملاء</span>
            <div className="p-2.5 bg-blue-100 text-blue-700 rounded-2xl">
              <Users size={22} strokeWidth={2.5} />
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl font-black text-blue-950">{overview.totalCustomers} <span className="text-xs font-bold text-slate-400">عميل</span></div>
            <div className="text-xs text-blue-700 font-bold mt-1">
              مشمول في الفلتر: <span className="font-black text-slate-900">{overview.filteredCustomersCount} عميل</span>
            </div>
          </div>
          <div className="pt-2.5 border-t border-blue-100 flex justify-between items-center text-[11px] font-bold text-slate-500">
            <span>معدل الالتزام:</span>
            <span className="text-emerald-700 font-black">{overview.onTimeRate}%</span>
          </div>
        </div>

        {/* KPI 2: TOTAL VISITS (Emerald Forest) */}
        <div className="bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/30 p-5 rounded-3xl shadow-sm border border-emerald-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-black text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-xl">العمليات الميدانية</span>
            <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-2xl">
              <Wrench size={22} strokeWidth={2.5} />
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl font-black text-emerald-950">{overview.totalVisits} <span className="text-xs font-bold text-slate-400">زيارة</span></div>
            <div className="text-xs text-emerald-700 font-bold mt-1">
              مطلوبة اليوم: <span className="font-black text-amber-700">{overview.todayCount} صيانة</span>
            </div>
          </div>
          <div className="pt-2.5 border-t border-emerald-100 flex justify-between items-center text-[11px] font-bold text-slate-500">
            <span>متأخرة عن الموعد:</span>
            <span className={`font-black ${overview.overdueCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{overview.overdueCount} عميل</span>
          </div>
        </div>

        {/* KPI 3: TOTAL CANDLES CONSUMED (Royal Teal) */}
        <div className="bg-gradient-to-br from-teal-50/70 via-white to-teal-50/30 p-5 rounded-3xl shadow-sm border border-teal-200 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-black text-teal-700 bg-teal-100/70 px-2.5 py-1 rounded-xl">استهلاك الشمع</span>
            <div className="p-2.5 bg-teal-100 text-teal-700 rounded-2xl">
              <Droplets size={22} strokeWidth={2.5} />
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl font-black text-teal-900">{overview.totalCandlesConsumed} <span className="text-xs font-bold text-slate-400">شمعة</span></div>
            <div className="text-xs text-teal-700 font-bold mt-1">
              تكلفة مستهلكة: <span className="font-black text-teal-900">{overview.totalCandlesCost.toLocaleString('ar-EG')} ج.م</span>
            </div>
          </div>
          <div className="pt-2.5 border-t border-teal-100 flex justify-between items-center text-[11px] font-bold text-slate-500">
            <span>موزعة على:</span>
            <span className="font-black text-slate-800">7 مراحل أساسية</span>
          </div>
        </div>

        {/* KPI 4: WAREHOUSE VALUATION (Warm Honey Amber) */}
        <div className="bg-gradient-to-br from-amber-50/70 via-white to-amber-50/30 p-5 rounded-3xl shadow-sm border border-amber-200/80 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-black text-amber-800 bg-amber-100/70 px-2.5 py-1 rounded-xl">رأس مال المخزن</span>
            <div className="p-2.5 bg-amber-100 text-amber-700 rounded-2xl">
              <Package size={22} strokeWidth={2.5} />
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl font-black text-amber-950">{overview.totalInventoryValue.toLocaleString('ar-EG')} <span className="text-xs font-bold text-slate-400">ج.م</span></div>
            <div className="text-xs text-amber-800 font-bold mt-1">
              إجمالي الرصيد: <span className="font-black text-slate-900">{overview.totalInventoryUnits} قطعة</span>
            </div>
          </div>
          <div className="pt-2.5 border-t border-amber-200/60 flex justify-between items-center text-[11px] font-bold text-slate-500">
            <span>القيمة بالبيع التقديري:</span>
            <span className="font-black text-amber-900">{overview.totalEstimatedRetailValue.toLocaleString('ar-EG')} ج.م</span>
          </div>
        </div>

        {/* KPI 5: GEOGRAPHIC COVERAGE (Sky Cyan) */}
        <div className="bg-gradient-to-br from-cyan-50/70 via-white to-cyan-50/30 p-5 rounded-3xl shadow-sm border border-cyan-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-black text-cyan-800 bg-cyan-100/70 px-2.5 py-1 rounded-xl">التغطية الإقليمية</span>
            <div className="p-2.5 bg-cyan-100 text-cyan-700 rounded-2xl">
              <MapPin size={22} strokeWidth={2.5} />
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl font-black text-cyan-950">{overview.activeGovernoratesCount} <span className="text-xs font-bold text-slate-400">من {overview.totalGovernoratesCount} محافظة</span></div>
            <div className="text-xs text-cyan-800 font-bold mt-1">
              مغطاة بنشاط ميداني نشط
            </div>
          </div>
          <div className="pt-2.5 border-t border-cyan-100 flex justify-between items-center text-[11px] font-bold text-slate-500">
            <span>إجمالي محافظات مصر:</span>
            <span className="font-black text-cyan-900">27 محافظة معتمدة</span>
          </div>
        </div>

      </div>

      {/* 4. Report Module Navigation Tabs (Executive Structured Card Bar) */}
      <div className="bg-white p-2.5 rounded-3xl shadow-sm border border-slate-200/80">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {[
            { id: 'overview', title: 'المؤشرات العامة', sub: 'الرؤية التنفيذية', icon: Activity, color: 'text-blue-600 bg-blue-50 border-blue-200' },
            { id: 'inventory', title: 'تقارير المخزن', sub: 'الأصناف ورأس المال', icon: Package, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
            { id: 'candles', title: 'استهلاك الشمع', sub: 'المراحل الـ 7', icon: Droplets, color: 'text-cyan-600 bg-cyan-50 border-cyan-100' },
            { id: 'maintenance', title: 'الصيانات الميدانية', sub: 'متابعة العمليات', icon: Wrench, color: 'text-amber-600 bg-amber-50 border-amber-100' },
            { id: 'technicians', title: 'إنتاجية الفنيين', sub: 'تقييم الأداء', icon: Award, color: 'text-purple-600 bg-purple-50 border-purple-100' },
            { id: 'geography', title: 'التوزيع الجغرافي', sub: 'الـ 27 محافظة', icon: MapPin, color: 'text-teal-600 bg-teal-50 border-teal-100' },
            { id: 'visits', title: 'سجل الزيارات', sub: 'التوثيق المعتمد', icon: FileText, color: 'text-rose-600 bg-rose-50 border-rose-100' },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveReportTab)}
                className={`relative flex items-center gap-2.5 p-2.5 rounded-2xl transition-all duration-200 text-right group ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white shadow-md shadow-blue-600/25 scale-[1.02] ring-1 ring-blue-400/50'
                    : 'bg-slate-50/80 hover:bg-white text-slate-700 hover:text-blue-950 border border-slate-200/70 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                  isActive 
                    ? 'bg-white/10 text-amber-300 border border-white/10' 
                    : `${tab.color} border shadow-2xs`
                }`}>
                  <Icon size={17} strokeWidth={2.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className={`text-xs font-black truncate leading-tight ${isActive ? 'text-white' : 'text-slate-800 group-hover:text-sky-950'}`}>
                    {tab.title}
                  </div>
                  <div className={`text-[10px] font-bold truncate mt-0.5 ${isActive ? 'text-slate-200' : 'text-slate-400'}`}>
                    {tab.sub}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: EXECUTIVE OVERVIEW */}
      {/* ======================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Chart: Filter Cartridges Consumption */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Droplets className="text-teal-600" size={20} />
                    <span>معدل استهلاك الشمعات والمراحل السبع</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-bold mt-1">توزيع القطع المستهلكة في زيارات الصيانة الدورية</p>
                </div>
                <span className="text-xs font-black text-teal-700 bg-teal-50 px-3 py-1.5 rounded-xl">
                  {overview.totalCandlesConsumed} شمعة مستهلكة
                </span>
              </div>
              
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.candleStats || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{fontSize: 11, fill: '#475569', fontWeight: 'bold', angle: -25, textAnchor: 'end'}} axisLine={false} tickLine={false} dy={10} interval={0} />
                    <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip 
                      formatter={(value: any, name: any, props: any) => [`${value} شمعة`, 'الاستهلاك']}
                      contentStyle={{borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 8px 25px rgba(0,0,0,0.08)', fontWeight: 'bold'}}
                    />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      {(data?.candleStats || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={candleChartColors[index % candleChartColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart: Warehouse Capital by Category */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Package className="text-amber-600" size={20} />
                    <span>توزيع رأس مال المخزن حسب التصنيف</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-bold mt-1">القيمة المالية للبضاعة المتوفرة حالياً</p>
                </div>
                <span className="text-xs font-black text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200/60">
                  {overview.totalInventoryValue.toLocaleString('ar-EG')} ج.م
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-6 my-auto">
                {/* 1. Pure, Uncluttered Donut Chart with Centered KPI */}
                <div className="relative w-full sm:w-[210px] h-[210px] shrink-0 flex items-center justify-center mx-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={warehouse.categoryBreakdown || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={92}
                        paddingAngle={3}
                        dataKey="value"
                        nameKey="name"
                        stroke="#ffffff"
                        strokeWidth={2}
                      >
                        {(warehouse.categoryBreakdown || []).map((entry: any, index: number) => (
                          <Cell key={`cat-cell-${index}`} fill={categoryPalette[index % categoryPalette.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any, name: any, item: any) => [
                          `${Number(value).toLocaleString('ar-EG')} ج.م (${item?.payload?.percentage || 0}%)`, 
                          'القيمة'
                        ]}
                        contentStyle={{borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.08)', fontWeight: 'bold'}}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Central Ring KPI - Executive Focal Point */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                    <span className="text-[10px] font-bold text-slate-400">إجمالي البضاعة</span>
                    <span className="text-base font-black text-slate-900 leading-tight">
                      {overview.totalInventoryValue.toLocaleString('ar-EG')}
                    </span>
                    <span className="text-[10px] font-bold text-amber-600">ج.م</span>
                  </div>
                </div>

                {/* 2. Structured, Crystal-Clear Legend Cards */}
                <div className="w-full flex-1 space-y-2">
                  {(warehouse.categoryBreakdown || []).map((cat: any, index: number) => {
                    const color = categoryPalette[index % categoryPalette.length];
                    return (
                      <div 
                        key={index} 
                        className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 hover:bg-white hover:shadow-xs transition-all"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-1">
                          <span 
                            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs ring-2 ring-white" 
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-xs font-black text-slate-800 truncate" title={cat.name}>
                            {cat.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 shrink-0 pl-1">
                          <span className="text-xs font-black text-slate-900">
                            {cat.value.toLocaleString('ar-EG')} <span className="text-[10px] text-slate-400 font-bold">ج.م</span>
                          </span>
                          <span 
                            className="text-[11px] font-black px-2 py-0.5 rounded-lg text-white shadow-2xs min-w-[42px] text-center"
                            style={{ backgroundColor: color }}
                          >
                            {cat.percentage}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-100 flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl">
                <ShieldCheck size={28} />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-bold">معدل كفاءة الصيانة الميدانية</div>
                <div className="text-2xl font-black text-slate-900 mt-0.5">{overview.onTimeRate}% التزام</div>
                <div className="text-[11px] text-emerald-700 font-bold">بدون أي تأخيرات حرجة</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-100 flex items-center gap-4">
              <div className="p-3 bg-amber-50 text-amber-700 rounded-2xl">
                <Box size={28} />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-bold">كفاية رصيد شمع الفلاتر بالمخزن</div>
                <div className="text-2xl font-black text-slate-900 mt-0.5">آمن ومكتمل 100%</div>
                <div className="text-[11px] text-amber-700 font-bold">يكفي حتى 9 أشهر صيانة قادمة</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-100 flex items-center gap-4">
              <div className="p-3 bg-cyan-50 text-cyan-700 rounded-2xl">
                <MapPin size={28} />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-bold">الانتشار الجغرافي النشط</div>
                <div className="text-2xl font-black text-slate-900 mt-0.5">{overview.activeGovernoratesCount} محافظات</div>
                <div className="text-[11px] text-cyan-700 font-bold">جاهزية التوسع في كافة الـ 27 محافظة</div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: DEDICATED WAREHOUSE & INVENTORY INTELLIGENCE REPORT */}
      {/* ======================================================== */}
      {activeTab === 'inventory' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* A. Warehouse Executive KPIs Strip */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <div className="bg-gradient-to-br from-emerald-50/70 to-white p-4 rounded-2xl border border-emerald-200/80 shadow-xs">
              <div className="text-xs font-bold text-slate-500">رأس مال المخزن (تكلفة)</div>
              <div className="text-2xl font-black text-emerald-900 mt-1">{warehouse.summary.totalCapitalCost.toLocaleString('ar-EG')} ج.م</div>
              <div className="text-[11px] text-emerald-700 font-bold mt-1">سعر الشراء الفعلي</div>
            </div>

            <div className="bg-gradient-to-br from-cyan-50/70 to-white p-4 rounded-2xl border border-cyan-200/80 shadow-xs">
              <div className="text-xs font-bold text-slate-500">القيمة بالبيع التقديري</div>
              <div className="text-2xl font-black text-cyan-900 mt-1">{warehouse.summary.totalEstimatedRetailValue.toLocaleString('ar-EG')} ج.م</div>
              <div className="text-[11px] text-cyan-700 font-bold mt-1">هامش ربح تقديري 35%</div>
            </div>

            <div className="bg-gradient-to-br from-purple-50/70 to-white p-4 rounded-2xl border border-purple-200/80 shadow-xs">
              <div className="text-xs font-bold text-slate-500">الربح المتوقع للمخزون</div>
              <div className="text-2xl font-black text-purple-900 mt-1">+{warehouse.summary.expectedGrossProfit.toLocaleString('ar-EG')} ج.م</div>
              <div className="text-[11px] text-purple-700 font-bold mt-1">عائد تجاري متوقع</div>
            </div>

            <div className="bg-gradient-to-br from-amber-50/70 to-white p-4 rounded-2xl border border-amber-200/80 shadow-xs">
              <div className="text-xs font-bold text-slate-500">إجمالي عدد القطع</div>
              <div className="text-2xl font-black text-amber-900 mt-1">{warehouse.summary.totalUnitsInStock} قطعة</div>
              <div className="text-[11px] text-amber-700 font-bold mt-1">رصيد المخزن الحالي</div>
            </div>

            <div className="bg-gradient-to-br from-sky-50/70 to-white p-4 rounded-2xl border border-sky-200/80 shadow-xs">
              <div className="text-xs font-bold text-slate-500">أصناف مسجلة</div>
              <div className="text-2xl font-black text-sky-900 mt-1">{warehouse.summary.totalItemTypes} صنف</div>
              <div className="text-[11px] text-sky-700 font-bold mt-1">شمع وقطع وفلاتر</div>
            </div>

            <div className="bg-gradient-to-br from-rose-50/70 to-white p-4 rounded-2xl border border-rose-200/80 shadow-xs">
              <div className="text-xs font-bold text-slate-500">مستهلكات الصيانات</div>
              <div className="text-2xl font-black text-rose-900 mt-1">{warehouse.summary.totalCandlesConsumedInVisits} شمعة</div>
              <div className="text-[11px] text-rose-700 font-bold mt-1">بقيمة {warehouse.summary.totalCandlesCostInVisits.toLocaleString('ar-EG')} ج.م</div>
            </div>
          </div>

          {/* B. Maintenance Linkage Breakdown & Categories Split */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Category Breakdown Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/60">
                <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <Package className="text-emerald-600" size={18} />
                  <span>تصنيف بضاعة المخزن والقيمة المالية لكل قسم</span>
                </h4>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-xl">
                  {warehouse.categoryBreakdown.length} أقسام
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                  <thead className="bg-[#f8fafc] border-b border-slate-100 text-slate-500">
                    <tr>
                      <th className="px-5 py-3 font-black">القسم والتصنيف</th>
                      <th className="px-5 py-3 font-black text-center">عدد الأصناف</th>
                      <th className="px-5 py-3 font-black text-center">القطع المتوفرة</th>
                      <th className="px-5 py-3 font-black text-center">رأس المال (ج.م)</th>
                      <th className="px-5 py-3 font-black text-center">الحصة %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {warehouse.categoryBreakdown.map((cat: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-3.5 font-black text-slate-800 flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: categoryPalette[idx % categoryPalette.length] }}></span>
                          <span>{cat.name}</span>
                        </td>
                        <td className="px-5 py-3.5 text-center font-bold text-slate-600">{cat.count} صنف</td>
                        <td className="px-5 py-3.5 text-center font-black text-slate-900">{cat.units} قطعة</td>
                        <td className="px-5 py-3.5 text-center font-black text-emerald-700">{cat.value.toLocaleString('ar-EG')} ج.م</td>
                        <td className="px-5 py-3.5 text-center">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-slate-100 text-slate-700">
                            {cat.percentage}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Direct Maintenance Linkage Ledger */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/60">
                <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <Droplets className="text-teal-600" size={18} />
                  <span>الربط الميداني: حركة سحب الشمع من المخزن للصيانات</span>
                </h4>
                <span className="text-xs font-bold text-teal-800 bg-teal-100 px-2.5 py-1 rounded-xl">
                  خصم تلقائي فوري
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                  <thead className="bg-[#f8fafc] border-b border-slate-100 text-slate-500">
                    <tr>
                      <th className="px-5 py-3 font-black">الشمعة والمرحلة</th>
                      <th className="px-5 py-3 font-black text-center">المسحوب للصيانة</th>
                      <th className="px-5 py-3 font-black text-center">الرصيد المتبقي</th>
                      <th className="px-5 py-3 font-black text-center">التكلفة المستهلكة</th>
                      <th className="px-5 py-3 font-black text-center">مدة الكفاية</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {(data?.candleStats || []).map((c: any, idx: number) => {
                      // Find matched stock item
                      const matchedItem = warehouse.detailedItems?.find((i: any) => i.name.includes(`مرحلة ${c.stageNum}`) || i.name.includes(`مرحلة ${c.stageNum}`));
                      const remaining = matchedItem ? matchedItem.quantity : 'متوفر';
                      const coverage = matchedItem ? matchedItem.coverageMonths : 12;
                      return (
                        <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-5 py-3.5 font-black text-slate-800 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: candleChartColors[idx % candleChartColors.length] }}></span>
                            <span>{c.name}</span>
                          </td>
                          <td className="px-5 py-3.5 text-center font-black text-rose-600">{c.count} قطعة</td>
                          <td className="px-5 py-3.5 text-center font-black text-emerald-700">{remaining} قطعة</td>
                          <td className="px-5 py-3.5 text-center font-bold text-slate-700">{c.totalCost.toLocaleString('ar-EG')} ج.م</td>
                          <td className="px-5 py-3.5 text-center">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                              {coverage} شهر
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* C. Fast Moving & Slow Moving Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Fast Moving */}
            <div className="bg-gradient-to-r from-emerald-50/50 to-white p-5 rounded-3xl border border-emerald-200/80 shadow-xs">
              <h4 className="font-black text-emerald-950 text-sm flex items-center gap-2 mb-3">
                <TrendingUp size={18} className="text-emerald-700" />
                <span>الأصناف سريعة الحركة (الأعلى استهلاكاً في الصيانة)</span>
              </h4>
              <div className="space-y-2">
                {warehouse.fastMovingItems.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-2.5 rounded-xl bg-white border border-emerald-100 text-xs">
                    <span className="font-black text-slate-800">{item.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-700 font-bold">المتبقي: {item.quantity} قطعة</span>
                      <span className="bg-emerald-600 text-white font-black px-2 py-0.5 rounded-lg">{item.consumedInVisits} سحب</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Healthy / Stock Security */}
            <div className="bg-gradient-to-r from-amber-50/50 to-white p-5 rounded-3xl border border-amber-200/80 shadow-xs">
              <h4 className="font-black text-amber-950 text-sm flex items-center gap-2 mb-3">
                <Box size={18} className="text-amber-700" />
                <span>قطع الغيار والمكونات الإستراتيجية بالمخزن</span>
              </h4>
              <div className="space-y-2">
                {warehouse.slowMovingItems.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-2.5 rounded-xl bg-white border border-amber-100 text-xs">
                    <span className="font-black text-slate-800">{item.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-600 font-bold">قيمة القطعة: {item.unitPrice} ج.م</span>
                      <span className="bg-amber-600 text-white font-black px-2 py-0.5 rounded-lg">{item.quantity} متوفر</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* D. Full Inventory Audit Table with Interactive Category Filters & Search */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/60">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Package size={20} className="text-emerald-700" />
                  <span>سجل جرد ومراقبة المخزن التفصيلي والشامل</span>
                </h3>
                <p className="text-xs text-slate-500 font-bold mt-1">
                  عرض تفصيلي لكافة الأصناف المسجلة مع تكلفة الشراء، سعر البيع التقديري، وحالة التوفر
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                {/* Search */}
                <div className="relative">
                  <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="ابحث باسم الصنف..."
                    value={inventorySearchQuery}
                    onChange={(e) => setInventorySearchQuery(e.target.value)}
                    className="pl-8 pr-8 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
                  />
                  {inventorySearchQuery && (
                    <button
                      type="button"
                      onClick={() => setInventorySearchQuery('')}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                      title="مسح البحث"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Category Pill Filters */}
                <select
                  value={inventoryCategoryFilter}
                  onChange={(e) => setInventoryCategoryFilter(e.target.value)}
                  className="p-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                >
                  <option value="all">كافة الفئات</option>
                  <option value="شمع وممبرين الفلاتر">شمع وممبرين الفلاتر</option>
                  <option value="قطع غيار وهياكل التشغيل">قطع غيار وتشغيل</option>
                  <option value="مواتير ومحولات كهربائية">مواتير ومحولات</option>
                  <option value="محابس وخراطيم وسباكة">محابس وخراطيم</option>
                  <option value="أطقم وفلاتر متكاملة">أطقم وفلاتر متكاملة</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-[#f8fafc] border-b border-slate-100 text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-black">#</th>
                    <th className="px-5 py-4 font-black">اسم الصنف</th>
                    <th className="px-5 py-4 font-black">الفئة</th>
                    <th className="px-5 py-4 font-black text-center">الرصيد المتوفر</th>
                    <th className="px-5 py-4 font-black text-center">سعر التكلفة</th>
                    <th className="px-5 py-4 font-black text-center">إجمالي رأس المال</th>
                    <th className="px-5 py-4 font-black text-center">سعر البيع التقديري</th>
                    <th className="px-5 py-4 font-black text-center">مسحوب للصيانة</th>
                    <th className="px-5 py-4 font-black text-center">مدة الكفاية</th>
                    <th className="px-5 py-4 font-black text-center">حالة المخزون</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredInventoryItems.map((item: any, idx: number) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5 text-xs font-black text-slate-400">{idx + 1}</td>
                      <td className="px-5 py-3.5 font-black text-slate-900">{item.name}</td>
                      <td className="px-5 py-3.5 text-xs font-bold text-slate-600">
                        <span className="px-2 py-0.5 bg-slate-100 rounded-lg">{item.category}</span>
                      </td>
                      <td className="px-5 py-3.5 text-center font-black text-slate-900 text-base">{item.quantity} قطعة</td>
                      <td className="px-5 py-3.5 text-center font-bold text-slate-700">{item.unitPrice} ج.م</td>
                      <td className="px-5 py-3.5 text-center font-black text-emerald-700">{item.totalCostValue.toLocaleString('ar-EG')} ج.م</td>
                      <td className="px-5 py-3.5 text-center font-bold text-cyan-700">{item.retailPrice} ج.م</td>
                      <td className="px-5 py-3.5 text-center font-black text-rose-600">{item.consumedInVisits}</td>
                      <td className="px-5 py-3.5 text-center font-bold text-slate-600 text-xs">{item.coverageMonths} شهر</td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-black ${
                          item.quantity === 0 ? 'bg-rose-100 text-rose-800' :
                          item.quantity <= 5 ? 'bg-amber-100 text-amber-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: CANDLES CONSUMPTION ANALYSIS */}
      {/* ======================================================== */}
      {activeTab === 'candles' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/60">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Droplets size={20} className="text-teal-600" />
                  <span>تحليل استهلاك شمع الفلاتر والمراحل السبع بالتفصيل</span>
                </h3>
                <p className="text-xs text-slate-500 font-bold mt-1">
                  إحصائيات دورية الاستبدال، تكلفة القطع، ونسب الاستهلاك عبر شبكة العملاء
                </p>
              </div>
              <span className="text-xs font-black text-teal-800 bg-teal-100 px-3 py-1.5 rounded-xl">
                7 مراحل معتمدة
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-[#f8fafc] border-b border-slate-100 text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-black">المرحلة</th>
                    <th className="px-6 py-4 font-black">اسم الشمعة الكامل</th>
                    <th className="px-6 py-4 font-black text-center">دورية التغيير المعتمدة</th>
                    <th className="px-6 py-4 font-black text-center">إجمالي المستهلك</th>
                    <th className="px-6 py-4 font-black text-center">نسبة الاستهلاك %</th>
                    <th className="px-6 py-4 font-black text-center">سعر القطعة</th>
                    <th className="px-6 py-4 font-black text-center">التكلفة التقديرية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {(data?.candleStats || []).map((candle: any) => (
                    <tr key={candle.stageNum} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 font-black text-slate-900">
                        <span className="w-7 h-7 rounded-xl bg-teal-50 text-teal-800 font-black inline-flex items-center justify-center text-xs">
                          {candle.stageNum}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-black text-slate-900">
                        {candle.name}
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-slate-600 text-xs">
                        <span className="px-2.5 py-1 bg-slate-100 rounded-lg">{candle.interval}</span>
                      </td>
                      <td className="px-6 py-4 text-center font-black text-teal-700 text-base">
                        {candle.count} قطعة
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1 bg-teal-50 text-teal-800 rounded-full font-black text-xs">
                          {candle.percentage}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-slate-700">
                        {candle.unitPrice} ج.م
                      </td>
                      <td className="px-6 py-4 text-center font-black text-slate-900">
                        {candle.totalCost.toLocaleString('ar-EG')} ج.م
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: MAINTENANCE & FIELD OPERATIONS */}
      {/* ======================================================== */}
      {activeTab === 'maintenance' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/60">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Wrench size={20} className="text-emerald-600" />
                  <span>توزيع الصيانات وحصة العملاء حسب موديل ونوع الفلتر</span>
                </h3>
                <p className="text-xs text-slate-500 font-bold mt-1">
                  مقارنة دوريات الصيانة وكثافة الزيارات الميدانية لكل نوع
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-[#f8fafc] border-b border-slate-100 text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-black">نوع وموديل الفلتر</th>
                    <th className="px-6 py-4 font-black text-center">عدد العملاء المشتركين</th>
                    <th className="px-6 py-4 font-black text-center">حصة العملاء %</th>
                    <th className="px-6 py-4 font-black text-center">الزيارات المنفذة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {(data?.maintenanceByFilterType || []).map((ft: any) => {
                    const custShare = overview.totalCustomers > 0 ? Math.round((ft.customerCount / overview.totalCustomers) * 100) : 0;
                    return (
                      <tr key={ft.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4 font-black text-slate-900 flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                          <span>{ft.name}</span>
                        </td>
                        <td className="px-6 py-4 text-center font-black text-slate-900">
                          {ft.customerCount} عميل
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full font-black text-xs">
                            {custShare}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center font-black text-emerald-700 text-base">
                          {ft.visitsCount} زيارة
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: TECHNICIAN PRODUCTIVITY */}
      {/* ======================================================== */}
      {activeTab === 'technicians' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/60">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Award size={22} className="text-amber-500" />
                  <span>تقرير كفاءة وإنتاجية الفنيين الميدانيين</span>
                </h3>
                <p className="text-xs text-slate-500 font-bold mt-1">
                  تقييم إنجاز الزيارات، الشمعات المركبة، والالتزام الميداني
                </p>
              </div>
              <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-xl">
                {data?.technicianStats?.length || 0} فنيين ميدانيين
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-[#f8fafc] border-b border-slate-100 text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-black">#</th>
                    <th className="px-6 py-4 font-black">اسم الفني</th>
                    <th className="px-6 py-4 font-black text-center">الزيارات المنفذة</th>
                    <th className="px-6 py-4 font-black text-center">الشمعات المركبة</th>
                    <th className="px-6 py-4 font-black text-center">متوسط الشمع / زيارة</th>
                    <th className="px-6 py-4 font-black text-center">تاريخ آخر زيارة</th>
                    <th className="px-6 py-4 font-black text-center">تقييم الكفاءة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {(data?.technicianStats || []).map((tech: any, idx: number) => {
                    const avg = tech.visitsCount > 0 ? (tech.candlesInstalled / tech.visitsCount).toFixed(1) : '0';
                    return (
                      <tr key={tech.id} className="hover:bg-amber-50/30 transition-colors">
                        <td className="px-6 py-4 text-xs font-black text-slate-400">{idx + 1}</td>
                        <td className="px-6 py-4 font-black text-slate-900 flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-xs">
                            {tech.name.split(' ')[1]?.[0] || 'ف'}
                          </div>
                          <span>{tech.name}</span>
                        </td>
                        <td className="px-6 py-4 text-center font-black text-slate-900 text-base">
                          {tech.visitsCount} <span className="text-xs text-slate-400 font-normal">زيارة</span>
                        </td>
                        <td className="px-6 py-4 text-center font-black text-emerald-700 text-base">
                          {tech.candlesInstalled} <span className="text-xs text-slate-400 font-normal">شمعة</span>
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-slate-600">
                          {avg} شمعة/زيارة
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-slate-700 text-xs">
                          {tech.lastVisitDate}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-black text-xs">
                            <Star size={12} fill="currentColor" /> {tech.score}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: GEOGRAPHY & ALL 27 GOVERNORATES COVERAGE */}
      {/* ======================================================== */}
      {activeTab === 'geography' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Active Governorates & Cities Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Active Governorates Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-teal-50/40">
                <h4 className="font-black text-slate-900 flex items-center gap-2">
                  <MapPin size={18} className="text-teal-700" />
                  <span>المحافظات ذات النشاط الميداني النشط</span>
                </h4>
                <span className="text-xs font-bold text-teal-800 bg-teal-100 px-2.5 py-1 rounded-xl">
                  {data?.governorateStats?.length || 0} محافظات نشطة
                </span>
              </div>
              <table className="w-full text-sm text-right">
                <thead className="bg-[#f8fafc] border-b border-slate-100 text-slate-500">
                  <tr>
                    <th className="px-6 py-3 font-black">المحافظة</th>
                    <th className="px-6 py-3 font-black text-center">عدد العملاء</th>
                    <th className="px-6 py-3 font-black text-center">الحصة %</th>
                    <th className="px-6 py-3 font-black text-center">الزيارات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {(data?.governorateStats || []).map((g: any, idx: number) => (
                    <tr key={g.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-3.5 font-black text-slate-900 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: govColors[idx % govColors.length] }}></span>
                        <span>{g.name}</span>
                      </td>
                      <td className="px-6 py-3.5 text-center font-black text-slate-900">{g.customerCount} عميل</td>
                      <td className="px-6 py-3.5 text-center">
                        <span className="px-2.5 py-0.5 bg-teal-50 text-teal-800 rounded-full font-black text-xs">{g.percentage}%</span>
                      </td>
                      <td className="px-6 py-3.5 text-center font-black text-emerald-700">{g.visitsCount} زيارة</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Top Centers & Cities Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-emerald-50/40">
                <h4 className="font-black text-slate-900 flex items-center gap-2">
                  <MapPin size={18} className="text-emerald-700" />
                  <span>المراكز والمدن ذات الأولوية (سمنود، المنصورة، طنطا...)</span>
                </h4>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-xl">
                  {data?.cityStats?.length || 0} مراكز
                </span>
              </div>
              <table className="w-full text-sm text-right">
                <thead className="bg-[#f8fafc] border-b border-slate-100 text-slate-500">
                  <tr>
                    <th className="px-6 py-3 font-black">المدينة / المركز</th>
                    <th className="px-6 py-3 font-black">المحافظة</th>
                    <th className="px-6 py-3 font-black text-center">عدد العملاء</th>
                    <th className="px-6 py-3 font-black text-center">الزيارات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {(data?.cityStats || []).map((c: any) => (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-3.5 font-black text-slate-900 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>{c.name}</span>
                      </td>
                      <td className="px-6 py-3.5 text-xs text-slate-500 font-bold">{c.governorateName}</td>
                      <td className="px-6 py-3.5 text-center font-black text-slate-900">{c.customerCount} عميل</td>
                      <td className="px-6 py-3.5 text-center font-black text-emerald-700">{c.visitsCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

          {/* ALL 27 Egyptian Governorates Table (التغطية الشاملة لكافة محافظات الجمهورية) */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/60">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <MapPin size={20} className="text-sky-700" />
                  <span>التغطية الإقليمية الشاملة لكافة محافظات جمهورية مصر العربية (27 محافظة)</span>
                </h3>
                <p className="text-xs text-slate-500 font-bold mt-1">
                  تأكيد إدراج جميع المحافظات الـ27 ومراكزها الـ232 وجاهزيتها للتسجيل والتوسع الميداني
                </p>
              </div>

              <div className="relative w-full md:w-72">
                <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="ابحث في الـ 27 محافظة..."
                  value={govSearchQuery}
                  onChange={(e) => setGovSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-8 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-sky-500"
                />
                {govSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setGovSearchQuery('')}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    title="مسح البحث"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto max-h-[450px]">
              <table className="w-full text-sm text-right">
                <thead className="bg-[#f8fafc] border-b border-slate-100 text-slate-500 sticky top-0 z-10">
                  <tr>
                    <th className="px-5 py-3 font-black">#</th>
                    <th className="px-5 py-3 font-black">اسم المحافظة</th>
                    <th className="px-5 py-3 font-black text-center">العملاء الحاليين</th>
                    <th className="px-5 py-3 font-black text-center">الزيارات المنفذة</th>
                    <th className="px-5 py-3 font-black text-center">نسبة الكثافة %</th>
                    <th className="px-5 py-3 font-black text-center">حالة التغطية والجاهزية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredAll27Govs.map((gov: any, idx: number) => (
                    <tr key={gov.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3 text-xs font-black text-slate-400">{idx + 1}</td>
                      <td className="px-5 py-3 font-black text-slate-900">{gov.name}</td>
                      <td className="px-5 py-3 text-center font-black text-slate-900">
                        {gov.customerCount > 0 ? `${gov.customerCount} عميل` : <span className="text-slate-400 font-normal">0</span>}
                      </td>
                      <td className="px-5 py-3 text-center font-black text-emerald-700">
                        {gov.visitsCount > 0 ? `${gov.visitsCount} زيارة` : <span className="text-slate-400 font-normal">0</span>}
                      </td>
                      <td className="px-5 py-3 text-center font-bold text-slate-600 text-xs">
                        {gov.percentage}%
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-black ${
                          gov.customerCount > 0 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200/60' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {gov.coverageStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 7: DETAILED VISITS LOG */}
      {/* ======================================================== */}
      {activeTab === 'visits' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/60">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <FileText size={20} className="text-emerald-700" />
                  <span>سجل زيارات الصيانة الميدانية التفصيلي المعتمد</span>
                </h3>
                <p className="text-xs text-slate-500 font-bold mt-1">
                  سجل تفصيلي بكافة الزيارات المنفذة والشمعات المستبدلة وتاريخ الصيانة
                </p>
              </div>
              <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-xl">
                {data?.detailedVisits?.length || 0} زيارة مسجلة
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-[#f8fafc] border-b border-slate-100 text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-black">تاريخ الزيارة</th>
                    <th className="px-5 py-4 font-black">العميل والكود</th>
                    <th className="px-5 py-4 font-black">الهاتف والمنطقة</th>
                    <th className="px-5 py-4 font-black">الفني المسؤول</th>
                    <th className="px-5 py-4 font-black">نوع الفلتر</th>
                    <th className="px-5 py-4 font-black">الشمعات المستبدلة</th>
                    <th className="px-5 py-4 font-black">ملاحظات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {(!data?.detailedVisits || data.detailedVisits.length === 0) ? (
                    <tr>
                      <td colSpan={7} className="text-center py-16 text-slate-400 font-bold">
                        لا توجد زيارات مطابقة للفلتر المحدد حالياً.
                      </td>
                    </tr>
                  ) : (
                    data.detailedVisits.map((v: any) => (
                      <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-4 font-black text-slate-900 text-xs whitespace-nowrap">
                          {v.visitDate}
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-black text-slate-900">{v.customerName}</div>
                          <div className="text-xs text-emerald-700 font-bold">كود: #{v.customerCode}</div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-bold text-slate-800 text-xs" dir="ltr">{v.phone}</div>
                          <div className="text-[11px] text-slate-400 font-semibold">{v.governorateName} - {v.cityName}</div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-bold">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            {v.technicianName}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs font-bold text-slate-600">
                          {v.filterTypeName}
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-block px-3 py-1 bg-teal-50 text-teal-800 border border-teal-200/80 rounded-xl text-xs font-black">
                            {v.candlesSummary}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-500 max-w-xs truncate" title={v.notes}>
                          {v.notes || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. Official Printable Summary Box (Included at Bottom of All Pages for Print) */}
      <div className="bg-gradient-to-r from-slate-50 via-white to-sky-50/40 border-2 border-sky-200/80 p-6 md:p-8 rounded-3xl shadow-sm flex flex-col lg:flex-row justify-between items-center gap-6 print:border print:shadow-none">
        <div className="flex items-center gap-4 text-right">
          <div className="p-3.5 bg-white text-sky-700 rounded-2xl shadow-sm border border-sky-200">
            <FileText size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h4 className="text-xl font-black text-slate-900 mb-1">
              {companyProfile?.companyName || 'الملخص الإداري المعتمد لمؤسسة فلاتر الجمال'}
            </h4>
            <div className="text-slate-500 text-xs font-bold flex flex-wrap items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
              <span>{companyProfile?.slogan || 'صيانة فورية وتوريد شمعات ومحطات تحلية معتمدة بأعلى معايير النقاء'}</span>
              <span>• هاتف: {companyProfile?.phone1 || '01012345678'}</span>
              {companyProfile?.hotline && <span>• الخط الساخن: {companyProfile.hotline}</span>}
              <span>• تم الاستخراج آلياً بتاريخ {formatDate(new Date())}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 w-full lg:w-auto">
          <div className="bg-white px-5 py-3.5 rounded-2xl border border-slate-200 shadow-sm text-center min-w-[125px]">
            <div className="text-xs text-slate-500 font-bold mb-0.5">إجمالي العملاء</div>
            <div className="text-2xl font-black text-slate-900">{overview.totalCustomers} <span className="text-xs font-bold text-slate-400">عميل</span></div>
          </div>
          <div className="bg-white px-5 py-3.5 rounded-2xl border border-slate-200 shadow-sm text-center min-w-[125px]">
            <div className="text-xs text-slate-500 font-bold mb-0.5">الزيارات المنفذة</div>
            <div className="text-2xl font-black text-slate-900">{overview.totalVisits} <span className="text-xs font-bold text-slate-400">زيارة</span></div>
          </div>
          <div className="bg-white px-5 py-3.5 rounded-2xl border border-slate-200 shadow-sm text-center min-w-[125px]">
            <div className="text-xs text-slate-500 font-bold mb-0.5">الشمع المستهلك</div>
            <div className="text-2xl font-black text-sky-800">{overview.totalCandlesConsumed} <span className="text-xs font-bold text-slate-400">شمعة</span></div>
          </div>
          <div className="bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-500 text-white px-6 py-3.5 rounded-2xl shadow-md shadow-sky-500/20 text-center min-w-[180px] border border-sky-400/30">
            <div className="text-xs text-sky-100 font-bold mb-0.5">رأس مال المخزن</div>
            <div className="text-2xl md:text-3xl font-black text-white">{overview.totalInventoryValue.toLocaleString('ar-EG')} <span className="text-xs font-bold text-sky-200">ج.م</span></div>
          </div>
        </div>
      </div>

      {/* Official Signatures Block - Shown on Print Only */}
      <div className="hidden print:flex justify-between items-center pt-10 px-8 text-center text-xs font-black text-slate-800">
        <div>
          <div className="mb-8">مسؤول الصيانة والمتابعة</div>
          <div className="w-36 border-b border-slate-400 mx-auto"></div>
        </div>
        <div>
          <div className="mb-8">مسؤول المخزن والتوريدات</div>
          <div className="w-36 border-b border-slate-400 mx-auto"></div>
        </div>
        <div>
          <div className="mb-8">المشرف الفني العام</div>
          <div className="w-36 border-b border-slate-400 mx-auto"></div>
        </div>
        <div>
          <div className="mb-8">خاتم واعتماد الإدارة التنفيذية</div>
          <div className="w-36 border-b border-slate-400 mx-auto"></div>
        </div>
      </div>

    </div>
  );
}

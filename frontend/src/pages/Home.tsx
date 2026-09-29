import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { fetchApi } from '../api';
import { 
  Users, AlertTriangle, Clock, Calendar as CalendarIcon, 
  CheckCircle, Activity, ChevronLeft, MapPin, Database, 
  Package, TrendingUp, Sparkles, ShieldCheck, ArrowUpRight,
  BarChart3, Percent, ArrowUpDown, Zap
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Link } from 'react-router-dom';
import { formatDate } from '../utils/dateFormatter';

export default function Home() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // SAS Visual Analytics Interactive Modes
  const [govViewMode, setGovViewMode] = useState<'bars' | 'distribution'>('bars');
  const [stageSortMode, setStageSortMode] = useState<'default' | 'highest'>('default');

  const { data: dashboardData, isLoading: loading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await fetchApi('/dashboard');
      return res.data;
    },
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (dashboardData) {
      setData(dashboardData);
    }
  }, [dashboardData]);

  if (loading && !data) return (
    <div className="p-12 text-center flex flex-col items-center justify-center min-h-[350px]">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-slate-700 font-black text-base">جاري تحميل لوحة التحكم الذكية...</p>
    </div>
  );

  // Distinct, harmonious multi-colored palette for Governorates (الغربية، الدقهلية، القاهرة، الجيزة، الإسكندرية...)
  const govColors = [
    '#059669', // Emerald (الغربية)
    '#d97706', // Warm Amber (الدقهلية)
    '#6366f1', // Royal Indigo (القاهرة)
    '#e11d48', // Crimson Rose (الإسكندرية)
    '#0284c7', // Sky Azure (الجيزة)
    '#8b5cf6', // Violet Orchid (كفر الشيخ)
    '#f97316', // Sunset Orange (الشرقية)
    '#0d9488', // Deep Teal (القليوبية)
    '#0891b2', // Cyan (دمياط)
    '#4f46e5', // Deep Purple
  ];

  // Specific, identifiable colors for each of the 7 stages of water filter cartridges
  const stageColors: Record<number, string> = {
    0: '#0d9488', // Stage 1 (Teal)
    1: '#0284c7', // Stage 2 (Sky Blue)
    2: '#6366f1', // Stage 3 (Indigo)
    3: '#e11d48', // Stage 4 Membrane (Red/Rose)
    4: '#d97706', // Stage 5 Post (Amber)
    5: '#9333ea', // Stage 6 Calcite (Purple)
    6: '#059669', // Stage 7 Infrared (Emerald)
  };

  const stageLabels = [
    { short: 'شمعة أولى', sub: 'أولى' },
    { short: 'شمعة ثانية', sub: 'ثانية' },
    { short: 'شمعة ثالثة', sub: 'ثالثة' },
    { short: 'أملاح (ممبرين)', sub: 'ممبرين' },
    { short: 'بوست كربون', sub: 'بوست' },
    { short: 'كالسيوم (كالسيت)', sub: 'كالسيت' },
    { short: 'انفراريد', sub: 'انفراريد' },
  ];

  // Extract filter stats dynamically
  const count7 = data.filterStats?.find((f: any) => f.name?.includes('7'))?.count || 0;
  const count5 = data.filterStats?.find((f: any) => f.name?.includes('5'))?.count || 0;
  const count3 = data.filterStats?.find((f: any) => f.name?.includes('3'))?.count || 0;

  const formattedFilterConsumption = (data.filterConsumptionData || []).map((item: any, idx: number) => ({
    ...item,
    shortName: stageLabels[idx]?.short || `م ${idx + 1}`,
    subName: stageLabels[idx]?.sub || '',
    fullName: item.name
  }));

  // SAS Dynamic Calculations
  const totalGovClients = (data.govStats || []).reduce((acc: number, curr: any) => acc + (curr.value || 0), 0) || 1;

  const sortedFilterConsumption = [...formattedFilterConsumption].sort((a, b) => {
    if (stageSortMode === 'highest') {
      return (b.value || 0) - (a.value || 0);
    }
    return 0; // keeps natural stage sequence 1-7
  });

  return (
    <div className="space-y-6">
      
      {/* 1. Executive Pearl-White & Balanced Royal Banner - Framed with Harmonious Medium Royal Border */}
      <div className="bg-gradient-to-r from-white via-blue-50/50 to-indigo-50/40 rounded-3xl p-6 md:p-8 text-slate-800 shadow-sm border-2 border-blue-400/90 relative overflow-hidden flex flex-col md:flex-row justify-between items-center md:items-start gap-6 hover:shadow-md transition-all">
        {/* Soft, comfortable ambient glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-200/35 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-200/30 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 w-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-black px-3.5 py-1 rounded-full shadow-xs flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-300" />
                  منظومة فلاتر الجمال الذكية
                </span>
                <span className="text-xs font-black text-blue-700 bg-white/95 px-3 py-1 rounded-full border border-blue-200 shadow-2xs">
                  الرقابة الميدانية والمخزنية المتكاملة
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-2">
                أهلاً بك، {user?.username} 👋
              </h1>
              <p className="text-slate-600 text-sm font-semibold mt-1">
                لوحة التحكم المركزية • متابعة العملاء، مواعيد الصيانة الدورية، مراقبة المخزون، والتوزيع الجغرافي.
              </p>
            </div>
            
            <div className="flex flex-col items-start md:items-end gap-2">
              <div className="bg-white/95 px-4 py-1.5 rounded-full text-xs font-black flex items-center gap-2 border border-blue-200 text-slate-700 shadow-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                السيرفر متصل ومحدث لحظياً
              </div>
              <div className="text-xs font-bold text-slate-700 bg-white/95 px-4 py-1 rounded-full border border-blue-200 shadow-xs">
                {formatDate(new Date())}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <Link 
              to="/customers" 
              state={{ openAdd: true }} 
              className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:brightness-110 text-white px-5 py-2.5 rounded-2xl font-black flex items-center gap-2 shadow-md shadow-blue-600/25 transition-all hover:scale-105 text-sm border border-blue-400/30"
            >
              <PlusCircleIcon size={18} />
              إضافة عميل جديد
            </Link>
            <Link 
              to="/maintenance" 
              state={{ openAdd: true }} 
              className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:brightness-110 text-white px-5 py-2.5 rounded-2xl font-black flex items-center gap-2 shadow-md shadow-indigo-600/25 transition-all hover:scale-105 text-sm border border-indigo-400/30"
            >
              <WrenchIcon size={18} />
              تسجيل صيانة
            </Link>
            <Link 
              to="/reports" 
              className="bg-white hover:bg-blue-50 text-blue-900 border-2 border-blue-200 hover:border-blue-400 px-5 py-2.5 rounded-2xl font-black flex items-center gap-2 transition-all hover:scale-105 shadow-xs text-sm"
            >
              <Database size={18} className="text-blue-600" />
              التقارير والمخزن
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Top Stats Row - Distinct, Eye-Comfort Multi-Colored Palette */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 md:gap-4">
        
        {/* Card 1: Total Customers - Balanced Royal Blue */}
        <div className="bg-gradient-to-br from-blue-50/70 via-white to-blue-50/30 p-5 rounded-2xl shadow-sm border border-blue-200/80 flex flex-col justify-between hover:shadow-md transition-all hover:-translate-y-0.5">
          <div className="flex justify-between items-start mb-2">
            <div className="bg-blue-100 text-blue-700 p-2.5 rounded-2xl shadow-xs">
              <Users size={20} strokeWidth={2.5} />
            </div>
            <h3 className="text-slate-600 text-xs font-black text-left leading-tight">إجمالي قاعدة العملاء</h3>
          </div>
          <div className="flex justify-between items-end mt-4">
            <Link to="/customers" className="text-xs text-blue-700 font-black hover:underline flex items-center gap-0.5">
              السجل <ChevronLeft size={12}/>
            </Link>
            <span className="text-3xl font-black text-indigo-950">{data.totalCustomers}</span>
          </div>
        </div>

        {/* Card 2: Today's Maintenance - Warm Honey Amber */}
        <div className="bg-gradient-to-br from-amber-50/70 via-white to-amber-50/30 p-5 rounded-2xl shadow-sm border border-amber-200/80 flex flex-col justify-between hover:shadow-md transition-all hover:-translate-y-0.5">
          <div className="flex justify-between items-start mb-2">
            <div className="bg-amber-100 text-amber-700 p-2.5 rounded-2xl shadow-xs">
              <Clock size={20} strokeWidth={2.5} />
            </div>
            <h3 className="text-slate-600 text-xs font-black text-left leading-tight">مطلوبة اليوم</h3>
          </div>
          <div className="flex justify-between items-end mt-4">
            <Link to="/maintenance?tab=today" className="text-xs text-amber-700 font-black hover:underline flex items-center gap-0.5">
              اليوم <ChevronLeft size={12}/>
            </Link>
            <span className="text-3xl font-black text-amber-700">{data.maintenance.today}</span>
          </div>
        </div>

        {/* Card 3: Overdue Maintenance - Coral Crimson Rose */}
        <div className="bg-gradient-to-br from-rose-50/70 via-white to-rose-50/30 p-5 rounded-2xl shadow-sm border border-rose-200/80 flex flex-col justify-between hover:shadow-md transition-all hover:-translate-y-0.5">
          <div className="flex justify-between items-start mb-2">
            <div className="bg-rose-100 text-rose-700 p-2.5 rounded-2xl shadow-xs">
              <AlertTriangle size={20} strokeWidth={2.5} />
            </div>
            <h3 className="text-slate-600 text-xs font-black text-left leading-tight">متأخرة عن الموعد</h3>
          </div>
          <div className="flex justify-between items-end mt-4">
            <Link to="/maintenance?tab=overdue" className="text-xs text-rose-700 font-black hover:underline flex items-center gap-0.5">
              المتأخرات <ChevronLeft size={12}/>
            </Link>
            <span className="text-3xl font-black text-rose-700">{data.maintenance.overdue}</span>
          </div>
        </div>

        {/* Card 4: Upcoming Maintenance - Fresh Sky Cyan */}
        <div className="bg-gradient-to-br from-cyan-50/70 via-white to-cyan-50/30 p-5 rounded-2xl shadow-sm border border-cyan-200/80 flex flex-col justify-between hover:shadow-md transition-all hover:-translate-y-0.5">
          <div className="flex justify-between items-start mb-2">
            <div className="bg-cyan-100 text-cyan-700 p-2.5 rounded-2xl shadow-xs">
              <CalendarIcon size={20} strokeWidth={2.5} />
            </div>
            <h3 className="text-slate-600 text-xs font-black text-left leading-tight">قادمة قريباً</h3>
          </div>
          <div className="flex justify-between items-end mt-4">
            <Link to="/maintenance?tab=upcoming" className="text-xs text-cyan-700 font-black hover:underline flex items-center gap-0.5">
              المجدولة <ChevronLeft size={12}/>
            </Link>
            <span className="text-3xl font-black text-cyan-800">{data.maintenance.upcoming}</span>
          </div>
        </div>

        {/* Card 5: Inventory & Stock - Forest Emerald */}
        <div className="bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/30 p-5 rounded-2xl shadow-sm border border-emerald-200/80 flex flex-col justify-between hover:shadow-md transition-all hover:-translate-y-0.5">
          <div className="flex justify-between items-start mb-2">
            <div className="bg-emerald-100 text-emerald-700 p-2.5 rounded-2xl shadow-xs">
              <Package size={20} strokeWidth={2.5} />
            </div>
            <h3 className="text-slate-600 text-xs font-black text-left leading-tight">الشمع المستهلك الموحد</h3>
          </div>
          <div className="flex justify-between items-end mt-4">
            <Link to="/reports" className="text-xs text-emerald-700 font-black hover:underline flex items-center gap-0.5">
              التقارير <ChevronLeft size={12}/>
            </Link>
            <span className="text-3xl font-black text-emerald-800">{data.consumedFilters}</span>
          </div>
        </div>

        {/* Card 6: Monthly Visits & Efficiency - Royal Teal */}
        <div className="bg-gradient-to-br from-teal-50/70 via-white to-teal-50/30 p-5 rounded-2xl shadow-sm border border-teal-200/80 flex flex-col justify-between hover:shadow-md transition-all hover:-translate-y-0.5">
          <div className="flex justify-between items-start mb-2">
            <div className="bg-teal-100 text-teal-700 p-2.5 rounded-2xl shadow-xs">
              <CheckCircle size={20} strokeWidth={2.5} />
            </div>
            <h3 className="text-slate-600 text-xs font-black text-left leading-tight">زيارات منفذة حديثاً</h3>
          </div>
          <div className="flex justify-between items-end mt-4">
            <Link to="/reports" className="text-xs text-teal-700 font-black hover:underline flex items-center gap-0.5">
              المنفذة <ChevronLeft size={12}/>
            </Link>
            <span className="text-3xl font-black text-teal-800">{data.monthlyVisits}</span>
          </div>
        </div>
      </div>

      {/* 2.5 SAS Interactive Operational Cockpit & Compliance Gauge */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200/90 hover:border-blue-300 transition-all">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl shadow-sm shadow-blue-600/20">
              <Zap size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-900 text-base">مؤشر الجاهزية التشغيلية والإنجاز الميداني (SAS Operational Cockpit)</h3>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-black px-2.5 py-0.5 rounded-full">
                  مباشر وقيد الرصد
                </span>
              </div>
              <p className="text-xs text-slate-500 font-bold mt-0.5">
                متابعة دقيقة لمعدل استجابة الفنيين وإنجاز زيارات الصيانة الدورية وتغطية العملاء
              </p>
            </div>
          </div>

          {/* Quick interactive drilldown chips */}
          <div className="flex flex-wrap items-center gap-2">
            <Link 
              to="/maintenance?tab=today"
              className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-black flex items-center gap-1.5 transition-all"
            >
              <Clock size={14} className="text-amber-600" />
              مطلوبة اليوم: {data.maintenance.today}
            </Link>
            <Link 
              to="/maintenance?tab=overdue"
              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-xs font-black flex items-center gap-1.5 transition-all"
            >
              <AlertTriangle size={14} className="text-rose-600" />
              المتأخرات: {data.maintenance.overdue}
            </Link>
            <Link 
              to="/maintenance?tab=upcoming"
              className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs font-black flex items-center gap-1.5 transition-all"
            >
              <CalendarIcon size={14} className="text-blue-600" />
              المجدولة: {data.maintenance.upcoming}
            </Link>
          </div>
        </div>

        {/* Progress & KPI Metrics Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div className="flex items-center gap-3 bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
            <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm shrink-0">
              <Percent size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center text-xs font-black mb-1">
                <span className="text-slate-600">نسبة الانضباط الميداني</span>
                <span className="text-blue-700">
                  {data.maintenance.overdue === 0 ? '100%' : `${Math.max(10, Math.min(99, Math.round(((data.totalCustomers - data.maintenance.overdue) / Math.max(1, data.totalCustomers)) * 100)))}%`}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${data.maintenance.overdue === 0 ? 100 : Math.max(10, Math.min(99, Math.round(((data.totalCustomers - data.maintenance.overdue) / Math.max(1, data.totalCustomers)) * 100)))}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-sm shrink-0">
              <CheckCircle size={18} />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-bold">الزيارات المنجزة هذا الشهر</div>
              <div className="text-lg font-black text-emerald-800">{data.monthlyVisits} زيارة مكتملة</div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
            <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-sm shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-bold">حالة شبكة العملاء الإجمالية</div>
              <div className="text-lg font-black text-purple-800">{data.totalCustomers} أجهزة تعمل بكفاءة</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Second Row - Filter Types with Balanced, Distinct Themed Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 7 Stages Card - Royal Indigo Accent */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 hover:border-indigo-200 flex items-center justify-between transition-all">
          <div>
            <h4 className="font-black text-slate-900 text-base">فلاتر 7 مراحل (RO أمريكي)</h4>
            <p className="text-xs text-slate-500 mt-1 font-bold">دورية صيانة كل 3 أشهر • أعلى طلب</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black text-indigo-900">{count7} عميل</span>
            <div className="bg-indigo-600 text-white font-black text-xs px-2.5 py-1 rounded-xl shadow-xs">7M</div>
          </div>
        </div>

        {/* 5 Stages Card - Sky Cyan Accent */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 hover:border-cyan-200 flex items-center justify-between transition-all">
          <div>
            <h4 className="font-black text-slate-900 text-base">فلاتر 5 مراحل (ألترا فلتريشن)</h4>
            <p className="text-xs text-slate-500 mt-1 font-bold">دورية صيانة كل 4 أشهر • بدون موتور</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black text-cyan-800">{count5} عميل</span>
            <div className="bg-cyan-600 text-white font-black text-xs px-2.5 py-1 rounded-xl shadow-xs">5M</div>
          </div>
        </div>

        {/* 3 Stages Card - Sunset Bronze / Amber Accent */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 hover:border-amber-200 flex items-center justify-between transition-all">
          <div>
            <h4 className="font-black text-slate-900 text-base">فلاتر 3 مراحل (كلاسيك)</h4>
            <p className="text-xs text-slate-500 mt-1 font-bold">دورية صيانة كل 6 أشهر</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black text-amber-800">{count3} عميل</span>
            <div className="bg-amber-600 text-white font-black text-xs px-2.5 py-1 rounded-xl shadow-xs">3M</div>
          </div>
        </div>
      </div>

      {/* 4. Warehouse & Inventory Intelligence Strip - Balanced Royal Pearl Theme */}
      {data.inventorySummary && (
        <div className="bg-gradient-to-r from-blue-50/80 via-white to-indigo-50/60 text-slate-800 p-5 md:p-6 rounded-3xl shadow-sm border-2 border-blue-400/90 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-blue-100 text-blue-700 border border-blue-200 rounded-2xl">
              <Package size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base text-slate-900">الرقابة المالية والمخزنية الموحدة</span>
                <span className="bg-blue-100 text-blue-800 text-[11px] font-black px-2.5 py-0.5 rounded-full border border-blue-200">
                  ربط أوتوماتيكي مع الصيانة
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                تخصم الشمعات وقطع الغيار فوراً من المخزن عند تنفيذ أي زيارة صيانة ميدانية.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="text-center">
              <div className="text-[11px] text-slate-500 font-bold">رأس مال المخزن</div>
              <div className="font-black text-emerald-700 text-lg">{data.inventorySummary.totalCapital.toLocaleString('ar-EG')} ج.م</div>
            </div>
            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
            <div className="text-center">
              <div className="text-[11px] text-slate-500 font-bold">إجمالي القطع المتوفرة</div>
              <div className="font-black text-amber-700 text-lg">{data.inventorySummary.totalUnits} قطعة</div>
            </div>
            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
            <div className="text-center">
              <div className="text-[11px] text-slate-500 font-bold">أنواع الأصناف</div>
              <div className="font-black text-blue-700 text-lg">{data.inventorySummary.totalItems} صنف</div>
            </div>
            <Link 
              to="/reports" 
              className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:to-indigo-700 text-white font-black px-4 py-2.5 rounded-2xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/25 border border-blue-400/30"
            >
              تقرير المخزن الكامل <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      )}

      {/* 5. Multicolored Charts Row with SAS Interactive View & Sort Toggles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gov Chart - Rich Multicolored Bars or SAS Percent Distribution */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-teal-50 text-teal-700 p-2.5 rounded-2xl">
                <MapPin size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base">توزيع العملاء جغرافياً حسب المحافظات</h3>
                <p className="text-xs text-slate-500 font-bold">إجمالي العملاء الموزعين: {totalGovClients} عميل</p>
              </div>
            </div>
            
            {/* SAS Interactive View Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setGovViewMode('bars')}
                className={`px-3 py-1 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all ${
                  govViewMode === 'bars' 
                    ? 'bg-white text-blue-700 shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="عرض الأعمدة البيانية"
              >
                <BarChart3 size={14} />
                أعمدة
              </button>
              <button
                type="button"
                onClick={() => setGovViewMode('distribution')}
                className={`px-3 py-1 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all ${
                  govViewMode === 'distribution' 
                    ? 'bg-white text-blue-700 shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="عرض الحصص والنسب المئوية"
              >
                <Percent size={14} />
                الحصص %
              </button>
            </div>
          </div>

          {govViewMode === 'bars' ? (
            <div className="h-64 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.govStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={32}>
                  <defs>
                    {data.govStats.map((_: any, index: number) => {
                      const baseColor = govColors[index % govColors.length];
                      return (
                        <linearGradient key={`govGrad-${index}`} id={`govGrad-${index}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={baseColor} stopOpacity={1} />
                          <stop offset="100%" stopColor={baseColor} stopOpacity={0.6} />
                        </linearGradient>
                      );
                    })}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{fontSize: 12, fill: '#475569', fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc', opacity: 0.6}} 
                    contentStyle={{borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 8px 25px rgba(0,0,0,0.08)', fontWeight: 'bold'}} 
                  />
                  <Bar dataKey="value" radius={[12, 12, 4, 4]}>
                    {data.govStats.map((_: any, index: number) => (
                      <Cell key={`cell-gov-${index}`} fill={`url(#govGrad-${index})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            /* SAS Visual Ranked Distribution View */
            <div className="h-64 overflow-y-auto space-y-2.5 pr-1">
              {data.govStats.map((entry: any, index: number) => {
                const percentage = ((entry.value / totalGovClients) * 100).toFixed(1);
                const color = govColors[index % govColors.length];
                return (
                  <div key={index} className="p-2.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-100 transition-all">
                    <div className="flex justify-between items-center text-xs font-black mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: color }} />
                        <span className="text-slate-800 font-black">{entry.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-bold">{entry.value} عميل</span>
                        <span className="bg-white px-2 py-0.5 rounded-lg border border-slate-200 text-slate-900 font-black text-[11px] shadow-2xs">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500" 
                        style={{ width: `${Math.max(4, Number(percentage))}%`, backgroundColor: color }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          <div className="pt-3 mt-2 border-t border-slate-100 flex justify-between items-center text-xs font-bold text-slate-500">
            <span>الترتيب الجغرافي: سمنود والغربية أولوية أولى</span>
            <Link to="/customers" className="text-blue-600 font-black flex items-center gap-1 hover:underline">
              عرض سجل العملاء الكامل <ChevronLeft size={14}/>
            </Link>
          </div>
        </div>

        {/* Filter Cartridges Consumption Chart - Distinct Stage Colors & SAS Interactive Sort */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 text-blue-700 p-2.5 rounded-2xl border border-blue-100">
                <Database size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base">استهلاك مراحل الشمع (موحد مع التقارير)</h3>
                <p className="text-xs text-slate-500 font-bold">إجمالي المستهلك {data.consumedFilters} شمعة عبر زيارات الصيانة</p>
              </div>
            </div>

            {/* SAS Interactive Sort Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setStageSortMode('default')}
                className={`px-3 py-1 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all ${
                  stageSortMode === 'default' 
                    ? 'bg-white text-blue-700 shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="الترتيب حسب المراحل (1-7)"
              >
                المراحل 1-7
              </button>
              <button
                type="button"
                onClick={() => setStageSortMode('highest')}
                className={`px-3 py-1 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all ${
                  stageSortMode === 'highest' 
                    ? 'bg-white text-blue-700 shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="الترتيب حسب الأكثر استهلاكاً"
              >
                <ArrowUpDown size={14} />
                الأعلى طلباً
              </button>
            </div>
          </div>
          
          <div className="h-56 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sortedFilterConsumption} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={36}>
                <defs>
                  {sortedFilterConsumption.map((entry: any, index: number) => {
                    const originalIndex = formattedFilterConsumption.findIndex((f: any) => f.shortName === entry.shortName);
                    const baseColor = stageColors[originalIndex >= 0 ? originalIndex : index] || '#0d9488';
                    return (
                      <linearGradient key={`stageGrad-${index}`} id={`stageGrad-${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={baseColor} stopOpacity={1} />
                        <stop offset="100%" stopColor={baseColor} stopOpacity={0.5} />
                      </linearGradient>
                    );
                  })}
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="shortName" 
                  tick={{fontSize: 10, fill: '#334155', fontWeight: '800', angle: -25, textAnchor: 'end'}} 
                  axisLine={false} 
                  tickLine={false} 
                  interval={0} 
                  dy={10}
                />
                <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip 
                  cursor={{fill: '#f8fafc', opacity: 0.6}} 
                  formatter={(value: any, name: any, item: any) => [
                    `${value} شمعة مستهلكة (${item?.payload?.subName})`, 
                    item?.payload?.shortName
                  ]}
                  contentStyle={{borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 8px 25px rgba(0,0,0,0.08)', fontWeight: 'bold'}} 
                />
                <Bar dataKey="value" radius={[12, 12, 4, 4]}>
                  {sortedFilterConsumption.map((entry: any, index: number) => (
                    <Cell key={`cell-stage-${index}`} fill={`url(#stageGrad-${index})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Clean Color-Coded Stage Legend Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 pt-6 mt-2 border-t border-slate-100">
            {formattedFilterConsumption.map((st: any, i: number) => (
              <div 
                key={i} 
                className="flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-50/80 border border-slate-200/60 text-[10.5px] truncate"
                title={`${st.shortName}: ${st.subName} (${st.value} شمعة)`}
              >
                <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: stageColors[i] || '#0d9488' }} />
                <div className="truncate min-w-0 flex-1">
                  <span className="font-black text-slate-800 ml-1 truncate block">{st.shortName}</span>
                </div>
                <span className="font-black text-slate-900 bg-white px-1.5 py-0.5 rounded-md border border-slate-200/60 shrink-0">
                  {st.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. Bottom Row - Activity Log & Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Activity Logs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/60">
            <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
              <Activity className="text-blue-600" size={18}/> آخر تحركات وتغييرات المستخدمين بالنظام
            </h3>
            <Link to="/reports" className="text-xs text-blue-600 font-black hover:underline">سجل الأنشطة الكامل</Link>
          </div>
          <div className="p-5 flex-1 flex items-center justify-center text-slate-500 text-sm font-bold min-h-[140px]">
            {data.recentLogs && data.recentLogs.length > 0 ? (
              <ul className="w-full space-y-2.5">
                {data.recentLogs.map((log: any) => (
                  <li key={log.id} className="flex justify-between items-center text-xs p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="font-black text-slate-700">{log.action} - {log.entityName}</span>
                    <span className="text-slate-400 font-bold">{new Date(log.createdAt).toLocaleTimeString('ar-EG')}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center text-slate-400 font-bold">
                <CheckCircle className="mx-auto mb-1 text-emerald-500" size={22} />
                جميع العمليات المخزنية والميدانية موثقة ومؤمنة بالكامل.
              </div>
            )}
          </div>
        </div>

        {/* Today's Maintenance List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/60">
            <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
              <Clock className="text-amber-600" size={18}/> عمليات الصيانة المطلوبة اليوم ({data.maintenance.today})
            </h3>
            <Link to="/maintenance?tab=today" className="text-xs text-amber-700 font-black hover:underline">عرض الكل</Link>
          </div>
          <div className="p-5 flex-1 min-h-[140px]">
            {data.todaysList.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm font-bold py-6">
                <span className="text-3xl mb-1">🎉</span>
                <span>لا توجد صيانات مطلوبة اليوم، جميع الأجهزة بحالة ممتازة!</span>
              </div>
            ) : (
              <ul className="space-y-2.5">
                {data.todaysList.map((c: any) => (
                  <li key={c.id} className="flex justify-between items-center p-2.5 rounded-xl bg-amber-50/40 border border-amber-100 hover:bg-amber-50/80 transition-colors">
                    <div>
                      <div className="font-black text-slate-800 text-sm">{c.name}</div>
                      <div className="text-[11px] text-slate-500 font-bold">كود العميل: #{c.customerCode || '---'}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-600" dir="ltr">{c.phone1}</span>
                      <Link 
                        to="/maintenance" 
                        state={{ openAdd: c.id }}
                        className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-black px-3 py-1.5 rounded-xl transition-all shadow-xs"
                      >
                        تسجيل
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple icons for buttons
function PlusCircleIcon({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>;
}

function WrenchIcon({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>;
}

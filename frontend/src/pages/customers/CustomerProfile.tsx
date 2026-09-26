import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchApi } from '../../api';
import { ArrowRight, AlertTriangle, MapPin, Plus, CheckCircle, Clock, Trash2, Edit2, Sparkles, FileText, Phone, Settings, Calendar as CalendarIcon, Printer, X, Loader2 } from 'lucide-react';
import { formatDate } from '../../utils/dateFormatter';
import CustomerForm from './CustomerForm';
import AddMaintenanceModal from '../maintenance/AddMaintenanceModal';

export default function CustomerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<any>(null);
  const [companyProfile, setCompanyProfile] = useState<any>(null);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);

  // Edit & Delete Visit States
  const [editingVisit, setEditingVisit] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    visitDate: '',
    employeeId: '',
    item1: false,
    item2: false,
    item3: false,
    itemPost: false,
    itemCalcium: false,
    itemInfrared: false,
    itemSalts: false,
    notes: ''
  });
  const [isSavingVisit, setIsSavingVisit] = useState(false);
  const [deletingVisitId, setDeletingVisitId] = useState<string | null>(null);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const [res, settingsRes, empRes] = await Promise.all([
        fetchApi(`/customers/${id}`),
        fetchApi('/settings').catch(() => null),
        fetchApi('/employees').catch(() => null)
      ]);
      setCustomer(res.data);
      if (settingsRes?.companyProfile) {
        setCompanyProfile(settingsRes.companyProfile);
      }
      if (empRes?.data || Array.isArray(empRes)) {
        const empList = empRes.data || empRes;
        setTechnicians(empList.filter((e: any) => e.isTechnician));
      }
    } catch (e) {
      console.error(e);
      alert('العميل غير موجود');
      navigate('/customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [id]);

  const handleOpenEditVisit = (visit: any) => {
    setEditingVisit(visit);
    setEditForm({
      visitDate: visit.visitDate ? visit.visitDate.substring(0, 10) : new Date().toISOString().split('T')[0],
      employeeId: visit.employeeId || '',
      item1: Boolean(visit.item1),
      item2: Boolean(visit.item2),
      item3: Boolean(visit.item3),
      itemPost: Boolean(visit.itemPost),
      itemCalcium: Boolean(visit.itemCalcium),
      itemInfrared: Boolean(visit.itemInfrared),
      itemSalts: Boolean(visit.itemSalts),
      notes: visit.notes || ''
    });
  };

  const handleSaveVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVisit) return;
    setIsSavingVisit(true);
    try {
      await fetchApi(`/maintenance/${editingVisit.id}`, {
        method: 'PUT',
        body: JSON.stringify(editForm)
      });
      setEditingVisit(null);
      await loadProfile();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'حدث خطأ أثناء تعديل بيانات الزيارة');
    } finally {
      setIsSavingVisit(false);
    }
  };

  const handleDeleteVisit = async (visit: any) => {
    const formatted = formatDate(visit.visitDate);
    const confirmed = window.confirm(`هل أنت متأكد من حذف هذه الزيارة بتاريخ ${formatted}؟\nسيتم تلقائياً تحديث مواعيد الصيانة للعميل بناءً على آخر زيارة متبقية.`);
    if (!confirmed) return;

    setDeletingVisitId(visit.id);
    try {
      await fetchApi(`/maintenance/${visit.id}`, {
        method: 'DELETE'
      });
      await loadProfile();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'حدث خطأ أثناء حذف الزيارة');
    } finally {
      setDeletingVisitId(null);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-bold">جاري تحميل الملف...</div>;
  if (!customer) return null;

  const today = new Date().toISOString().split('T')[0];
  const isOverdue = customer.nextMaintenanceDate && customer.nextMaintenanceDate < today;
  const overdueDays = isOverdue ? Math.floor((new Date().getTime() - new Date(customer.nextMaintenanceDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;

  const lastVisit = customer.visits?.[0];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 bg-slate-50/50 min-h-screen font-sans" dir="rtl">
      
      {/* Official Print Header - Appears when printing */}
      <div className="hidden print:flex justify-between items-center pb-6 mb-6 border-b-2 border-slate-800">
        <div className="flex items-center gap-4">
          <img 
            src="/logo-clean.png" 
            alt="شعار فلاتر الجمال" 
            className="w-16 h-16 object-contain" 
            onError={(e: any) => { e.currentTarget.src = '/logo.png'; }}
          />
          <div className="text-right">
            <h1 className="text-xl font-black text-slate-900">{companyProfile?.companyName || 'مؤسسة فلاتر الجمال لأنظمة معالجة وتحلية المياه'}</h1>
            <p className="text-xs text-slate-600 font-bold">{companyProfile?.slogan || 'صيانة فورية وتوريد شمعات ومحطات تحلية معتمدة'}</p>
            <div className="text-[11px] text-slate-500 font-bold mt-1">
              <span>هاتف: {companyProfile?.phone1 || '01012345678'}</span> • <span>الخط الساخن: {companyProfile?.hotline || '19000'}</span> • <span>س.ت: {companyProfile?.commercialRegister}</span>
            </div>
          </div>
        </div>
        <div className="text-left bg-slate-50 p-3 rounded-2xl border border-slate-200">
          <div className="text-xs font-black text-slate-900">بطاقة متابعة وصيانة العميل</div>
          <div className="text-[11px] font-bold text-slate-600">كود العميل: #{customer.id?.substring(0, 6)}</div>
          <div className="text-[10px] text-slate-400 font-bold mt-0.5">تاريخ الطباعة: {formatDate(new Date())}</div>
        </div>
      </div>

      <div className="flex items-center justify-between no-print">
        <button onClick={() => navigate('/customers')} className="flex items-center gap-2 text-slate-600 hover:text-blue-700 font-bold transition-colors w-fit text-sm">
          <ArrowRight size={18} className="rotate-180" /> العودة إلى سجل العملاء
        </button>
        <button 
          onClick={() => window.print()}
          className="px-4 py-2 bg-white hover:bg-blue-50 text-blue-900 border-2 border-blue-200 rounded-2xl font-black text-xs flex items-center gap-2 shadow-xs transition-all hover:scale-105"
        >
          <Printer size={16} className="text-blue-600" />
          <span>طباعة كارت المتابعة والضمان 🖨️</span>
        </button>
      </div>

      {isOverdue && (
        <div className="bg-amber-50/90 border border-amber-200 rounded-3xl p-4 md:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xs no-print">
          <div className="flex items-center gap-3 text-amber-900 font-black text-sm">
            <AlertTriangle size={22} className="text-amber-600 shrink-0" strokeWidth={2.5} />
            <span>تنبيه استحقاق الصيانة: هذا العميل تجاوز موعد الصيانة المجدول بحوالي {overdueDays} يوم.</span>
          </div>
          <button 
            onClick={() => setIsMaintenanceOpen(true)} 
            className="bg-gradient-to-r from-amber-600 to-amber-700 hover:brightness-110 text-white px-5 py-2.5 rounded-2xl font-black text-xs md:text-sm shadow-md shadow-amber-600/20 transition-all hover:scale-105"
          >
            تسجيل زيارة صيانة عاجلة
          </button>
        </div>
      )}

      {/* Unified Executive Customer Profile Frame */}
      <div className="bg-gradient-to-r from-white via-blue-50/50 to-indigo-50/40 rounded-3xl p-6 md:p-8 text-slate-800 shadow-sm border-2 border-blue-400/90 relative overflow-hidden flex flex-col justify-between gap-6 hover:shadow-md transition-all">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-200/35 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-blue-100 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100/90 text-blue-800 rounded-2xl flex items-center justify-center text-2xl font-black shadow-xs border border-blue-200 shrink-0">
              {customer.name.substring(0, 1)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-black px-3.5 py-1 rounded-full shadow-xs flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-300" />
                  منظومة فلاتر الجمال
                </span>
                <span className="text-xs font-bold text-blue-800 bg-white/90 px-3 py-1 rounded-full border border-blue-200 shadow-2xs">
                  كود العميل: #{customer.id?.substring(0, 6)}
                </span>
                <span className="text-xs font-bold text-slate-500 bg-white/80 px-2.5 py-1 rounded-full border border-slate-200/60">
                  {formatDate(new Date())}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-1">{customer.name}</h2>
              <div className="text-xs font-bold text-slate-600 mt-1 flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1.5"><MapPin size={15} className="text-blue-600" /> {customer.governorateName} - {customer.cityName} {customer.village ? `(${customer.village})` : ''}</span>
                {(() => {
                  if (!customer.nextMaintenanceDate) return <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-xl text-[11px] font-black border border-slate-200">غير محدد</span>;
                  const nextDate = new Date(customer.nextMaintenanceDate);
                  nextDate.setHours(0,0,0,0);
                  const todayDate = new Date();
                  todayDate.setHours(0,0,0,0);
                  const diffDays = Math.ceil((nextDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
                  if (diffDays < 0) return <span className="bg-rose-50 text-rose-700 px-3 py-1 rounded-xl text-[11px] font-black border border-rose-200">متأخرة ({Math.abs(diffDays)} يوم)</span>;
                  if (diffDays === 0) return <span className="bg-amber-50 text-amber-800 px-3 py-1 rounded-xl text-[11px] font-black border border-amber-200 animate-pulse">مطلوبة اليوم</span>;
                  if (diffDays <= 7) return <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-xl text-[11px] font-black border border-amber-200">قادمة قريباً</span>;
                  return <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-xl text-[11px] font-black border border-emerald-200">سارية</span>;
                })()}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto no-print">
            <button onClick={() => navigate('/customers')} className="px-4 py-2.5 text-xs font-black text-blue-900 bg-white hover:bg-blue-50 border-2 border-blue-200 rounded-2xl transition-all shadow-xs">رجوع للقائمة</button>
            <button onClick={() => setIsEditOpen(true)} className="px-4 py-2.5 text-xs font-black text-slate-700 bg-white border-2 border-blue-200 hover:bg-blue-50 rounded-2xl flex items-center gap-1.5 transition-all shadow-xs">
              <Edit2 size={15} className="text-amber-600" /> تعديل
            </button>
            <button onClick={async () => {
              if (confirm('تأكيد الحذف النهائي للعميل؟')) {
                await fetchApi(`/customers/${customer.id}`, { method: 'DELETE' });
                navigate('/customers');
              }
            }} className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 rounded-2xl font-black flex items-center gap-1.5 transition-all shadow-xs text-xs" title="حذف العميل">
              <Trash2 size={15} className="text-rose-500" /> حذف
            </button>
            <button onClick={() => setIsMaintenanceOpen(true)} className="px-5 py-2.5 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white hover:brightness-110 rounded-2xl font-black flex items-center gap-2 transition-all shadow-md shadow-blue-600/25 text-xs border border-blue-400/30">
              <Plus size={16} /> تسجيل زيارة صيانة جديدة
            </button>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/90 rounded-2xl p-4 flex flex-col justify-center items-center text-center border border-blue-200/80 shadow-xs">
            <span className="text-blue-700 text-[11px] font-black mb-1.5">أرقام الهواتف والتواصل</span>
            <span className="text-slate-900 font-black text-sm" dir="ltr">{customer.phone1}</span>
            {customer.phone2 && <span className="text-slate-600 font-bold text-xs mt-1" dir="ltr">{customer.phone2}</span>}
          </div>
          <div className="bg-white/90 rounded-2xl p-4 flex flex-col justify-center items-center text-center border border-blue-200/80 shadow-xs">
            <span className="text-blue-700 text-[11px] font-black mb-1.5">نوع الجهاز وفترة الصيانة المحددة</span>
            <span className="text-slate-900 font-black text-[15px]">{customer.filterTypeName}</span>
            <span className="text-slate-600 font-bold text-xs mt-1">دورية الصيانة: كل {customer.maintenanceIntervalMonths} أشهر</span>
          </div>
          <div className="bg-white/90 rounded-2xl p-4 flex flex-col justify-center items-center text-center border border-blue-200/80 shadow-xs">
            <span className="text-amber-700 text-[11px] font-black mb-1.5">تواريخ الصيانة الدورية</span>
            <span className="text-slate-600 font-bold text-xs mb-1.5">تاريخ التسجيل: {customer.lastMaintenanceDate ? formatDate(customer.lastMaintenanceDate) : '---'}</span>
            <span className="text-slate-900 font-black text-xs bg-white px-3 py-1 rounded-full border border-blue-200 shadow-xs">القادمة: {customer.nextMaintenanceDate ? formatDate(customer.nextMaintenanceDate) : 'غير محدد'}</span>
          </div>
          <div className="bg-white/90 rounded-2xl p-4 flex flex-col justify-center items-center text-center border border-blue-200/80 shadow-xs">
            <span className="text-teal-700 text-[11px] font-black mb-1.5">الملاحظات العامة</span>
            <span className="text-slate-800 font-bold text-xs">{customer.notes || 'لا توجد ملاحظات عامة'}</span>
          </div>
        </div>
      </div>

      {/* Last Visit Summary Card - Exact Match to User Image (Rich Teal-Green Theme) */}
      {lastVisit && (
        <div className="bg-gradient-to-r from-[#00897b] via-[#009688] to-[#00796b] text-white rounded-3xl shadow-lg p-6 relative overflow-hidden border border-[#00796b] hover:shadow-xl transition-all">
          <div className="flex flex-wrap items-center justify-between border-b border-white/20 pb-4 mb-4 gap-4">
            <div>
              <h3 className="text-lg md:text-xl font-black flex items-center gap-2 mb-1 text-white">
                <Sparkles size={22} className="text-amber-300 shrink-0" />
                <span>ملخص ما تم تغييره وتنفيذه في آخر صيانة تمت للعميل</span>
              </h3>
              <p className="text-teal-100 text-xs font-semibold mt-1">
                بتاريخ: {formatDate(lastVisit.visitDate)} | الفني المنفذ: <span className="font-black text-white">{lastVisit.employeeName || 'غير محدد'}</span>
              </p>
            </div>
            <div className="bg-[#00796b]/90 text-white px-4 py-1.5 rounded-full text-xs font-black border border-white/25 shadow-xs flex items-center gap-1.5">
              <span>زيارة منفذة رقم {customer.visits?.length || 1}</span>
            </div>
          </div>
          
          <div className="mb-4">
            <p className="text-xs font-black text-teal-100 mb-3">الشمعات والمراحل التي تم استبدالها في هذه الزيارة:</p>
            <div className="flex flex-wrap gap-2.5">
              {lastVisit.item1 && <span className="bg-white text-teal-950 px-4 py-1.5 rounded-full text-xs font-black shadow-sm flex items-center gap-1.5">✓ شمعة أولى</span>}
              {lastVisit.item2 && <span className="bg-white text-teal-950 px-4 py-1.5 rounded-full text-xs font-black shadow-sm flex items-center gap-1.5">✓ شمعة ثانية</span>}
              {lastVisit.item3 && <span className="bg-white text-teal-950 px-4 py-1.5 rounded-full text-xs font-black shadow-sm flex items-center gap-1.5">✓ شمعة ثالثة</span>}
              {lastVisit.itemPost && <span className="bg-white text-teal-950 px-4 py-1.5 rounded-full text-xs font-black shadow-sm flex items-center gap-1.5">✓ بوست كربون</span>}
              {lastVisit.itemCalcium && <span className="bg-white text-teal-950 px-4 py-1.5 rounded-full text-xs font-black shadow-sm flex items-center gap-1.5">✓ كالسيوم (كالسيت)</span>}
              {lastVisit.itemInfrared && <span className="bg-white text-teal-950 px-4 py-1.5 rounded-full text-xs font-black shadow-sm flex items-center gap-1.5">✓ انفراريد</span>}
              {lastVisit.itemSalts && <span className="bg-white text-rose-700 px-4 py-1.5 rounded-full text-xs font-black shadow-sm border border-rose-200 flex items-center gap-1.5">✓ أملاح (ممبرين)</span>}
              {!lastVisit.item1 && !lastVisit.item2 && !lastVisit.item3 && !lastVisit.itemPost && !lastVisit.itemCalcium && !lastVisit.itemInfrared && !lastVisit.itemSalts && (
                <span className="bg-white/20 text-white px-4 py-1.5 rounded-full text-xs font-bold border border-white/20">لم يتم استبدال أي شمعات في هذه الزيارة</span>
              )}
            </div>
          </div>
          
          <div className="bg-[#00695c]/80 border border-teal-400/30 p-3.5 rounded-2xl flex items-center gap-2">
            <span className="font-black text-amber-300 text-xs shrink-0">الملاحظات الفنية للزيارة الأخيرة:</span>
            <span className="text-white text-xs font-bold">{lastVisit.notes || 'زيارة تركيب أولى عند التسجيل'}</span>
          </div>
        </div>
      )}

      {/* History List */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6">
        <div className="mb-6">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-1">
            <Clock className="text-blue-600" size={20} strokeWidth={2.5} />
            <span>السجل التاريخي الشامل لكافة الزيارات الميدانية المنفذة ({customer.visits?.length || 0} زيارة)</span>
          </h3>
          <p className="text-slate-500 text-xs font-bold mr-7">إمكانية التعديل وحذف أي زيارة من السجل التاريخي للعميل مباشرة</p>
        </div>
        
        <div className="space-y-4">
          {customer.visits?.length === 0 ? (
            <div className="text-center p-8 text-slate-400 font-bold bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
              لا توجد أي زيارات ميدانية مسجلة حتى الآن لهذا العميل.
            </div>
          ) : (
            customer.visits.map((visit: any, idx: number) => (
              <div key={visit.id} className="border border-slate-200/70 bg-slate-50/60 rounded-2xl p-5 space-y-3">
                <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <span>تاريخ الزيارة المنفذة:</span>
                      <span className="text-blue-900">{formatDate(visit.visitDate)}</span>
                    </div>
                    <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full text-xs font-black">
                      زيارة #{customer.visits.length - idx}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-xs font-bold text-slate-600 bg-white px-3.5 py-1 border border-slate-200 rounded-full shadow-2xs">
                      الفني المنفذ: <span className="text-slate-900 font-black">{visit.employeeName || 'غير محدد'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 no-print">
                      <button 
                        onClick={() => handleOpenEditVisit(visit)}
                        title="تعديل بيانات هذه الزيارة"
                        className="w-8 h-8 flex items-center justify-center bg-amber-50 text-amber-700 rounded-xl hover:bg-amber-100 transition-colors border border-amber-200/60 hover:scale-105 active:scale-95 shadow-2xs"
                      >
                        <Edit2 size={14} strokeWidth={2.5} />
                      </button>
                      <button 
                        onClick={() => handleDeleteVisit(visit)}
                        disabled={deletingVisitId === visit.id}
                        title="حذف هذه الزيارة نهائياً"
                        className="w-8 h-8 flex items-center justify-center bg-rose-50 text-rose-700 rounded-xl hover:bg-rose-100 transition-colors border border-rose-200/60 hover:scale-105 active:scale-95 shadow-2xs disabled:opacity-50"
                      >
                        {deletingVisitId === visit.id ? (
                          <Loader2 size={14} className="animate-spin text-rose-600" />
                        ) : (
                          <Trash2 size={14} strokeWidth={2.5} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {visit.item1 && <span className="bg-white text-slate-800 px-3 py-1 rounded-xl text-xs font-bold border border-slate-200/80 shadow-2xs">✔️ شمعة أولى</span>}
                  {visit.item2 && <span className="bg-white text-slate-800 px-3 py-1 rounded-xl text-xs font-bold border border-slate-200/80 shadow-2xs">✔️ شمعة ثانية</span>}
                  {visit.item3 && <span className="bg-white text-slate-800 px-3 py-1 rounded-xl text-xs font-bold border border-slate-200/80 shadow-2xs">✔️ شمعة ثالثة</span>}
                  {visit.itemPost && <span className="bg-white text-slate-800 px-3 py-1 rounded-xl text-xs font-bold border border-slate-200/80 shadow-2xs">✔️ بوست كربون</span>}
                  {visit.itemCalcium && <span className="bg-white text-slate-800 px-3 py-1 rounded-xl text-xs font-bold border border-slate-200/80 shadow-2xs">✔️ كالسيوم (كالسيت)</span>}
                  {visit.itemInfrared && <span className="bg-white text-slate-800 px-3 py-1 rounded-xl text-xs font-bold border border-slate-200/80 shadow-2xs">✔️ انفراريد</span>}
                  {visit.itemSalts && <span className="bg-rose-50 text-rose-700 px-3 py-1 rounded-xl text-xs font-bold border border-rose-200 shadow-2xs">✔️ أملاح (ممبرين)</span>}
                </div>
                
                <div className="bg-white border border-slate-200/70 rounded-xl p-3 text-xs font-bold text-slate-600 shadow-2xs">
                  <span className="font-black text-slate-800 ml-1">الملاحظات الفنية:</span>
                  <span>{visit.notes || 'زيارة تركيب أولى عند التسجيل'}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Official Print Footer - Warranty Terms & Signatures */}
      <div className="hidden print:block pt-8 mt-8 border-t-2 border-slate-200 space-y-6">
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-700 font-bold leading-relaxed">
          <span className="font-black text-slate-900 block mb-1">شروط وضوابط وثيقة الضمان والصيانة المعتمدة:</span>
          {companyProfile?.warrantyNotice || 'الضمان سارٍ بشرط الالتزام بتغيير الشمعات والمراحل في مواعيدها الدورية المحددة من قِبل فني المؤسسة المعتمد.'}
        </div>

        <div className="flex justify-between items-center pt-6 px-10 text-center text-xs font-black text-slate-800">
          <div>
            <div className="mb-10">توقيع العميل المستلم</div>
            <div className="w-36 border-b border-slate-400 mx-auto"></div>
          </div>
          <div>
            <div className="mb-10">توقيع الفني المنفذ</div>
            <div className="w-36 border-b border-slate-400 mx-auto"></div>
          </div>
          <div>
            <div className="mb-10">ختم واعتماد مؤسسة فلاتر الجمال</div>
            <div className="w-36 border-b border-slate-400 mx-auto"></div>
          </div>
        </div>
      </div>

      {isEditOpen && <CustomerForm customerId={customer.id} onClose={() => setIsEditOpen(false)} onSaved={() => { setIsEditOpen(false); loadProfile(); }} />}
      {isMaintenanceOpen && <AddMaintenanceModal customerIdOverride={customer.id} onClose={() => setIsMaintenanceOpen(false)} onSaved={() => { setIsMaintenanceOpen(false); loadProfile(); }} />}

      {/* Edit Visit Modal */}
      {editingVisit && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto no-print" dir="rtl">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60 shadow-xs">
                  <Edit2 size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-lg">تعديل بيانات زيارة الصيانة</h3>
                  <p className="text-xs text-slate-500 font-bold">العميل: {customer.name} (#{customer.id?.substring(0, 6)})</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingVisit(null)}
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveVisit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1.5">تاريخ الزيارة المنفذة <span className="text-rose-500">*</span></label>
                  <input
                    type="date"
                    required
                    value={editForm.visitDate}
                    onChange={e => setEditForm({ ...editForm, visitDate: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1.5">الفني المنفذ للزيارة</label>
                  <select
                    value={editForm.employeeId}
                    onChange={e => setEditForm({ ...editForm, employeeId: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">اختر المهندس / الفني (اختياري)...</option>
                    {technicians.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Candles Checkboxes */}
              <div className="border border-slate-200 bg-slate-50/60 rounded-2xl p-4">
                <h4 className="font-black text-slate-800 mb-3 text-center flex items-center justify-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  الشمعات والمراحل التي تم تغييرها في هذه الزيارة:
                </h4>
                
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {[
                      { id: 'item1', label: 'شمعة أولى' },
                      { id: 'item2', label: 'شمعة ثانية' },
                      { id: 'item3', label: 'شمعة ثالثة' },
                      { id: 'itemPost', label: 'بوست كربون' },
                    ].map(item => {
                      const isChecked = Boolean((editForm as any)[item.id]);
                      return (
                        <label 
                          key={item.id} 
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border cursor-pointer select-none transition-all text-xs ${
                            isChecked 
                              ? 'border-2 border-blue-500 bg-blue-50 text-blue-950 font-black shadow-2xs scale-[1.02]' 
                              : 'border-slate-300 bg-white hover:border-slate-400 text-slate-700 font-bold'
                          }`}
                        >
                          <input 
                            type="checkbox" 
                            checked={isChecked} 
                            onChange={e => setEditForm({ ...editForm, [item.id]: e.target.checked })} 
                            className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                          />
                          <span>{item.label}</span>
                        </label>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {[
                      { id: 'itemCalcium', label: 'كالسيوم (كالسيت)' },
                      { id: 'itemInfrared', label: 'انفراريد' },
                      { id: 'itemSalts', label: 'أملاح (ممبرين)', isSalts: true },
                    ].map(item => {
                      const isChecked = Boolean((editForm as any)[item.id]);
                      return (
                        <label 
                          key={item.id} 
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border cursor-pointer select-none transition-all text-xs ${
                            isChecked 
                              ? item.isSalts
                                ? 'border-2 border-rose-500 bg-rose-50 text-rose-800 font-black shadow-2xs scale-[1.02]'
                                : 'border-2 border-blue-500 bg-blue-50 text-blue-950 font-black shadow-2xs scale-[1.02]' 
                              : item.isSalts
                                ? 'border-slate-300 bg-white hover:border-rose-300 text-rose-600 font-bold'
                                : 'border-slate-300 bg-white hover:border-slate-400 text-slate-700 font-bold'
                          }`}
                        >
                          <input 
                            type="checkbox" 
                            checked={isChecked} 
                            onChange={e => setEditForm({ ...editForm, [item.id]: e.target.checked })} 
                            className={`w-3.5 h-3.5 rounded cursor-pointer ${item.isSalts ? 'accent-rose-600 text-rose-600' : 'accent-blue-600 text-blue-600'}`}
                          />
                          <span className={!isChecked && item.isSalts ? 'text-rose-600' : ''}>{item.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5">ملاحظات الفني / تفاصيل الصيانة</label>
                <textarea
                  rows={3}
                  value={editForm.notes}
                  onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                  placeholder="سجل أية تفاصيل أو ملاحظات عن حالة الفلتر..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                ></textarea>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="submit"
                  disabled={isSavingVisit}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                >
                  {isSavingVisit ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                  <span>حفظ التعديلات</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditingVisit(null)}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-black text-xs transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

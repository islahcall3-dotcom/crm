import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../api';
import { 
  Users, X, Calendar as CalendarIcon, Clock, Loader2, 
  Phone, MapPin, Wrench, Droplets, Sparkles, CheckCircle2, 
  UserCheck, ShieldCheck, Home, AlertCircle, FileText, ChevronDown, Check
} from 'lucide-react';
import { formatDate } from '../../utils/dateFormatter';

export default function CustomerForm({ 
  onClose, 
  onSaved, 
  customerId 
}: { 
  onClose: () => void; 
  onSaved: () => void; 
  customerId?: string | null; 
}) {
  const [lookups, setLookups] = useState<any>({ governorates: [], cities: [], filterTypes: [], maintenanceIntervals: [] });
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(!!customerId);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    phone1: '',
    phone2: '',
    landline: '',
    governorateId: '',
    cityId: '',
    village: '',
    addressDetails: '',
    filterTypeId: '',
    maintenanceIntervalId: '',
    lastMaintenanceDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [nextMaintenanceDate, setNextMaintenanceDate] = useState('');
  
  const [initialVisit, setInitialVisit] = useState({
    item1: true,
    item2: true,
    item3: true,
    itemPost: true,
    itemCalcium: true,
    itemInfrared: false,
    itemSalts: false,
    notes: 'زيارة تركيب وصيانة أولية مسجلة مع إنشاء العميل'
  });

  const handleInitialVisitCheckbox = (name: string) => {
    setInitialVisit(prev => ({ ...prev, [name]: !(prev as any)[name] }));
  };
  // Zoom control
  const [formZoom, setFormZoom] = useState(() => {
    const saved = localStorage.getItem('appFormZoom');
    return saved ? parseInt(saved, 10) : 100;
  });

  useEffect(() => {
    localStorage.setItem('appFormZoom', formZoom.toString());
  }, [formZoom]);

  useEffect(() => {
    Promise.all([
      fetchApi('/lookups').then(setLookups)
    ]).catch(console.error);
  }, []);

  useEffect(() => {
    if (customerId) {
      setLoadingData(true);
      fetchApi(`/customers/${customerId}`).then(res => {
        const d = res.data;
        setFormData({
          name: d.name || '',
          phone1: d.phone1 || '',
          phone2: d.phone2 || '',
          landline: d.landline || '',
          governorateId: d.governorateId || '',
          cityId: d.cityId || '',
          village: d.village || '',
          addressDetails: d.addressDetails || '',
          filterTypeId: d.filterTypeId || '',
          maintenanceIntervalId: d.maintenanceIntervalId || '',
          lastMaintenanceDate: d.lastMaintenanceDate || '',
          notes: d.notes || ''
        });
      }).catch(err => {
        console.error(err);
        setError('فشل في تحميل بيانات العميل');
      }).finally(() => {
        setLoadingData(false);
      });
    }
  }, [customerId]);

  // Auto-calculate next maintenance date & smart interval preselection
  useEffect(() => {
    if (formData.lastMaintenanceDate && formData.maintenanceIntervalId) {
      const interval = lookups.maintenanceIntervals.find((m: any) => m.id === formData.maintenanceIntervalId);
      if (interval) {
        const date = new Date(formData.lastMaintenanceDate);
        date.setMonth(date.getMonth() + interval.months);
        setNextMaintenanceDate(date.toISOString().split('T')[0]);
      }
    } else {
      setNextMaintenanceDate('');
    }
  }, [formData.lastMaintenanceDate, formData.maintenanceIntervalId, lookups.maintenanceIntervals]);

  // Smart auto-select interval when filter type is selected (e.g. 7-stage -> 3 months, 5-stage -> 4 months)
  const handleFilterTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const fId = e.target.value;
    const selectedFT = lookups.filterTypes.find((f: any) => f.id === fId);
    let matchedIntervalId = formData.maintenanceIntervalId;

    if (selectedFT && lookups.maintenanceIntervals.length > 0) {
      if (selectedFT.name.includes('3 أشهر') || selectedFT.name.includes('7 مراحل')) {
        const match = lookups.maintenanceIntervals.find((m: any) => m.months === 3);
        if (match) matchedIntervalId = match.id;
      } else if (selectedFT.name.includes('4 أشهر') || selectedFT.name.includes('5 مراحل')) {
        const match = lookups.maintenanceIntervals.find((m: any) => m.months === 4);
        if (match) matchedIntervalId = match.id;
      } else if (selectedFT.name.includes('6 أشهر') || selectedFT.name.includes('3 مراحل')) {
        const match = lookups.maintenanceIntervals.find((m: any) => m.months === 6);
        if (match) matchedIntervalId = match.id;
      }
    }

    setFormData({
      ...formData,
      filterTypeId: fId,
      maintenanceIntervalId: matchedIntervalId
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    
    try {
      const payload: any = { ...formData };
      if (!payload.phone2) delete payload.phone2;
      if (!payload.landline) delete payload.landline;
      if (!payload.village) delete payload.village;
      if (!payload.addressDetails) delete payload.addressDetails;
      if (!payload.lastMaintenanceDate) delete payload.lastMaintenanceDate;
      if (!payload.filterTypeId) delete payload.filterTypeId;
      
      if (nextMaintenanceDate) {
        payload.nextMaintenanceDate = nextMaintenanceDate;
      }

      if (customerId) {
        await fetchApi(`/customers/${customerId}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        const res = await fetchApi('/customers', { method: 'POST', body: JSON.stringify(payload) });
        let newCustId = res.id;
        
        // Create baseline visit if any items selected
        if (Object.values(initialVisit).some(v => v === true)) {
          await fetchApi('/maintenance', {
            method: 'POST',
            body: JSON.stringify({
              customerId: newCustId,
              employeeId: '',
              visitDate: payload.lastMaintenanceDate || new Date().toISOString().split('T')[0],
              ...initialVisit,
              isBaseline: true,
              deductInventory: false
            })
          });
        }
      }

      onSaved();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء حفظ بيانات العميل');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // When governorate changes, reset cityId if it doesn't belong to it
    if (name === 'governorateId') {
      setFormData(prev => ({ ...prev, governorateId: value, cityId: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setFormData(prev => ({ ...prev, [e.target.name]: val }));
  };

  const availableCities = lookups.cities.filter((c: any) => c.governorateId === formData.governorateId);

  // Quick helper to check if phone is valid 11-digit Egyptian mobile
  const isValidMobile = formData.phone1.length === 11 && (
    formData.phone1.startsWith('010') || 
    formData.phone1.startsWith('011') || 
    formData.phone1.startsWith('012') || 
    formData.phone1.startsWith('015')
  );

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-3 md:p-6 z-50 overflow-hidden font-sans rtl">
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col border border-slate-200/90 overflow-hidden relative animate-in zoom-in-95 duration-200"
        style={{ zoom: `${formZoom}%` }}
      >
        
        {/* 1. Modal Header - Executive Pearl-White & Royal Blue */}
        <div className="sticky top-0 bg-gradient-to-r from-slate-50 via-white to-blue-50/50 border-b border-blue-200/80 p-5 md:p-6 flex justify-between items-center z-10 relative overflow-hidden">
          {/* Subtle ambient light mesh */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10 flex items-center gap-3.5">
            <div className="p-3 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white rounded-2xl shadow-md shadow-blue-600/25">
              <Users size={22} strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-black text-slate-900">
                  {customerId ? 'تعديل وتحديث بيانات العميل' : 'إضافة عميل جديد وتسجيل مبدئي'}
                </h2>
                <span className="bg-blue-50 text-blue-700 text-[11px] font-black px-2.5 py-0.5 rounded-full border border-blue-200 shadow-2xs">
                  منظومة فلاتر الجمال
                </span>
              </div>
              <p className="text-xs text-slate-500 font-bold mt-0.5">
                توثيق أرقام الهواتف، التوزيع الجغرافي، موديل الفلتر، وحساب مواعيد الصيانة القادمة آلياً
              </p>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-2.5">
            {/* Minimalist Zoom Control */}
            <div className="hidden sm:flex items-center bg-white/90 rounded-xl overflow-hidden border border-slate-200 shadow-xs" dir="ltr">
              <button 
                type="button" 
                onClick={() => setFormZoom(z => Math.max(70, z - 10))} 
                className="px-2.5 py-1 text-slate-600 hover:bg-blue-50 hover:text-blue-700 font-black text-xs transition-colors"
                title="تصغير الشاشة"
              >
                -
              </button>
              <span className="px-2 text-[11px] font-black text-slate-700 min-w-[36px] text-center">{formZoom}%</span>
              <button 
                type="button" 
                onClick={() => setFormZoom(z => Math.min(130, z + 10))} 
                className="px-2.5 py-1 text-slate-600 hover:bg-blue-50 hover:text-blue-700 font-black text-xs transition-colors"
                title="تكبير الشاشة"
              >
                +
              </button>
            </div>

            <button 
              onClick={onClose} 
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"
              title="إغلاق النافذة"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {error && (
          <div className="m-4 p-4 bg-rose-50 border border-rose-200 text-rose-700 font-bold rounded-2xl text-xs md:text-sm text-center flex items-center justify-center gap-2">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {loadingData ? (
          <div className="p-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            <p className="text-slate-600 font-black text-base">جاري استرجاع بيانات العميل والربط الجغرافي...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 md:p-7 space-y-6">
            
            {/* ======================================================== */}
            {/* SECTION 1: Personal & Phone Data (Balanced Royal Blue Theme) */}
            {/* ======================================================== */}
            <div className="bg-gradient-to-br from-blue-50/40 via-white to-blue-50/20 p-5 rounded-3xl border border-blue-100 shadow-xs space-y-4">


              {/* Customer Full Name */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5">
                  اسم العميل بالكامل <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input 
                    required 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    placeholder="اسم العميل ثلاثي أو رباعي (مثال: د/ حسام الدسوقي)..." 
                    className="w-full p-3 text-sm font-black text-slate-800 bg-white border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-xs placeholder:text-slate-400" 
                  />
                </div>
              </div>

              {/* Phone Numbers Grid (3 Columns) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                {/* Primary Phone */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-black text-slate-700">
                      الهاتف الرئيسي (محمول) <span className="text-rose-500">*</span>
                    </label>
                    {isValidMobile && (
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/70 flex items-center gap-1">
                        <Check size={10} strokeWidth={3} /> رقم صحيح
                      </span>
                    )}
                  </div>
                  <input 
                    required 
                    name="phone1" 
                    dir="ltr" 
                    maxLength={11}
                    value={formData.phone1} 
                    onChange={handleNumberChange} 
                    placeholder="" 
                    className={`w-full p-2.5 text-sm font-black border rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-right placeholder:text-right bg-white ${
                      formData.phone1.length > 0 && !isValidMobile ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'
                    }`} 
                  />
                </div>

                {/* Additional Phone */}
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1.5">هاتف إضافي / واتساب</label>
                  <input 
                    name="phone2" 
                    dir="ltr" 
                    maxLength={11}
                    value={formData.phone2} 
                    onChange={handleNumberChange} 
                    placeholder="" 
                    className="w-full p-2.5 text-sm font-bold border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-right placeholder:text-right bg-white" 
                  />
                </div>

                {/* Landline */}
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1.5">هاتف أرضي</label>
                  <input 
                    name="landline" 
                    dir="ltr" 
                    value={formData.landline} 
                    onChange={handleNumberChange} 
                    placeholder="" 
                    className="w-full p-2.5 text-sm font-bold border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-right placeholder:text-right bg-white" 
                  />
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* SECTION 2: Geography & Location (Cyan / Teal Theme) */}
            {/* ======================================================== */}
            <div className="bg-gradient-to-br from-teal-50/40 via-white to-teal-50/20 p-5 rounded-3xl border border-teal-100/90 shadow-xs space-y-4">


              {/* Governorate, City, Village */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* Governorate */}
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1.5">
                    المحافظة <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select 
                      required 
                      name="governorateId" 
                      value={formData.governorateId} 
                      onChange={handleChange} 
                      className="w-full p-2.5 text-sm border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none transition-all bg-white font-bold text-slate-800 appearance-none cursor-pointer pr-3 pl-8"
                    >
                      <option value="">اختر المحافظة...</option>
                      {lookups.governorates.map((g: any) => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* City */}
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1.5">
                    المركز / المدينة <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select 
                      required 
                      name="cityId" 
                      value={formData.cityId} 
                      onChange={handleChange} 
                      disabled={!formData.governorateId}
                      className="w-full p-2.5 text-sm border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none transition-all bg-white font-bold text-slate-800 appearance-none cursor-pointer pr-3 pl-8 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {!formData.governorateId ? 'اختر المحافظة أولاً' : 'اختر المركز / المدينة...'}
                      </option>
                      {availableCities.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Village / Area */}
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1.5">القرية / المنطقة / الحي</label>
                  <input 
                    name="village" 
                    value={formData.village} 
                    onChange={handleChange} 
                    placeholder="اسم القرية أو الحي إن وجد..." 
                    className="w-full p-2.5 text-sm border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none transition-all bg-white font-bold text-slate-800 placeholder:text-slate-400" 
                  />
                </div>
              </div>

              {/* Detailed Address */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5">العنوان بالتفصيل وعلامة مميزة</label>
                <textarea 
                  name="addressDetails" 
                  value={formData.addressDetails} 
                  onChange={handleChange} 
                  rows={2} 
                  placeholder="اسم الشارع بالتفصيل، رقم العمارة، الطابق، الشقة، وأي علامة مميزة لتسهيل وصول الفني للعميل فوراً..." 
                  className="w-full p-3 text-sm border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none transition-all resize-none bg-white font-bold text-slate-700 placeholder:text-slate-400" 
                />
              </div>
            </div>

            {/* ======================================================== */}
            {/* SECTION 3: Filter Specs & Maintenance Schedule (Blue & Slate Theme) */}
            {/* ======================================================== */}
            <div className="bg-gradient-to-br from-slate-50/60 via-white to-blue-50/30 p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">


              {/* Filter Type, Interval, Last Maintenance Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* Filter Type */}
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1.5">
                    نوع وموديل الفلتر المركّب <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select 
                      required 
                      name="filterTypeId" 
                      value={formData.filterTypeId} 
                      onChange={handleFilterTypeChange} 
                      className="w-full p-2.5 text-sm border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white font-black text-slate-800 appearance-none cursor-pointer pr-3 pl-8"
                    >
                      <option value="">اختر موديل الفلتر...</option>
                      {lookups.filterTypes.map((f: any) => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Maintenance Interval */}
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1.5">
                    دورية الصيانة المعتمدة <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select 
                      required 
                      name="maintenanceIntervalId" 
                      value={formData.maintenanceIntervalId} 
                      onChange={handleChange} 
                      className="w-full p-2.5 text-sm text-emerald-900 font-black bg-emerald-50/70 border border-emerald-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all appearance-none cursor-pointer pr-3 pl-8"
                    >
                      <option value="">اختر الدورية المعتمدة...</option>
                      {lookups.maintenanceIntervals.map((m: any) => (
                        <option key={m.id} value={m.id}>كل {m.months} أشهر (دورية {m.months} شهور)</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 pointer-events-none" />
                  </div>
                </div>

                {/* Last Maintenance Date */}
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1.5">
                    تاريخ التركيب / آخر صيانة <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input 
                      required 
                      type="date" 
                      name="lastMaintenanceDate" 
                      value={formData.lastMaintenanceDate} 
                      onChange={handleChange} 
                      className="w-full pl-3 pr-10 py-2.5 text-sm border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-black text-slate-700 bg-white" 
                    />
                    <CalendarIcon size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Live Auto-Calculated Next Maintenance Strip */}
              <div className="p-4 bg-gradient-to-r from-emerald-50/90 via-emerald-50/30 to-emerald-50/60 border-2 border-emerald-200/90 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3 font-black text-xs md:text-sm">
                  <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl shadow-xs">
                    <Clock size={18} strokeWidth={2.5} />
                  </div>
                  <div>
                    <div className="text-slate-900 font-black text-xs md:text-sm">موعد الصيانة القادمة المجدول (حساب تلقائي):</div>
                    <div className="text-[11px] text-slate-500 font-bold">يتم تسجيل هذا الموعد فورياً في جدول المتابعة الميدانية والداش بورد</div>
                  </div>
                </div>

                <div className="bg-white px-5 py-2.5 rounded-xl border border-emerald-300 text-emerald-900 font-black text-sm md:text-base tracking-wider shadow-xs min-w-[150px] text-center">
                  {nextMaintenanceDate ? (
                    formatDate(nextMaintenanceDate)
                  ) : (
                    '-- / -- / ----'
                  )}
                </div>
              </div>

              {/* Initial Visit Components for NEW CUSTOMERS ONLY */}
              {!customerId && (
                <div className="pt-4 mt-4 border-t border-slate-200/60">
                  <h4 className="font-black text-slate-800 mb-3 flex items-center gap-2 text-sm">
                    <Droplets size={18} className="text-blue-500" />
                    الشمعات والمراحل المركبة (تأسيس بدون الخصم من المخزن وبدون احتسابها كزيارة):
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      {[
                        { id: 'item1', label: 'شمعة أولى' },
                        { id: 'item2', label: 'شمعة ثانية' },
                        { id: 'item3', label: 'شمعة ثالثة' },
                        { id: 'itemPost', label: 'بوست كربون' },
                      ].map(item => {
                        const isChecked = Boolean((initialVisit as any)[item.id]);
                        return (
                          <label 
                            key={item.id} 
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border cursor-pointer select-none transition-all ${
                              isChecked 
                                ? 'border-2 border-blue-500 bg-blue-50 text-blue-950 font-black shadow-xs' 
                                : 'border-slate-300 bg-white hover:border-slate-400 text-slate-800 font-bold'
                            }`}
                          >
                            <input 
                              type="checkbox" 
                              checked={isChecked} 
                              onChange={() => handleInitialVisitCheckbox(item.id)} 
                              className="hidden"
                            />
                            <span className="text-xs">{item.label}</span>
                          </label>
                        );
                      })}
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      {[
                        { id: 'itemCalcium', label: 'كالسيوم (كالسيت)' },
                        { id: 'itemInfrared', label: 'انفراريد' },
                        { id: 'itemSalts', label: 'أملاح (ممبرين)', isSalts: true },
                      ].map(item => {
                        const isChecked = Boolean((initialVisit as any)[item.id]);
                        return (
                          <label 
                            key={item.id} 
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border cursor-pointer select-none transition-all ${
                              isChecked 
                                ? item.isSalts
                                  ? 'border-2 border-rose-500 bg-rose-50 text-rose-800 font-black shadow-xs'
                                  : 'border-2 border-blue-500 bg-blue-50 text-blue-950 font-black shadow-xs' 
                                : 'border-slate-300 bg-white hover:border-slate-400 text-slate-800 font-bold'
                            }`}
                          >
                            <input 
                              type="checkbox" 
                              checked={isChecked} 
                              onChange={() => handleInitialVisitCheckbox(item.id)} 
                              className="hidden"
                            />
                            <span className="text-xs">{item.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>



            {/* ======================================================== */}
            {/* SECTION 5: General Notes (Optional) */}
            {/* ======================================================== */}
            <div>
              <label className="block text-xs font-black text-slate-700 mb-1.5">ملاحظات الفلتر العامة والتوجيهات</label>
              <textarea 
                name="notes" 
                value={formData.notes} 
                onChange={handleChange} 
                rows={2} 
                placeholder="أي ملاحظات حول ضغط المياه، حالة الجهاز، طلبات خاصة للعميل..." 
                className="w-full p-3 text-sm border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none bg-white font-bold text-slate-700 placeholder:text-slate-400" 
              />
            </div>
            
            {/* ======================================================== */}
            {/* Sticky Action Footer */}
            {/* ======================================================== */}
            <div className="sticky bottom-0 bg-white/95 backdrop-blur-md pt-4 pb-2 border-t border-slate-100 flex justify-between items-center gap-3">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-6 py-2.5 bg-slate-100 text-slate-700 font-black rounded-2xl hover:bg-slate-200 transition-all text-xs md:text-sm"
              >
                إلغاء وتراجع
              </button>

              <button 
                type="submit" 
                disabled={saving || !nextMaintenanceDate} 
                className="px-8 py-3 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:brightness-110 text-white font-black rounded-2xl shadow-md shadow-blue-600/25 transition-all hover:scale-105 disabled:opacity-50 text-xs md:text-sm flex items-center gap-2 border border-blue-400/30"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري حفظ العميل وتحديث المواعيد...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} strokeWidth={2.5} />
                    <span>{customerId ? 'تحديث بيانات العميل' : 'حفظ وتسجيل العميل المعتمد'}</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
}

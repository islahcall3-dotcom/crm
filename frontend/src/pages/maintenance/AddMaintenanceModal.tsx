import React, { useState, useEffect, useRef } from 'react';
import { fetchApi } from '../../api';
import { Wrench, Package, Plus, Trash2, X } from 'lucide-react';

export default function AddMaintenanceModal({ onClose, onSaved, customerIdOverride }: { onClose: () => void, onSaved: () => void, customerIdOverride?: string }) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [inventorySpares, setInventorySpares] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  // Custom autocomplete state
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Spare parts selection state
  const [selectedSpares, setSelectedSpares] = useState<{ id: string, name: string, quantity: number }[]>([]);
  const [chosenSpareId, setChosenSpareId] = useState('');
  const [chosenSpareQty, setChosenSpareQty] = useState(1);

  const [formData, setFormData] = useState({
    customerId: customerIdOverride || '',
    employeeId: '',
    visitDate: new Date().toISOString().split('T')[0],
    item1: false,
    item2: false,
    item3: false,
    itemPost: false,
    itemCalcium: false,
    itemInfrared: false,
    itemSalts: false,
    notes: '',
    deductInventory: true
  });

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchApi('/customers?isArchived=false&limit=1000').then(res => {
      setCustomers(res.data || res);
    }).catch(console.error);

    // Fetch technicians
    fetchApi('/employees').then(res => {
      setTechnicians((res.data || res).filter((e: any) => e.isTechnician));
    }).catch(console.error);

    // Fetch spare parts from inventory
    fetchApi('/inventory').then(res => {
      const items = res.data || [];
      const spares = items.filter((i: any) => i.category === 'spare' || (!i.category && !i.itemName.includes('شمع')));
      setInventorySpares(spares);
    }).catch(console.error);

    function handleClickOutside(event: any) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId) {
      setError('يرجى اختيار العميل أولاً');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await fetchApi('/maintenance', { 
        method: 'POST', 
        body: JSON.stringify({
          ...formData, 
          employeeId: formData.employeeId || null,
          spareParts: selectedSpares.map(s => ({ id: s.id, quantity: s.quantity }))
        }) 
      });
      onSaved();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء حفظ الزيارة');
    } finally {
      setSaving(false);
    }
  };

  const handleCheckbox = (name: string) => {
    setFormData(prev => ({ ...prev, [name]: !(prev as any)[name] }));
  };

  const filteredCustomers = customers.filter(c => {
    const q = searchQuery.toLowerCase();
    return (c.name && c.name.toLowerCase().includes(q)) || 
           (c.phone1 && c.phone1.includes(q)) || 
           (c.phone2 && c.phone2.includes(q)) || 
           (c.landline && c.landline.includes(q)) ||
           (c.customerCode && c.customerCode.toString().includes(q));
  });

  const selectedOverrideCustomer = customerIdOverride ? customers.find(c => c.id === customerIdOverride) : null;

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl my-8 border border-slate-200/90 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-200/80 flex justify-between items-center bg-gradient-to-r from-slate-50 via-white to-slate-50/90 sticky top-0 z-10">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-2xl shadow-md shadow-amber-600/25">
              <Wrench size={22} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">تسجيل زيارة صيانة ميدانية معتمدة</h3>
              <p className="text-xs text-slate-500 font-bold mt-0.5">توثيق الشمعات وقطع الغيار وخصمها تلقائياً وفورياً من رصيد المخزن</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-700 text-sm font-bold rounded-2xl border border-red-200 text-center">
              {error}
            </div>
          )}

          {/* 1. Customer Autocomplete */}
          <div className="relative" ref={wrapperRef}>
            <label className="block text-xs font-black text-gray-700 mb-1.5">
              اختيار العميل المطلوب <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input 
                type="text" 
                placeholder={customerIdOverride ? "جاري تحميل بيانات العميل..." : "ابحث باسم العميل أو أي من أرقام هواتفه أو كود العميل..."} 
                className="w-full p-3.5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all disabled:bg-blue-50/50 disabled:text-gray-800 disabled:font-black disabled:border-blue-200 text-sm font-bold" 
                value={customerIdOverride ? (selectedOverrideCustomer ? `${selectedOverrideCustomer.name} (${selectedOverrideCustomer.phone1})` : '--- عميل محدد مسبقاً ---') : searchQuery}
                onChange={e => {
                  if (customerIdOverride) return;
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                  if (formData.customerId) setFormData({...formData, customerId: ''});
                }}
                onFocus={() => { if (!customerIdOverride) setIsDropdownOpen(true); }}
                disabled={!!customerIdOverride}
              />
            </div>
            
            {isDropdownOpen && !customerIdOverride && filteredCustomers.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto divide-y divide-gray-50">
                {filteredCustomers.map(c => (
                  <div 
                    key={c.id} 
                    className="p-3.5 hover:bg-blue-50 cursor-pointer flex justify-between items-center transition-colors"
                    onClick={() => {
                      setFormData({...formData, customerId: c.id});
                      setSearchQuery(`${c.name} - ${c.phone1}`);
                      setIsDropdownOpen(false);
                    }}
                  >
                    <div>
                      <div className="font-black text-sm text-gray-900">{c.name}</div>
                      <div className="text-xs text-gray-500 font-bold" dir="ltr">{c.phone1} {c.phone2 ? `• ${c.phone2}` : ''}</div>
                    </div>
                    <span className="text-xs font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-100">#{c.customerCode}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-gray-700 mb-1.5">الفني المنفذ للزيارة (اختياري)</label>
              <select value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-800 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                <option value="">اختر المهندس / الفني (اختياري)...</option>
                {technicians.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-700 mb-1.5">تاريخ الزيارة المنفذة <span className="text-red-500">*</span></label>
              <input required type="date" value={formData.visitDate} onChange={e => setFormData({...formData, visitDate: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-800 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
            </div>

            {/* 2. Changed Candles Section - Exact Layout from Image */}
            <div className="md:col-span-2 border border-slate-200 bg-slate-50/50 rounded-3xl p-5 mt-2">
              <h4 className="font-black text-slate-800 mb-3 text-center flex items-center justify-center gap-2 text-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                الشمعات والمراحل التي تم تغييرها (تُخصم من المخزن تلقائياً):
              </h4>
              
              <div className="space-y-2.5">
                {/* Row 1: شمعة أولى، شمعة ثانية، شمعة ثالثة، بوست كربون */}
                <div className="flex flex-wrap items-center justify-center gap-2.5">
                  {[
                    { id: 'item1', label: 'شمعة أولى' },
                    { id: 'item2', label: 'شمعة ثانية' },
                    { id: 'item3', label: 'شمعة ثالثة' },
                    { id: 'itemPost', label: 'بوست كربون' },
                  ].map(item => {
                    const isChecked = Boolean((formData as any)[item.id]);
                    return (
                      <label 
                        key={item.id} 
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border cursor-pointer select-none transition-all ${
                          isChecked 
                            ? 'border-2 border-blue-500 bg-blue-50 text-blue-950 font-black shadow-xs scale-[1.02]' 
                            : 'border-slate-300 bg-white hover:border-slate-400 text-slate-800 font-bold'
                        }`}
                      >
                        <input 
                          type="checkbox" 
                          checked={isChecked} 
                          onChange={() => handleCheckbox(item.id)} 
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                        />
                        <span className="text-xs whitespace-nowrap">{item.label}</span>
                      </label>
                    );
                  })}
                </div>

                {/* Row 2: كالسيوم (كالسيت)، انفراريد، أملاح (ممبرين) */}
                <div className="flex flex-wrap items-center justify-center gap-2.5">
                  {[
                    { id: 'itemCalcium', label: 'كالسيوم (كالسيت)' },
                    { id: 'itemInfrared', label: 'انفراريد' },
                    { id: 'itemSalts', label: 'أملاح (ممبرين)', isSalts: true },
                  ].map(item => {
                    const isChecked = Boolean((formData as any)[item.id]);
                    return (
                      <label 
                        key={item.id} 
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border cursor-pointer select-none transition-all ${
                          isChecked 
                            ? item.isSalts
                              ? 'border-2 border-rose-500 bg-rose-50 text-rose-800 font-black shadow-xs scale-[1.02]'
                              : 'border-2 border-blue-500 bg-blue-50 text-blue-950 font-black shadow-xs scale-[1.02]' 
                            : item.isSalts
                              ? 'border-slate-300 bg-white hover:border-rose-300 text-rose-600 font-bold'
                              : 'border-slate-300 bg-white hover:border-slate-400 text-slate-800 font-bold'
                        }`}
                      >
                        <input 
                          type="checkbox" 
                          checked={isChecked} 
                          onChange={() => handleCheckbox(item.id)} 
                          className={`w-4 h-4 rounded cursor-pointer ${item.isSalts ? 'accent-rose-600 text-rose-600' : 'accent-blue-600 text-blue-600'}`}
                        />
                        <span className={`text-xs whitespace-nowrap ${!isChecked && item.isSalts ? 'text-rose-600 font-bold' : ''}`}>
                          {item.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 3. Spare Parts Used Section */}
            <div className="md:col-span-2 border border-amber-100 bg-amber-50/20 rounded-3xl p-5 mt-2">
              <h4 className="font-black text-gray-900 mb-3 flex items-center gap-2">
                <Wrench size={18} className="text-amber-600" />
                قطع غيار تم استهلاكها أو تركيبها (اختياري - تُخصم من رصيد المخزن تلقائياً):
              </h4>
              
              <div className="flex flex-col sm:flex-row gap-2 mb-3">
                <select
                  value={chosenSpareId}
                  onChange={e => setChosenSpareId(e.target.value)}
                  className="flex-1 p-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-800 outline-none focus:border-amber-500"
                >
                  <option value="">-- اختر قطعة الغيار من المخزن --</option>
                  {inventorySpares.map(sp => (
                    <option key={sp.id} value={sp.id} disabled={sp.quantity <= 0}>
                      {sp.itemName} (المتاح: {sp.quantity} قطعة) {sp.quantity <= 0 ? '- [نفذ من المخزن]' : ''}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-2">
                  <input 
                    type="number"
                    min="1"
                    value={chosenSpareQty}
                    onChange={e => setChosenSpareQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-24 p-3 bg-white border border-gray-200 rounded-xl text-sm font-black text-center text-gray-800 outline-none"
                    placeholder="الكمية"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!chosenSpareId) return;
                      const part = inventorySpares.find(s => s.id === chosenSpareId);
                      if (!part) return;
                      if (selectedSpares.some(s => s.id === part.id)) {
                        setSelectedSpares(selectedSpares.map(s => s.id === part.id ? { ...s, quantity: s.quantity + chosenSpareQty } : s));
                      } else {
                        setSelectedSpares([...selectedSpares, { id: part.id, name: part.itemName, quantity: chosenSpareQty }]);
                      }
                      setChosenSpareId('');
                      setChosenSpareQty(1);
                    }}
                    className="px-5 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-black text-xs transition-all shadow-md shadow-amber-500/20 whitespace-nowrap"
                  >
                    + إضافة قطعة
                  </button>
                </div>
              </div>

              {/* Added Spare Parts List */}
              {selectedSpares.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-amber-200/50">
                  {selectedSpares.map(sp => (
                    <span key={sp.id} className="inline-flex items-center gap-2 bg-white border border-amber-200 text-gray-800 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm">
                      <span className="font-black text-gray-900">{sp.name}</span>
                      <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-lg font-black text-[11px]">الكمية: {sp.quantity}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedSpares(selectedSpares.filter(s => s.id !== sp.id))}
                        className="text-red-500 hover:text-red-700 p-0.5 rounded-md hover:bg-red-50"
                        title="إلغاء القطعة"
                      >
                        <Trash2 size={13} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Deduct Inventory Toggle */}
            <div className="md:col-span-2 flex justify-center mt-2">
              <label className="flex items-center gap-3 cursor-pointer select-none bg-white px-5 py-3 rounded-full border border-blue-200 shadow-sm transition-all hover:bg-blue-50">
                <input 
                  type="checkbox" 
                  checked={formData.deductInventory} 
                  onChange={() => handleCheckbox('deductInventory')} 
                  className="w-5 h-5 text-blue-600 rounded-lg focus:ring-blue-500 accent-blue-600 cursor-pointer" 
                />
                <span className="font-black text-sm text-slate-800">
                  هل تريد خصم هذه المواد من رصيد المخزن؟ (نعم / لا)
                </span>
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-black text-gray-700 mb-1.5">الملاحظات الفنية للزيارة</label>
              <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} rows={2} placeholder="ملاحظات حول حالة الشمعات، نسبة الأملاح TDS، ضغط الموتور..." className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-800 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" />
            </div>
          </div>
          
          <div className="flex justify-start gap-4 pt-4 border-t border-slate-100">
            <button 
              type="submit" 
              disabled={saving} 
              className="px-8 py-3.5 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:brightness-110 text-white font-black rounded-2xl shadow-md shadow-blue-600/25 transition-all hover:scale-102 disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2 text-sm border border-blue-400/30"
            >
              {saving ? 'جاري الحفظ والتحديث...' : 'تأكيد وحفظ الصيانة وخصم المخزون'}
            </button>
            <button type="button" onClick={onClose} className="px-6 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-all">
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

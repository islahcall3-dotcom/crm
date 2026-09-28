import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '../api';
import { Package, Plus, Search, AlertTriangle, ArrowDownRight, ArrowUpRight, Edit3, Trash2, CheckCircle, RefreshCw, X, Layers, DollarSign, Wrench, Droplets, BarChart3, Printer, Download, FileText, Sparkles } from 'lucide-react';
import { matchesSearch } from '../utils/textUtils';
import { formatDate } from '../utils/dateFormatter';

type InventoryItem = {
  id: string;
  itemName: string;
  category?: 'candle' | 'spare';
  quantity: number;
  unitPrice: number;
};

type InventoryStats = {
  totalItems: number;
  totalQuantity: number;
  totalValue: number;
  lowStockCount: number;
  totalCandles?: number;
  totalSpares?: number;
};

const STANDARD_CANDLES = [
  'شمعة أولى',
  'شمعة ثانية',
  'شمعة ثالثة',
  'بوست كربون',
  'كالسيوم (كالسيت)',
  'انفراريد',
  'أملاح (ممبرين)',
  'طقم شمع اقتصادي (1 + 2 + 3)',
  'طقم شمع كامل (7 مراحل)',
];

export default function InventoryList() {
  const queryClient = useQueryClient();
  
  const { data, isLoading: loading, refetch } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => fetchApi('/inventory'),
    refetchInterval: 5000,
  });

  const items: InventoryItem[] = data?.data || [];
  const stats: InventoryStats = data?.stats || { totalItems: 0, totalQuantity: 0, totalValue: 0, lowStockCount: 0 };

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'candle' | 'spare' | 'low'>('all');
  
  // Main Tab: 'inventory' (Operations Table) or 'report' (Category Breakdown & Valuation Report)
  const [activeMainTab, setActiveMainTab] = useState<'inventory' | 'report'>('inventory');

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  
  // Form fields
  const [formCategory, setFormCategory] = useState<'candle' | 'spare'>('candle');
  const [formCandleChoice, setFormCandleChoice] = useState(STANDARD_CANDLES[0]);
  const [isCustomCandle, setIsCustomCandle] = useState(false);
  const [formCustomName, setFormCustomName] = useState('');
  const [formQty, setFormQty] = useState<number>(0);
  const [formPrice, setFormPrice] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');

  // Quick Stock Adjustment Modal state
  const [adjustModalItem, setAdjustModalItem] = useState<InventoryItem | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(1);
  const [adjustType, setAdjustType] = useState<'add' | 'subtract'>('add');
  const [adjusting, setAdjusting] = useState(false);

  const loadItems = () => {
    refetch();
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormCategory('candle');
    setFormCandleChoice(STANDARD_CANDLES[0]);
    setIsCustomCandle(false);
    setFormCustomName('');
    setFormQty(10);
    setFormPrice(45);
    setModalError('');
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (item: InventoryItem) => {
    setEditingItem(item);
    const cat = item.category || (item.itemName.includes('شمع') || item.itemName.includes('ممبرين') || item.itemName.includes('طقم') ? 'candle' : 'spare');
    setFormCategory(cat);
    
    if (cat === 'candle') {
      if (STANDARD_CANDLES.includes(item.itemName)) {
        setFormCandleChoice(item.itemName);
        setIsCustomCandle(false);
      } else {
        setFormCandleChoice('custom');
        setIsCustomCandle(true);
        setFormCustomName(item.itemName);
      }
    } else {
      setFormCustomName(item.itemName);
    }

    setFormQty(item.quantity);
    setFormPrice(item.unitPrice);
    setModalError('');
    setIsAddEditOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalName = '';
    if (formCategory === 'candle') {
      if (isCustomCandle) {
        finalName = formCustomName.trim();
      } else {
        finalName = formCandleChoice;
      }
    } else {
      finalName = formCustomName.trim();
    }

    if (!finalName) {
      setModalError('يرجى تحديد أو إدخال اسم الصنف');
      return;
    }

    setSaving(true);
    setModalError('');
    try {
      if (editingItem) {
        await fetchApi(`/inventory/${editingItem.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            itemName: finalName,
            category: formCategory,
            quantity: Number(formQty) || 0,
            unitPrice: Number(formPrice) || 0
          })
        });
      } else {
        await fetchApi('/inventory', {
          method: 'POST',
          body: JSON.stringify({
            itemName: finalName,
            category: formCategory,
            quantity: Number(formQty) || 0,
            unitPrice: Number(formPrice) || 0
          })
        });
      }
      setIsAddEditOpen(false);
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    } catch (err: any) {
      setModalError(err.message || 'حدث خطأ أثناء حفظ الصنف');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (item: InventoryItem) => {
    if (!confirm(`هل أنت متأكد من حذف الصنف "${item.itemName}" نهائياً من المخزن؟`)) return;
    try {
      await fetchApi(`/inventory/${item.id}`, { method: 'DELETE' });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    } catch (err: any) {
      alert(err.message || 'تعذر حذف الصنف');
    }
  };

  const handleApplyAdjustment = async () => {
    if (!adjustModalItem || adjustAmount <= 0) return;
    setAdjusting(true);
    try {
      const diff = adjustType === 'add' ? adjustAmount : -adjustAmount;
      await fetchApi(`/inventory/${adjustModalItem.id}`, {
        method: 'PUT',
        body: JSON.stringify({ adjustment: diff })
      });
      setAdjustModalItem(null);
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    } catch (err: any) {
      alert(err.message || 'تعذر تعديل الرصيد');
    } finally {
      setAdjusting(false);
    }
  };

  // Group items by category
  const candlesList = items.filter(i => i.category === 'candle' || i.itemName.includes('شمع') || i.itemName.includes('ممبرين') || i.itemName.includes('طقم'));
  const sparesList = items.filter(i => !(i.category === 'candle' || i.itemName.includes('شمع') || i.itemName.includes('ممبرين') || i.itemName.includes('طقم')));

  // Category statistics calculations
  const totalCandlesQty = candlesList.reduce((sum, i) => sum + i.quantity, 0);
  const totalCandlesVal = candlesList.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0);

  const totalSparesQty = sparesList.reduce((sum, i) => sum + i.quantity, 0);
  const totalSparesVal = sparesList.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0);

  const grandTotalQty = totalCandlesQty + totalSparesQty;
  const grandTotalVal = totalCandlesVal + totalSparesVal;

  const filteredItems = items.filter(item => {
    if (searchQuery.trim() && !matchesSearch(item.itemName, searchQuery)) return false;
    
    const cat = item.category || (item.itemName.includes('شمع') || item.itemName.includes('ممبرين') || item.itemName.includes('طقم') ? 'candle' : 'spare');

    if (filterCategory === 'candle') return cat === 'candle';
    if (filterCategory === 'spare') return cat === 'spare';
    if (filterCategory === 'low') return item.quantity <= 5;
    return true;
  });

  // Export CSV function
  const handleExportCSV = () => {
    const headers = ['اسم الصنف', 'التصنيف', 'الرصيد المتاح (قطعة)', 'سعر القطعة (ج.م)', 'إجمالي القيمة (ج.م)'];
    const rows = items.map(i => [
      `"${i.itemName.replace(/"/g, '""')}"`,
      i.category === 'candle' || i.itemName.includes('شمع') ? 'شمع فلاتر' : 'قطع غيار',
      i.quantity,
      i.unitPrice,
      i.quantity * i.unitPrice
    ]);

    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `جرد_مخزن_فلاتر_الجمال_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
              الرقابة المخزنية والقطع
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3">
            <div className="p-2.5 bg-blue-100/90 text-blue-700 rounded-2xl border border-blue-200 shadow-2xs shrink-0">
              <Package size={26} strokeWidth={2.2} />
            </div>
            <span>المخزن وقطع الغيار</span>
          </h1>

          <p className="text-slate-600 text-xs md:text-sm font-semibold mt-2 max-w-2xl leading-relaxed">
            إدارة الشمعات، الفلاتر، المواتير، وقطع الغيار مع الخصم التلقائي فور تنفيذ زيارات الصيانة.
          </p>
        </div>

        {/* Right side: Pills + Coordinated Action Buttons */}
        <div className="relative z-10 flex flex-col items-start md:items-end gap-3 shrink-0 w-full md:w-auto">
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-white/95 px-4 py-1.5 rounded-full text-xs font-black flex items-center gap-2 border border-blue-200 text-slate-700 shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {grandTotalQty} قطعة متوفرة
            </div>
            <div className="text-xs font-bold text-slate-700 bg-white/95 px-4 py-1 rounded-full border border-blue-200 shadow-xs">
              {formatDate(new Date())}
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <button 
              onClick={() => loadItems()}
              className="p-3 bg-white hover:bg-blue-50 text-slate-700 rounded-2xl border-2 border-blue-200 hover:border-blue-400 transition-all shadow-xs"
              title="تحديث البيانات"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button 
              onClick={handleOpenAdd}
              className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:brightness-110 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 shadow-md shadow-blue-600/25 transition-all hover:scale-105 text-xs md:text-sm border border-blue-400/30"
            >
              <Plus size={20} strokeWidth={2.5} />
              <span>إضافة صنف جديد</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main View Tab Switcher */}
      <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-blue-100 gap-2">
        <button
          onClick={() => setActiveMainTab('inventory')}
          className={`flex-1 py-3 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
            activeMainTab === 'inventory'
              ? 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white shadow-md shadow-blue-600/25 scale-[1.01]'
              : 'text-slate-600 hover:bg-blue-50 hover:text-blue-800'
          }`}
        >
          <Package size={18} />
          <span>جدول الأصناف وحركات المخزن السريعة</span>
        </button>
        <button
          onClick={() => setActiveMainTab('report')}
          className={`flex-1 py-3 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
            activeMainTab === 'report'
              ? 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white shadow-md shadow-blue-600/25 scale-[1.01]'
              : 'text-slate-600 hover:bg-blue-50 hover:text-blue-800'
          }`}
        >
          <BarChart3 size={18} />
          <span>📊 تقرير جرد المخزون حسب النوع والأسعار</span>
        </button>
      </div>

      {/* VIEW 1: INVENTORY OPERATIONS TABLE */}
      {activeMainTab === 'inventory' && (
        <div className="space-y-6">
          {/* Top Summary KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total Item Types */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-2">
                <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-xl"><Layers size={20} /></div>
                <h3 className="text-gray-500 text-xs font-bold text-left">أنواع الأصناف</h3>
              </div>
              <div className="mt-2">
                <span className="text-3xl font-black text-gray-900">{stats.totalItems}</span>
                <span className="text-xs text-gray-400 font-bold mr-1">صنف مسجل</span>
              </div>
            </div>

            {/* Total Quantity */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-2">
                <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl"><Package size={20} /></div>
                <h3 className="text-gray-500 text-xs font-bold text-left">إجمالي رصيد القطع</h3>
              </div>
              <div className="mt-2">
                <span className="text-3xl font-black text-emerald-600">{stats.totalQuantity}</span>
                <span className="text-xs text-gray-400 font-bold mr-1">قطعة بالمخزن</span>
              </div>
            </div>

            {/* Total Inventory Value */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-2">
                <div className="bg-purple-50 text-purple-600 p-2.5 rounded-xl"><DollarSign size={20} /></div>
                <h3 className="text-gray-500 text-xs font-bold text-left">قيمة المخزون الإجمالية</h3>
              </div>
              <div className="mt-2">
                <span className="text-3xl font-black text-purple-700">{stats.totalValue.toLocaleString('ar-EG')}</span>
                <span className="text-xs text-gray-400 font-bold mr-1">ج.م</span>
              </div>
            </div>

            {/* Low Stock Alerts */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-2">
                <div className="bg-red-50 text-red-600 p-2.5 rounded-xl"><AlertTriangle size={20} /></div>
                <h3 className="text-gray-500 text-xs font-bold text-left">نواقص أوشكت على النفاد</h3>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-3xl font-black text-red-600">{stats.lowStockCount}</span>
                {stats.lowStockCount > 0 && (
                  <span className="px-2.5 py-1 bg-red-50 text-red-600 border border-red-200 rounded-full text-[11px] font-black animate-pulse">
                    تحتاج توريد عاجل
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Search and Category Filter Pills */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="بحث باسم الشمعة أو قطعة الغيار..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-11 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-800 placeholder-gray-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    title="تفريغ البحث"
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setFilterCategory('all')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${filterCategory === 'all' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  كل الأصناف ({items.length})
                </button>
                <button
                  onClick={() => setFilterCategory('candle')}
                  className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${filterCategory === 'candle' ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'}`}
                >
                  <Droplets size={14} />
                  شمع الفلاتر فقط
                </button>
                <button
                  onClick={() => setFilterCategory('spare')}
                  className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${filterCategory === 'spare' ? 'bg-amber-600 text-white shadow-md shadow-amber-500/25' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'}`}
                >
                  <Wrench size={14} />
                  قطع الغيار فقط
                </button>
                <button
                  onClick={() => setFilterCategory('low')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${filterCategory === 'low' ? 'bg-red-600 text-white shadow-md shadow-red-500/25' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                >
                  النواقص ({stats.lowStockCount})
                </button>
              </div>
            </div>

            {searchQuery.trim() && (
              <div className="flex items-center justify-between bg-blue-50/70 border border-blue-200/70 rounded-xl px-4 py-2 text-xs font-bold text-blue-900">
                <span>
                  نتائج البحث عن "{searchQuery}": تم العثور على ({filteredItems.length}) من إجمالي ({items.length}) صنف
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
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto min-h-[320px]">
              <table className="w-full text-sm text-right">
                <thead className="bg-[#f8fafc] border-b border-gray-100 text-[#64748b]">
                  <tr>
                    <th className="px-6 py-4 font-black">اسم الصنف</th>
                    <th className="px-6 py-4 font-black text-center">النوع / التصنيف</th>
                    <th className="px-6 py-4 font-black text-center">الرصيد المتاح</th>
                    <th className="px-6 py-4 font-black text-center">حالة المخزون</th>
                    <th className="px-6 py-4 font-black text-center">سعر القطعة</th>
                    <th className="px-6 py-4 font-black text-center">إجمالي القيمة</th>
                    <th className="px-6 py-4 font-black text-center">تعديل سريع للرصيد</th>
                    <th className="px-6 py-4 font-black text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="text-center py-20">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-indigo-600"></div>
                        <p className="mt-4 text-gray-500 font-bold">جاري تحميل أصناف المخزن...</p>
                      </td>
                    </tr>
                  ) : filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-20">
                        <div className="text-4xl mb-3">📦</div>
                        <h3 className="text-base font-black text-gray-800">لا توجد أصناف تطابق البحث أو الفلتر</h3>
                        <p className="text-gray-400 font-bold text-xs mt-1">يمكنك إضافة أصناف جديدة عبر زر "إضافة صنف جديد".</p>
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map(item => {
                      const isLow = item.quantity <= 5;
                      const isMedium = item.quantity > 5 && item.quantity <= 20;
                      const totalItemVal = item.quantity * item.unitPrice;
                      const isCandle = item.category === 'candle' || item.itemName.includes('شمع') || item.itemName.includes('ممبرين') || item.itemName.includes('طقم');

                      return (
                        <tr key={item.id} className="border-b border-gray-50 hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4 font-black text-gray-900 flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${isCandle ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'}`}>
                              {isCandle ? <Droplets size={18} /> : <Wrench size={18} />}
                            </div>
                            <span>{item.itemName}</span>
                          </td>

                          <td className="px-6 py-4 text-center">
                            {isCandle ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-xs font-black">
                                شمع فلاتر
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-black">
                                قطع غيار
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-4 text-center">
                            <span className="text-lg font-black text-gray-900">{item.quantity}</span>
                            <span className="text-xs text-gray-400 font-bold mr-1">قطعة</span>
                          </td>

                          <td className="px-6 py-4 text-center">
                            {isLow ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-black shadow-sm">
                                <AlertTriangle size={12} />
                                أوشك على النفاد
                              </span>
                            ) : isMedium ? (
                              <span className="inline-flex items-center px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-black">
                                رصيد متوسط
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-black">
                                <CheckCircle size={12} />
                                متوفر بكثرة
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-4 text-center font-black text-gray-700">
                            {item.unitPrice} <span className="text-xs text-gray-400 font-normal">ج.م</span>
                          </td>

                          <td className="px-6 py-4 text-center font-black text-indigo-700">
                            {totalItemVal.toLocaleString('ar-EG')} <span className="text-xs text-gray-400 font-normal">ج.م</span>
                          </td>

                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => {
                                  setAdjustModalItem(item);
                                  setAdjustType('add');
                                  setAdjustAmount(10);
                                }}
                                className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-black text-xs flex items-center gap-0.5 border border-emerald-200 transition-all hover:scale-105"
                                title="توريد / إضافة رصيد"
                              >
                                <ArrowDownRight size={14} />
                                <span>+ توريد</span>
                              </button>
                              <button
                                onClick={() => {
                                  setAdjustModalItem(item);
                                  setAdjustType('subtract');
                                  setAdjustAmount(1);
                                }}
                                className="p-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg font-black text-xs flex items-center gap-0.5 border border-orange-200 transition-all hover:scale-105"
                                title="صرف / خصم رصيد"
                              >
                                <ArrowUpRight size={14} />
                                <span>- صرف</span>
                              </button>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleOpenEdit(item)}
                                className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition-all"
                                title="تعديل الصنف"
                              >
                                <Edit3 size={15} />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item)}
                                className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all"
                                title="حذف الصنف"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: DETAILED INVENTORY VALUATION & CATEGORY BREAKDOWN REPORT */}
      {activeMainTab === 'report' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Report Actions Header */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-black text-indigo-600 mb-1">
                <FileText size={16} />
                <span>كشف الجرد التفصيلي والتقييم المالي الشامل</span>
              </div>
              <h3 className="text-xl font-black text-gray-900">
                تقرير مخزون مؤسسة فلاتر الجمال الموزع حسب النوع
              </h3>
              <p className="text-xs text-gray-500 font-bold mt-1">
                تم استخراج البيانات آلياً بتاريخ: {formatDate(new Date())}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportCSV}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black text-xs rounded-xl flex items-center gap-2 transition-all"
              >
                <Download size={16} />
                <span>تصدير Excel / CSV</span>
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-500 hover:brightness-110 text-white font-black text-xs rounded-xl flex items-center gap-2 shadow-md shadow-sky-500/20 transition-all hover:scale-105"
              >
                <Printer size={16} />
                <span>طباعة تقرير الجرد 🖨️</span>
              </button>
            </div>
          </div>

          {/* 3 Report Category KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Candles Summary Card */}
            <div className="bg-gradient-to-br from-sky-50/60 to-white p-6 rounded-3xl shadow-sm border border-sky-200 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-sky-800 bg-sky-100/70 px-3 py-1 rounded-xl">شمع الفلاتر والمراحل</span>
                <Droplets className="text-sky-600" size={24} />
              </div>
              <div className="my-4">
                <div className="text-3xl font-black text-gray-900">{totalCandlesQty} <span className="text-sm font-bold text-gray-500">شمعة</span></div>
                <div className="text-xs text-gray-500 font-bold mt-1">موزعة على {candlesList.length} أنواع أساسية</div>
              </div>
              <div className="pt-3 border-t border-sky-100 flex justify-between items-center text-xs font-black">
                <span className="text-gray-500">القيمة الإجمالية:</span>
                <span className="text-sky-700 text-sm font-black">{totalCandlesVal.toLocaleString('ar-EG')} ج.م</span>
              </div>
            </div>

            {/* Spare Parts Summary Card */}
            <div className="bg-gradient-to-br from-amber-50 to-white p-6 rounded-3xl shadow-sm border border-amber-100 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-800 bg-amber-100/60 px-3 py-1 rounded-xl">قطع الغيار والمكونات</span>
                <Wrench className="text-amber-600" size={24} />
              </div>
              <div className="my-4">
                <div className="text-3xl font-black text-gray-900">{totalSparesQty} <span className="text-sm font-bold text-gray-500">قطعة</span></div>
                <div className="text-xs text-gray-500 font-bold mt-1">موزعة على {sparesList.length} أصناف مسجلة</div>
              </div>
              <div className="pt-3 border-t border-amber-100/80 flex justify-between items-center text-xs font-black">
                <span className="text-gray-500">القيمة الإجمالية:</span>
                <span className="text-amber-800 text-sm font-black">{totalSparesVal.toLocaleString('ar-EG')} ج.م</span>
              </div>
            </div>

            {/* Grand Total Valuation Card - Light Royal & Soothing */}
            <div className="bg-gradient-to-br from-cyan-50/60 via-white to-sky-50/50 p-6 rounded-3xl shadow-sm border border-sky-200 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-sky-800 bg-sky-100/70 px-3 py-1 rounded-xl">إجمالي المخزون الكلي</span>
                <div className="p-2 bg-sky-100/70 text-sky-600 rounded-2xl">
                  <Package size={22} strokeWidth={2.5} />
                </div>
              </div>
              <div className="my-4">
                <div className="text-3xl font-black text-slate-900">{grandTotalVal.toLocaleString('ar-EG')} <span className="text-sm font-bold text-gray-500">ج.م</span></div>
                <div className="text-xs text-gray-500 font-bold mt-1">إجمالي البضاعة المتاحة ({grandTotalQty} قطعة)</div>
              </div>
              <div className="pt-3 border-t border-sky-100 flex justify-between items-center text-xs font-bold">
                <span className="text-gray-500">إجمالي الأصناف:</span>
                <span className="font-black text-gray-900 text-sm">{items.length} صنف مسجل</span>
              </div>
            </div>
          </div>

          {/* TABLE 1: WATER FILTER CANDLES */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-blue-50/40">
              <h4 className="font-black text-gray-900 flex items-center gap-2">
                <Droplets size={20} className="text-blue-600" />
                <span>أولاً: تقرير شمع الفلاتر والمراحل ({candlesList.length} أنواع)</span>
              </h4>
              <span className="text-xs font-black text-blue-800 bg-blue-100 px-3 py-1 rounded-xl border border-blue-200">
                إجمالي رصيد الشمع: {totalCandlesQty} قطعة • القيمة: {totalCandlesVal.toLocaleString('ar-EG')} ج.م
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-[#f8fafc] border-b border-gray-100 text-[#64748b]">
                  <tr>
                    <th className="px-6 py-3.5 font-black">#</th>
                    <th className="px-6 py-3.5 font-black">اسم الشمعة والمرحلة</th>
                    <th className="px-6 py-3.5 font-black text-center">الرصيد المتاح</th>
                    <th className="px-6 py-3.5 font-black text-center">سعر القطعة</th>
                    <th className="px-6 py-3.5 font-black text-center">إجمالي القيمة</th>
                    <th className="px-6 py-3.5 font-black text-center">حالة التوفر</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {candlesList.map((item, idx) => {
                    const totalVal = item.quantity * item.unitPrice;
                    const isLow = item.quantity <= 5;
                    return (
                      <tr key={item.id} className="hover:bg-indigo-50/30 transition-colors">
                        <td className="px-6 py-3.5 text-xs font-black text-gray-400">{idx + 1}</td>
                        <td className="px-6 py-3.5 font-black text-gray-900 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                          <span>{item.itemName}</span>
                        </td>
                        <td className="px-6 py-3.5 text-center font-black text-gray-900">
                          {item.quantity} <span className="text-xs text-gray-400 font-normal">قطعة</span>
                        </td>
                        <td className="px-6 py-3.5 text-center font-black text-gray-700">
                          {item.unitPrice} <span className="text-xs text-gray-400 font-normal">ج.م</span>
                        </td>
                        <td className="px-6 py-3.5 text-center font-black text-indigo-700">
                          {totalVal.toLocaleString('ar-EG')} <span className="text-xs text-gray-400 font-normal">ج.م</span>
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          {isLow ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-red-50 text-red-700 rounded-full text-xs font-black">
                              أوشك على النفاد
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-black">
                              رصيد آمن
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50/70 border-t-2 border-gray-200">
                  <tr>
                    <td colSpan={2} className="px-6 py-4 font-black text-gray-900 text-base">إجمالي قسم الشمع:</td>
                    <td className="px-6 py-4 text-center font-black text-gray-900 text-base">{totalCandlesQty} قطعة</td>
                    <td className="px-6 py-4 text-center font-black text-gray-500 text-xs">-</td>
                    <td className="px-6 py-4 text-center font-black text-indigo-700 text-base">{totalCandlesVal.toLocaleString('ar-EG')} ج.م</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* TABLE 2: SPARE PARTS & HARDWARE */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-amber-50/30">
              <h4 className="font-black text-gray-900 flex items-center gap-2">
                <Wrench size={20} className="text-amber-600" />
                <span>ثانياً: تقرير قطع الغيار والمكونات ({sparesList.length} أصناف)</span>
              </h4>
              <span className="text-xs font-black text-amber-800 bg-amber-100 px-3 py-1 rounded-xl">
                إجمالي رصيد القطع: {totalSparesQty} قطعة • القيمة: {totalSparesVal.toLocaleString('ar-EG')} ج.م
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-[#f8fafc] border-b border-gray-100 text-[#64748b]">
                  <tr>
                    <th className="px-6 py-3.5 font-black">#</th>
                    <th className="px-6 py-3.5 font-black">اسم قطعة الغيار والمكون</th>
                    <th className="px-6 py-3.5 font-black text-center">الرصيد المتاح</th>
                    <th className="px-6 py-3.5 font-black text-center">سعر القطعة</th>
                    <th className="px-6 py-3.5 font-black text-center">إجمالي القيمة</th>
                    <th className="px-6 py-3.5 font-black text-center">حالة التوفر</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sparesList.map((item, idx) => {
                    const totalVal = item.quantity * item.unitPrice;
                    const isLow = item.quantity <= 5;
                    return (
                      <tr key={item.id} className="hover:bg-amber-50/30 transition-colors">
                        <td className="px-6 py-3.5 text-xs font-black text-gray-400">{idx + 1}</td>
                        <td className="px-6 py-3.5 font-black text-gray-900 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                          <span>{item.itemName}</span>
                        </td>
                        <td className="px-6 py-3.5 text-center font-black text-gray-900">
                          {item.quantity} <span className="text-xs text-gray-400 font-normal">قطعة</span>
                        </td>
                        <td className="px-6 py-3.5 text-center font-black text-gray-700">
                          {item.unitPrice} <span className="text-xs text-gray-400 font-normal">ج.م</span>
                        </td>
                        <td className="px-6 py-3.5 text-center font-black text-amber-800">
                          {totalVal.toLocaleString('ar-EG')} <span className="text-xs text-gray-400 font-normal">ج.م</span>
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          {isLow ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-red-50 text-red-700 rounded-full text-xs font-black">
                              أوشك على النفاد
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-black">
                              متوفر
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50/70 border-t-2 border-gray-200">
                  <tr>
                    <td colSpan={2} className="px-6 py-4 font-black text-gray-900 text-base">إجمالي قطع الغيار:</td>
                    <td className="px-6 py-4 text-center font-black text-gray-900 text-base">{totalSparesQty} قطعة</td>
                    <td className="px-6 py-4 text-center font-black text-gray-500 text-xs">-</td>
                    <td className="px-6 py-4 text-center font-black text-amber-800 text-base">{totalSparesVal.toLocaleString('ar-EG')} ج.م</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* TABLE 3: EXECUTIVE SUMMARY TABLE - Light Royal Theme */}
          <div className="bg-gradient-to-r from-sky-50/80 via-white to-cyan-50/80 border-2 border-sky-300 p-6 md:p-8 rounded-3xl shadow-sm flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4 text-right">
              <div className="p-3.5 bg-white text-sky-700 rounded-2xl shadow-sm border border-sky-200">
                <FileText size={28} strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="text-xl font-black text-slate-900 mb-1">الملخص الإداري لجرد المخزون المالي</h4>
                <div className="text-slate-500 text-xs font-bold flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>مؤسسة فلاتر الجمال • هذا التقرير محدث لحظياً ومربوط بحركات الصيانة الميدانية</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 w-full lg:w-auto">
              <div className="bg-white px-5 py-3.5 rounded-2xl border border-sky-200 shadow-sm text-center min-w-[120px] flex-1 sm:flex-initial">
                <div className="text-xs text-slate-500 font-bold mb-0.5">إجمالي قطع البضاعة</div>
                <div className="text-2xl font-black text-slate-900">{grandTotalQty} <span className="text-xs font-bold text-slate-400">قطعة</span></div>
              </div>
              <div className="bg-white px-5 py-3.5 rounded-2xl border border-sky-200 shadow-sm text-center min-w-[120px] flex-1 sm:flex-initial">
                <div className="text-xs text-slate-500 font-bold mb-0.5">إجمالي الأصناف</div>
                <div className="text-2xl font-black text-slate-900">{items.length} <span className="text-xs font-bold text-slate-400">صنف</span></div>
              </div>
              <div className="bg-gradient-to-br from-sky-500 via-cyan-500 to-teal-500 text-white px-6 py-3.5 rounded-2xl shadow-md shadow-sky-500/20 text-center min-w-[170px] flex-1 sm:flex-initial">
                <div className="text-xs text-sky-100 font-bold mb-0.5">القيمة المالية الإجمالية</div>
                <div className="text-2xl md:text-3xl font-black text-white">{grandTotalVal.toLocaleString('ar-EG')} <span className="text-xs font-bold text-sky-100">ج.م</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Add / Edit Item Modal with Candle vs Spare Parts */}
      {isAddEditOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <Package className="text-sky-600" size={22} />
                {editingItem ? 'تعديل بيانات الصنف' : 'إضافة صنف جديد للمخزن'}
              </h3>
              <button onClick={() => setIsAddEditOpen(false)} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-6 space-y-5">
              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl">
                  {modalError}
                </div>
              )}

              {/* 1. Category Switcher (شمع vs قطع غيار) */}
              <div>
                <label className="block text-xs font-black text-gray-700 mb-2">نوع وتصنيف الصنف *</label>
                <div className="grid grid-cols-2 gap-3 p-1.5 bg-gray-100 rounded-2xl border border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setFormCategory('candle');
                      setFormPrice(45);
                    }}
                    className={`py-3 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
                      formCategory === 'candle'
                        ? 'bg-gradient-to-r from-sky-500 to-cyan-600 text-white shadow-md shadow-sky-500/20 scale-[1.02]'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Droplets size={18} />
                    <span>شمع فلاتر</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormCategory('spare');
                      setFormPrice(150);
                    }}
                    className={`py-3 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
                      formCategory === 'spare'
                        ? 'bg-amber-600 text-white shadow-md shadow-amber-500/25 scale-[1.02]'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Wrench size={18} />
                    <span>قطع غيار</span>
                  </button>
                </div>
              </div>

              {/* 2. Item Name Selection (Dropdown for Candle, Manual for Spare) */}
              {formCategory === 'candle' ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-black text-gray-700 mb-1.5">اختر نوع الشمعة من القائمة *</label>
                    <select
                      value={isCustomCandle ? 'custom' : formCandleChoice}
                      onChange={(e) => {
                        if (e.target.value === 'custom') {
                          setIsCustomCandle(true);
                        } else {
                          setIsCustomCandle(false);
                          setFormCandleChoice(e.target.value);
                          // Auto set existing price if already in inventory
                          const found = items.find(i => i.itemName === e.target.value);
                          if (found) {
                            setFormPrice(found.unitPrice);
                          }
                        }
                      }}
                      className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none cursor-pointer"
                    >
                      {STANDARD_CANDLES.map((candle) => {
                        const existing = items.find(i => i.itemName === candle);
                        return (
                          <option key={candle} value={candle}>
                            {candle} {existing ? `• [المتاح بالمخزن: ${existing.quantity} قطعة]` : ''}
                          </option>
                        );
                      })}
                      <option value="custom">-- إدخال نوع شمعة مخصصة يدوياً --</option>
                    </select>
                  </div>

                  {isCustomCandle && (
                    <div>
                      <label className="block text-xs font-black text-gray-700 mb-1.5">اكتب اسم الشمعة المخصصة *</label>
                      <input 
                        type="text"
                        required
                        placeholder="مثال: شمعة أملاح 100 جالون تايواني"
                        value={formCustomName}
                        onChange={(e) => setFormCustomName(e.target.value)}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-black text-gray-700 mb-1.5">اسم قطعة الغيار (إدخال يدوي) *</label>
                  <input 
                    type="text"
                    required
                    placeholder="مثال: موتور تايواني، خزان 12 لتر، محبس تغذية، هاوسنج..."
                    value={formCustomName}
                    onChange={(e) => setFormCustomName(e.target.value)}
                    className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none"
                  />
                </div>
              )}

              {/* Informative notice if candidate item already exists in inventory */}
              {(() => {
                const targetName = formCategory === 'candle' ? (isCustomCandle ? formCustomName.trim() : formCandleChoice) : formCustomName.trim();
                const matchedExisting = items.find(i => i.itemName.trim() === targetName);
                if (matchedExisting && !editingItem) {
                  return (
                    <div className="p-3 bg-sky-50/80 border border-sky-200 rounded-2xl flex items-start gap-2.5 text-xs text-sky-950 font-bold animate-in fade-in">
                      <span className="text-base">ℹ️</span>
                      <div>
                        <div>هذا الصنف مسجل مسبقاً بالمخزن برصيد: <span className="font-black text-sky-700">{matchedExisting.quantity} قطعة</span>.</div>
                        <div className="text-sky-700 mt-0.5 font-semibold">سيتم إضافة الكمية الجديدة (<span className="font-black text-emerald-700">+{formQty} قطعة</span>) إلى الرصيد تلقائياً ليصبح الإجمالي <span className="font-black text-emerald-800">{matchedExisting.quantity + formQty} قطعة</span>.</div>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* 3. Quantity & Price Inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-700 mb-1.5">الرصيد المتاح (قطعة)</label>
                  <input 
                    type="number"
                    min="0"
                    required
                    value={formQty}
                    onChange={(e) => setFormQty(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-black text-gray-900 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-700 mb-1.5">سعر القطعة (ج.م)</label>
                  <input 
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-black text-gray-900 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddEditOpen(false)}
                  className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition-all"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-500 hover:brightness-105 text-white rounded-xl font-black text-sm shadow-md shadow-sky-500/20 transition-all disabled:opacity-50"
                >
                  {saving ? 'جاري الحفظ...' : (editingItem ? 'تحديث بيانات الصنف' : (() => {
                    const targetName = formCategory === 'candle' ? (isCustomCandle ? formCustomName.trim() : formCandleChoice) : formCustomName.trim();
                    const matched = items.find(i => i.itemName.trim() === targetName);
                    return matched ? `تأكيد زيادة الرصيد (+${formQty} قطعة)` : 'إضافة للمخزن';
                  })())}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Quick Stock Adjustment Modal */}
      {adjustModalItem && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-base font-black text-gray-900">
                {adjustType === 'add' ? '📦 توريد كمية جديدة' : '📤 صرف كمية من المخزن'}
              </h3>
              <button onClick={() => setAdjustModalItem(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-sky-50/70 border border-sky-200 rounded-2xl">
                <div className="text-xs text-sky-800 font-bold">الصنف المحدد:</div>
                <div className="text-sm font-black text-gray-900 mt-0.5">{adjustModalItem.itemName}</div>
                <div className="text-xs text-gray-500 font-bold mt-1">الرصيد الحالي بالمخزن: <span className="text-sky-700 font-black">{adjustModalItem.quantity} قطعة</span></div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-700 mb-1.5">
                  الكمية المراد {adjustType === 'add' ? 'إضافتها (توريد)' : 'خصمها (صرف)'}:
                </label>
                <input 
                  type="number"
                  min="1"
                  max={adjustType === 'subtract' ? adjustModalItem.quantity : undefined}
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-lg font-black text-center text-gray-900 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none"
                />
              </div>

              <div className="p-3 bg-gray-50 rounded-xl text-center text-xs font-bold text-gray-600">
                الرصيد بعد التعديل سيكون: <span className="font-black text-base text-gray-900">{adjustType === 'add' ? adjustModalItem.quantity + adjustAmount : Math.max(0, adjustModalItem.quantity - adjustAmount)} قطعة</span>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustModalItem(null)}
                  className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  disabled={adjusting}
                  onClick={handleApplyAdjustment}
                  className={`flex-1 py-2.5 px-4 text-white rounded-xl font-black text-xs shadow-md transition-all ${adjustType === 'add' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20' : 'bg-orange-600 hover:bg-orange-700 shadow-orange-500/20'}`}
                >
                  {adjusting ? 'جاري التنفيذ...' : (adjustType === 'add' ? 'تأكيد التوريد' : 'تأكيد الصرف')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

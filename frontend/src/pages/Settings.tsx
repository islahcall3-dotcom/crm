import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, Shield, Building2, Clock, Database, FileText, 
  Plus, Check, X, AlertCircle, RefreshCw, Download, Upload,
  Key, UserCheck, Save, Lock, Edit3, Trash2, CheckCircle2,
  Phone, MapPin, Printer, ShieldCheck, HelpCircle, Activity,
  Server, Sparkles
} from 'lucide-react';
import { fetchApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/dateFormatter';

type ActiveSettingsTab = 'users' | 'company' | 'alerts' | 'backup' | 'audit';

export default function Settings() {
  const { user: currentAuthUser } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveSettingsTab>('users');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // 1. Users & Roles State
  const [usersList, setUsersList] = useState<any[]>([]);
  const [availableEmployees, setAvailableEmployees] = useState<any[]>([]);
  const [rolesMatrix, setRolesMatrix] = useState<any[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userFormData, setUserFormData] = useState({
    username: '',
    password: '',
    role: 'TECHNICIAN',
    isActive: true,
    employeeId: ''
  });

  // 2. Company Profile State
  const [companyProfile, setCompanyProfile] = useState({
    companyName: 'مؤسسة فلاتر الجمال لأنظمة معالجة وتحلية المياه',
    slogan: 'صيانة فورية وتوريد شمعات ومحطات تحلية معتمدة بأعلى معايير النقاء',
    phone1: '01012345678',
    phone2: '',
    hotline: '19000',
    whatsapp: '01012345678',
    email: 'info@elgammal-filters.com',
    address: 'الجمهورية المصرية - مركز سمنود / المنصورة',
    commercialRegister: '104523/غربية',
    taxNumber: '482-901-332',
    warrantyNotice: 'الضمان سارٍ بشرط الالتزام بتغيير الشمعات والمراحل في مواعيدها الدورية المحددة من قِبل فني المؤسسة المعتمد.'
  });

  // 3. Alerts State
  const [alertPreferences, setAlertPreferences] = useState({
    alertDaysBefore: 7,
    overdueThresholdDays: 1,
    defaultWarrantyMonths: 12,
    standardTdsLimit: 150,
    enableSmsReminders: true
  });

  // 4. System Health & Stats State
  const [systemStats, setSystemStats] = useState<any>(null);

  // 5. Audit Logs State
  const [auditLogsList, setAuditLogsList] = useState<any[]>([]);

  // 6. Backup Restore State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [restoring, setRestoring] = useState(false);
  const [restoreConfirmModal, setRestoreConfirmModal] = useState<any>(null);

  // Load All Initial Settings Data
  const loadInitialData = async () => {
    setLoading(true);
    try {
      // 1. Users
      const usersRes = await fetchApi('/users');
      setUsersList(usersRes.data || []);
      setAvailableEmployees(usersRes.availableEmployees || []);

      // 2. Roles Matrix
      const matrixRes = await fetchApi('/users/roles-matrix');
      setRolesMatrix(matrixRes.roles || []);

      // 3. Company & Alerts
      const settingsRes = await fetchApi('/settings');
      if (settingsRes.companyProfile) setCompanyProfile(settingsRes.companyProfile);
      if (settingsRes.alertPreferences) setAlertPreferences(settingsRes.alertPreferences);

      // 4. System Stats
      const statsRes = await fetchApi('/settings/system-stats');
      setSystemStats(statsRes);

      // 5. Audit Logs
      const auditRes = await fetchApi('/settings/audit-logs');
      setAuditLogsList(auditRes.data || []);
    } catch (e) {
      console.error(e);
      setFeedback({ type: 'error', message: 'فشل تحميل بيانات الإعدادات والصلاحيات' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Temporary auto-dismiss for feedback messages
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Open modal to add user
  const handleOpenAddUser = () => {
    setEditingUserId(null);
    setUserFormData({
      username: '',
      password: '',
      role: 'TECHNICIAN',
      isActive: true,
      employeeId: ''
    });
    setShowUserModal(true);
  };

  // Open modal to edit user
  const handleOpenEditUser = (u: any) => {
    setEditingUserId(u.id);
    setUserFormData({
      username: u.username,
      password: '',
      role: u.role,
      isActive: u.isActive,
      employeeId: u.employeeId || ''
    });
    setShowUserModal(true);
  };

  // Save User (Create or Update)
  const handleSaveUser = async (e?: React.FormEvent, addAnother = false) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      if (editingUserId) {
        // Update
        const payload: any = {
          role: userFormData.role,
          isActive: userFormData.isActive,
          employeeId: userFormData.employeeId || null
        };
        if (userFormData.password.trim()) {
          payload.password = userFormData.password.trim();
        }
        await fetchApi(`/users/${editingUserId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        setFeedback({ type: 'success', message: 'تم تحديث بيانات المستخدم بنجاح' });
      } else {
        // Create
        await fetchApi('/users', {
          method: 'POST',
          body: JSON.stringify({
            username: userFormData.username.trim(),
            password: userFormData.password.trim(),
            role: userFormData.role,
            employeeId: userFormData.employeeId || null
          })
        });
        setFeedback({ type: 'success', message: 'تم إنشاء الحساب بنجاح' });
      }

      if (addAnother && !editingUserId) {
        setUserFormData({ username: '', password: '', role: 'TECHNICIAN', isActive: true, employeeId: '' });
        // Optional: you can refocus the username input here if there was a ref
      } else {
        setShowUserModal(false);
      }

      // Refresh users
      const usersRes = await fetchApi('/users');
      setUsersList(usersRes.data || []);
      setAvailableEmployees(usersRes.availableEmployees || []);
    } catch (e: any) {
      setFeedback({ type: 'error', message: e.message || 'فشل حفظ بيانات المستخدم' });
    } finally {
      setSaving(false);
    }
  };

  // Delete / Deactivate User
  const handleDeleteUser = async (id: string, username: string) => {
    if (!confirm(`هل أنت متأكد من حذف الحساب "${username}" نهائياً من المنظومة؟`)) return;
    try {
      await fetchApi(`/users/${id}`, { method: 'DELETE' });
      setFeedback({ type: 'success', message: `تم حذف حساب ${username} بنجاح` });
      setUsersList(prev => prev.filter(u => u.id !== id));
    } catch (e: any) {
      setFeedback({ type: 'error', message: e.message || 'فشل حذف المستخدم' });
    }
  };

  // Save Company Profile Settings
  const handleSaveCompanyProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetchApi('/settings', {
        method: 'PUT',
        body: JSON.stringify({ companyProfile })
      });
      setFeedback({ type: 'success', message: 'تم حفظ هوية المؤسسة وبيانات المطبوعات بنجاح' });
    } catch (e: any) {
      setFeedback({ type: 'error', message: e.message || 'فشل حفظ بيانات المؤسسة' });
    } finally {
      setSaving(false);
    }
  };

  // Save Alert Preferences Settings
  const handleSaveAlerts = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetchApi('/settings', {
        method: 'PUT',
        body: JSON.stringify({ alertPreferences })
      });
      setFeedback({ type: 'success', message: 'تم حفظ وتطبيق معايير دوريات الصيانة والتنبيهات بنجاح' });
    } catch (e: any) {
      setFeedback({ type: 'error', message: e.message || 'فشل حفظ الإعدادات' });
    } finally {
      setSaving(false);
    }
  };

  // Trigger Backup Download
  const handleDownloadBackup = async () => {
    try {
      setFeedback({ type: 'success', message: 'جاري إنشاء وتجميع ملف النسخة الاحتياطية الشامل...' });
      const res = await fetchApi('/settings/backup');
      const blob = new Blob([JSON.stringify(res, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `elgammal_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setFeedback({ type: 'success', message: 'تم تنزيل النسخة الاحتياطية بنجاح على جهازك!' });
    } catch (e: any) {
      setFeedback({ type: 'error', message: 'فشل تحميل النسخة الاحتياطية' });
    }
  };

  // Select Backup JSON to Restore
  const handleSelectRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!json.data) {
          throw new Error('الملف لا يحتوي على كائن البيانات data');
        }
        setRestoreConfirmModal(json);
      } catch (err: any) {
        setFeedback({ type: 'error', message: 'الملف المختار غير صالح كنسخة احتياطية لمنظومة فلاتر الجمال' });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Execute Database Restore
  const handleExecuteRestore = async () => {
    if (!restoreConfirmModal) return;
    setRestoring(true);
    try {
      const res = await fetchApi('/settings/restore', {
        method: 'POST',
        body: JSON.stringify(restoreConfirmModal)
      });
      setFeedback({ 
        type: 'success', 
        message: res.message || 'تمت استعادة وتدقيق بيانات المنظومة بنجاح!' 
      });
      setRestoreConfirmModal(null);
      loadInitialData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'فشلت عملية استعادة النسخة الاحتياطية' });
    } finally {
      setRestoring(false);
    }
  };

  // Role Badge Helper
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <span className="px-2.5 py-1 rounded-xl font-black text-xs bg-slate-900 text-white shadow-xs">مدير النظام</span>;
      case 'MANAGER':
        return <span className="px-2.5 py-1 rounded-xl font-black text-xs bg-indigo-50 text-indigo-700 border border-indigo-200">مشرف فرع / عمليات</span>;
      case 'TECHNICIAN':
        return <span className="px-2.5 py-1 rounded-xl font-black text-xs bg-amber-50 text-amber-800 border border-amber-200">فني صيانة ميداني</span>;
      case 'DATA_ENTRY':
        return <span className="px-2.5 py-1 rounded-xl font-black text-xs bg-cyan-50 text-cyan-800 border border-cyan-200">مدخل بيانات / حسابات</span>;
      default:
        return <span className="px-2.5 py-1 rounded-xl font-bold text-xs bg-slate-100 text-slate-700">{role}</span>;
    }
  };

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
              الإدارة التنفيذية والتحكم المركزي
            </span>
            <span className="text-xs font-bold text-slate-500 bg-white/80 px-2.5 py-1 rounded-full border border-slate-200/60">
              {formatDate(new Date())}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100/90 text-blue-700 rounded-2xl border border-blue-200 shadow-2xs">
              <Shield size={24} strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              الإعدادات والصلاحيات المركزية
            </h2>
          </div>
          <p className="text-slate-600 text-xs md:text-sm font-semibold max-w-2xl leading-relaxed">
            إدارة الحسابات والأدوار، هوية المنشأة للمطبوعات، تنبيهات الصيانة، النسخ الاحتياطي، وسجل الرقابة الإدارية.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={loadInitialData}
            disabled={loading}
            className="p-3 bg-white hover:bg-blue-50 text-blue-700 rounded-2xl border border-blue-200 transition-all shadow-xs"
            title="تحديث البيانات"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={handleDownloadBackup}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:brightness-110 text-white rounded-2xl font-black text-xs flex items-center gap-2 shadow-md shadow-blue-600/25 transition-all hover:scale-105 border border-blue-400/30"
          >
            <Download size={16} />
            <span>نسخة احتياطية سريعة 💾</span>
          </button>
        </div>
      </div>

      {/* Floating Feedback Notification Toast */}
      {feedback && (
        <div className={`p-4 rounded-2xl border text-sm font-black flex items-center gap-3 animate-in fade-in zoom-in-95 duration-200 shadow-md ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
            : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 size={20} className="text-emerald-600 shrink-0" /> : <AlertCircle size={20} className="text-rose-600 shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* 2. Structured Executive Navigation Tabs */}
      <div className="bg-white p-2.5 rounded-3xl shadow-sm border border-slate-200/80">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { id: 'users', title: 'المستخدمين والصلاحيات', sub: 'إدارة الحسابات والأدوار', icon: Users, color: 'text-blue-600 bg-blue-50 border-blue-200' },
            { id: 'alerts', title: 'دوريات الصيانة والتنبيهات', sub: 'مواعيد الاستحقاق وTDS', icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-100' },
            { id: 'backup', title: 'النسخ الاحتياطي وحماية البيانات', sub: 'تصدير وحفظ قاعدة البيانات', icon: Database, color: 'text-cyan-600 bg-cyan-50 border-cyan-100' },
            { id: 'audit', title: 'سجل الرقابة والعمليات', sub: 'تتبع الحركات الإدارية', icon: Activity, color: 'text-purple-600 bg-purple-50 border-purple-100' },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveSettingsTab)}
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
                  <div className={`text-xs font-black truncate leading-tight ${isActive ? 'text-white' : 'text-slate-800 group-hover:text-blue-950'}`}>
                    {tab.title}
                  </div>
                  <div className={`text-[10px] font-bold truncate mt-0.5 ${isActive ? 'text-blue-200' : 'text-slate-400'}`}>
                    {tab.sub}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: USERS & PERMISSIONS MANAGEMENT */}
      {/* ======================================================== */}
      {activeTab === 'users' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Header Card & Add User Action */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Users className="text-blue-600" size={22} />
                <span>سجل مستخدمي المنظومة والصلاحيات المعتمدة</span>
              </h3>
              <p className="text-xs text-slate-500 font-bold mt-1">
                تحديد الأدوار الوظيفية، ربط الحسابات بالفنيين الميدانيين، وإلغاء وتفعيل الوصول للنظام فورياً.
              </p>
            </div>

            {currentAuthUser?.role === 'ADMIN' && (
              <button
                onClick={handleOpenAddUser}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:brightness-110 text-white rounded-2xl font-black text-xs flex items-center gap-2 shadow-md shadow-blue-600/25 transition-all hover:scale-105 border border-blue-400/30"
              >
                <Plus size={16} strokeWidth={2.5} />
                <span>إضافة مستخدم جديد</span>
              </button>
            )}
          </div>

          {/* Users Table Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-xs font-black text-slate-600">
                    <th className="p-4">اسم المستخدم</th>
                    <th className="p-4">المسمى الوظيفي والدور</th>

                    <th className="p-4">الفني / الموظف المرتبط</th>
                    <th className="p-4 text-center">حالة الحساب</th>
                    <th className="p-4 text-center">تاريخ الإنشاء</th>
                    <th className="p-4 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-bold">
                  {usersList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-slate-400 font-bold">
                        لا يوجد مستخدمون مسجلون حالياً
                      </td>
                    </tr>
                  ) : (
                    usersList.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-4 font-black text-slate-900 flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center font-black text-xs text-blue-700">
                            {u.username.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div>{u.username}</div>
                            {currentAuthUser?.username === u.username && (
                              <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-200">
                                (حسابك الحالي)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">{getRoleBadge(u.role)}</td>

                        <td className="p-4 text-slate-700">
                          {u.employeeName ? (
                            <span className="flex items-center gap-1.5 font-bold text-slate-900">
                              <UserCheck size={14} className="text-emerald-600" />
                              {u.employeeName}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-normal">-- غير مرتبط بفني --</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {u.isActive ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              نشط ومصرح
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-50 text-rose-700 border border-rose-200/70">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                              معطل ومحظور
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center text-slate-500 font-bold" dir="ltr">
                          {formatDate(u.createdAt)}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditUser(u)}
                              className="p-2 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-all"
                              title="تعديل الدور أو كلمة المرور"
                            >
                              <Edit3 size={16} />
                            </button>
                            {currentAuthUser?.role === 'ADMIN' && currentAuthUser?.username !== u.username && (
                              <button
                                onClick={() => handleDeleteUser(u.id, u.username)}
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                title="حذف الحساب"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Visual Roles & Permissions Matrix */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="text-emerald-700" size={20} />
                <h4 className="font-black text-slate-900 text-sm">مصفوفة الصلاحيات المعتمدة للأدوار الوظيفية (RBAC)</h4>
              </div>
              <span className="text-xs text-slate-400 font-bold">حماية متقدمة متعددة المستويات</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
              {rolesMatrix.map((r: any) => (
                <div key={r.key} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-slate-900">{r.name}</span>
                    <span className="text-[10px] font-black text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                      {r.permissions.length} صلاحية
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-bold leading-relaxed">{r.description}</p>
                  <div className="pt-2 border-t border-slate-200/60 flex flex-wrap gap-1">
                    {r.permissions.slice(0, 5).map((p: string) => (
                      <span key={p} className="text-[9.5px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200/70">
                        {p}
                      </span>
                    ))}
                    {r.permissions.length > 5 && (
                      <span className="text-[9.5px] font-black text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded-md border border-sky-100">
                        +{r.permissions.length - 5}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}



      {/* ======================================================== */}
      {/* TAB 3: MAINTENANCE INTERVALS & SMART ALERTS PREFERENCES */}
      {/* ======================================================== */}
      {activeTab === 'alerts' && (
        <form onSubmit={handleSaveAlerts} className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <Clock className="text-amber-600" size={20} />
                <h3 className="font-black text-slate-900 text-base">معايير دوريات الصيانة والتنبيهات الاستباقية الذكية</h3>
              </div>
              <span className="text-xs text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-full font-bold">
                حساب آلي للمواعيد
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Alert Days Before */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-2">
                <label className="block text-xs font-black text-slate-800">
                  مهلة التنبيه المسبق لموعد الصيانة (أيام)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={alertPreferences.alertDaysBefore}
                  onChange={e => setAlertPreferences({...alertPreferences, alertDaysBefore: parseInt(e.target.value) || 7})}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-900 outline-none focus:border-amber-600"
                />
                <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                  يتم إدراج العميل في قائمة "صيانات قادمة" بالداش بورد قبل موعده المحدد بهذا العدد من الأيام لتجهيز خط السير.
                </p>
              </div>

              {/* Overdue Threshold */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-2">
                <label className="block text-xs font-black text-slate-800">
                  مهلة تصنيف الصيانة كـ "متأخرة" (أيام بعد الموعد)
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={alertPreferences.overdueThresholdDays}
                  onChange={e => setAlertPreferences({...alertPreferences, overdueThresholdDays: parseInt(e.target.value) || 1})}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-900 outline-none focus:border-amber-600"
                />
                <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                  عدد الأيام بعد فوات الموعد المجدول التي يتم بعدها تصنيف العميل فورياً كصيانة متأخرة باللون الوردي.
                </p>
              </div>

              {/* Standard TDS Limit */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-2">
                <label className="block text-xs font-black text-slate-800">
                  الحد الأقصى الموصى به لنسبة الأملاح TDS (PPM)
                </label>
                <input
                  type="number"
                  min="50"
                  max="500"
                  value={alertPreferences.standardTdsLimit}
                  onChange={e => setAlertPreferences({...alertPreferences, standardTdsLimit: parseInt(e.target.value) || 150})}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-900 outline-none focus:border-amber-600"
                />
                <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                  معيار تنبيه الفني عند قراءة جهاز القياس الرقمي بضرورة فحص وتغيير شمعة الممبرين فورياً.
                </p>
              </div>

            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:brightness-110 text-white rounded-2xl font-black text-xs md:text-sm flex items-center gap-2 shadow-md shadow-amber-600/25 transition-all hover:scale-105"
              >
                <Save size={16} />
                <span>{saving ? 'جاري الحفظ...' : 'حفظ معايير الصيانة والتنبيهات'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ======================================================== */}
      {/* TAB 4: DATABASE BACKUP & RECOVERY */}
      {/* ======================================================== */}
      {activeTab === 'backup' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Main Action Banner - Unified Executive Card */}
          <div className="bg-gradient-to-r from-white via-blue-50/50 to-indigo-50/40 rounded-3xl p-6 md:p-8 text-slate-800 shadow-sm border-2 border-blue-400/90 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-md transition-all">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-700 text-xs font-black">
                <Database size={18} />
                <span>تأمين وحماية البيانات السحابية والمحلية</span>
              </div>
              <h3 className="text-xl md:text-2xl font-black text-slate-900">النسخ الاحتياطي الشامل لمنظومة فلاتر الجمال</h3>
              <p className="text-xs md:text-sm text-slate-600 font-semibold max-w-2xl leading-relaxed">
                احصل على لقطة حية ومباشرة (Snapshot) لكافة بيانات العملاء، الزيارات الميدانية، أرصدة المخزن، الفنيين، والأقساط في ملف مؤمن بنقرة زر واحدة لحفظه على جهازك أو Google Drive.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleSelectRestoreFile}
                className="hidden"
              />
              {currentAuthUser?.role === 'ADMIN' && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-3.5 bg-white hover:bg-blue-50 border-2 border-blue-200 text-blue-900 rounded-2xl font-black text-xs md:text-sm flex items-center gap-2 transition-all hover:scale-105 shadow-xs"
                  title="استعادة البيانات من ملف JSON تم تنزيله سابقاً"
                >
                  <Upload size={17} strokeWidth={2.5} />
                  <span>استعادة من ملف احتياطي 🔄</span>
                </button>
              )}

              <button
                onClick={handleDownloadBackup}
                className="px-5 py-3.5 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:brightness-110 text-white rounded-2xl font-black text-xs md:text-sm flex items-center gap-2 shadow-md shadow-blue-600/25 transition-all hover:scale-105 border border-blue-400/30"
              >
                <Download size={17} strokeWidth={2.5} />
                <span>تحميل نسخة احتياطية (.JSON) 💾</span>
              </button>
            </div>
          </div>

          {/* Health & Database Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="text-xs font-bold text-slate-400">حجم قاعدة البيانات</div>
              <div className="text-xl font-black text-slate-900 mt-1">{systemStats?.dbSizeMb || 0} MB</div>
              <div className="text-[10.5px] text-emerald-700 font-bold mt-0.5">SQLite v3 Database</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="text-xs font-bold text-slate-400">سجلات العملاء</div>
              <div className="text-xl font-black text-slate-900 mt-1">{systemStats?.totalCustomers || 0} عميل</div>
              <div className="text-[10.5px] text-blue-700 font-bold mt-0.5">قاعدة عملاء مؤمنة</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="text-xs font-bold text-slate-400">الزيارات المنفذة</div>
              <div className="text-xl font-black text-slate-900 mt-1">{systemStats?.totalVisits || 0} زيارة</div>
              <div className="text-[10.5px] text-indigo-700 font-bold mt-0.5">سجل صيانة متكامل</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="text-xs font-bold text-slate-400">أصناف المخزن</div>
              <div className="text-xl font-black text-slate-900 mt-1">{systemStats?.totalInventoryItems || 0} صنف</div>
              <div className="text-[10.5px] text-amber-700 font-bold mt-0.5">جرد ومراقبة مخزنية</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="text-xs font-bold text-slate-400">المستخدمين والموظفين</div>
              <div className="text-xl font-black text-slate-900 mt-1">{(systemStats?.totalUsers || 0) + (systemStats?.totalEmployees || 0)} حساب</div>
              <div className="text-[10.5px] text-teal-700 font-bold mt-0.5">صلاحيات محددة</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="text-xs font-bold text-slate-400">حالة السيرفر</div>
              <div className="text-xl font-black text-emerald-700 mt-1">نشط ومستقر</div>
              <div className="text-[10.5px] text-slate-500 font-bold mt-0.5">Uptime: {systemStats?.serverUptimeHours || 0} ساعة</div>
            </div>
          </div>

          {/* Backup Guidelines Card */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80 space-y-3">
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <HelpCircle className="text-blue-600" size={18} />
              <span>إرشادات السلامة وتأمين بيانات فلاتر الجمال</span>
            </h4>
            <ul className="text-xs text-slate-600 font-bold space-y-2 list-disc list-inside leading-relaxed">
              <li>يُوصى بتحميل نسخة احتياطية بشكل أسبوعي أو بعد إدخال كميات كبيرة من العقود وحفظها على فلاشة خارجية منفصلة.</li>
              <li>الملف المستخرج يحتوي على بيانات مشفرة بصيغة JSON معتمدة يمكن استعادتها في أي وقت بنقرة واحدة عند تغيير جهاز الكمبيوتر.</li>
              <li>كلمات مرور المستخدمين مشفرة بتشفير أمني عالي (Bcrypt Salted Hash) ولا يمكن لأحد قراءتها داخل النسخة الاحتياطية.</li>
            </ul>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: AUDIT LOGS VIEWER */}
      {/* ======================================================== */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden animate-in fade-in duration-300">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/60">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Activity className="text-blue-600" size={20} />
                <span>سجل الرقابة الإدارية والأمنية (Audit Trail)</span>
              </h3>
              <p className="text-xs text-slate-500 font-bold mt-0.5">
                توثيق الحركات الإدارية، تعديلات المستخدمين، وإجراءات النظام لحظياً لضمان الشفافية ومسؤولية العمل.
              </p>
            </div>
            <span className="text-xs font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-xl border border-blue-200">
              آخر 50 عملية إدارية
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-xs font-black text-slate-600">
                  <th className="p-4">نوع العملية</th>
                  <th className="p-4">القسم / الكيان</th>
                  <th className="p-4">المستخدم المنفذ</th>
                  <th className="p-4 text-center">التاريخ والتوقيت</th>
                  <th className="p-4">ملخص التفاصيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-bold">
                {auditLogsList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-400 font-bold">
                      لا توجد عمليات مسجلة بالسجل الأمني حتى الآن
                    </td>
                  </tr>
                ) : (
                  auditLogsList.map((log: any) => (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 font-black">
                        <span className={`px-2.5 py-1 rounded-xl text-[11px] font-black ${
                          log.action?.includes('CREATE') ? 'bg-emerald-50 text-emerald-800' :
                          log.action?.includes('DELETE') ? 'bg-rose-50 text-rose-800' :
                          'bg-blue-50 text-blue-800 border border-blue-200'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="p-4 font-black text-slate-900">{log.entityName}</td>
                      <td className="p-4 text-slate-700">
                        <span className="font-black text-slate-900">{log.username || 'مدير النظام'}</span>
                        <span className="text-[10px] text-slate-400 block font-bold">{log.role || 'ADMIN'}</span>
                      </td>
                      <td className="p-4 text-center text-slate-500 font-bold" dir="ltr">
                        {new Date(log.createdAt).toLocaleString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-4 text-slate-600 font-mono text-[11px] max-w-xs truncate" title={JSON.stringify(log.newValues || {})}>
                        {log.newValues ? JSON.stringify(log.newValues) : '--'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT USER */}
      {/* ======================================================== */}
      {showUserModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 font-sans">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-slate-200/90 overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-700 rounded-xl border border-blue-100">
                  {editingUserId ? <Edit3 size={18} /> : <Plus size={18} />}
                </div>
                <h3 className="font-black text-slate-900 text-sm md:text-base">
                  {editingUserId ? 'تعديل بيانات المستخدم والصلاحيات' : 'إضافة مستخدم جديد للنظام'}
                </h3>
              </div>
              <button
                onClick={() => setShowUserModal(false)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5">
                  اسم المستخدم (Username) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={!!editingUserId}
                  value={userFormData.username}
                  onChange={e => setUserFormData({...userFormData, username: e.target.value})}
                  placeholder="مثال: ahmed_tech"
                  className="w-full p-2.5 text-sm font-bold border border-slate-200 rounded-xl focus:border-blue-500 outline-none disabled:bg-slate-100 disabled:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5">
                  {editingUserId ? 'كلمة المرور الجديدة (اتركها فارغة إذا لم ترد التغيير)' : 'كلمة المرور *'}
                </label>
                <input
                  type="text"
                  required={!editingUserId}
                  value={userFormData.password}
                  onChange={e => setUserFormData({...userFormData, password: e.target.value})}
                  placeholder={editingUserId ? '••••••••' : 'كلمة مرور لا تقل عن 4 خانات'}
                  className="w-full p-2.5 text-sm font-bold border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5">
                  الدور والصلاحيات الوظيفية <span className="text-rose-500">*</span>
                </label>
                <select
                  value={userFormData.role}
                  onChange={e => setUserFormData({...userFormData, role: e.target.value})}
                  className="w-full p-2.5 text-sm font-black border border-slate-200 rounded-xl focus:border-blue-500 outline-none bg-white"
                >
                  <option value="ADMIN">مدير النظام (كامل الصلاحيات والتحكم)</option>
                  <option value="MANAGER">مشرف عام / مدير فرع (إدارة وعمليات)</option>
                  <option value="TECHNICIAN">فني صيانة ميداني (تسجيل زيارات وشمع)</option>
                  <option value="DATA_ENTRY">مدخل بيانات / حسابات (عملاء وأقساط)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5">
                  ربط الحساب بموظف أو فني ميداني مسجل (اختياري)
                </label>
                <select
                  value={userFormData.employeeId}
                  onChange={e => setUserFormData({...userFormData, employeeId: e.target.value})}
                  className="w-full p-2.5 text-xs font-bold border border-slate-200 rounded-xl focus:border-blue-500 outline-none bg-white"
                >
                  <option value="">-- بدون ربط بموظف محدد --</option>
                  {availableEmployees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} {emp.isTechnician ? '(فني صيانة)' : '(إداري)'}</option>
                  ))}
                </select>
              </div>

              {editingUserId && (
                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={userFormData.isActive}
                      onChange={e => setUserFormData({...userFormData, isActive: e.target.checked})}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-xs font-black text-slate-800">الحساب نشط ومصرح له بالدخول للنظام</span>
                  </label>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-2 justify-between items-center">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200"
                >
                  إلغاء
                </button>
                <div className="flex gap-2">
                  {!editingUserId && (
                    <button
                      type="button"
                      disabled={saving}
                      onClick={(e) => handleSaveUser(e, true)}
                      className="px-4 py-2 bg-slate-50 text-blue-700 font-black rounded-xl text-xs hover:bg-blue-100 border border-blue-200 transition-all"
                    >
                      {saving ? '...' : 'حفظ وإضافة آخر'}
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white font-black rounded-xl text-xs hover:brightness-110 shadow-md shadow-blue-600/25 transition-all border border-blue-400/30"
                  >
                    {saving ? 'جاري الحفظ...' : (editingUserId ? 'تحديث المستخدم' : 'إنشاء المستخدم')}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: RESTORE BACKUP CONFIRMATION */}
      {/* ======================================================== */}
      {restoreConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 font-sans">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-slate-200/90 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-amber-50/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                  <Database size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    تأكيد استعادة النسخة الاحتياطية
                  </h3>
                  <span className="text-[11px] font-bold text-amber-800">
                    تم قراءة وتحليل ملف النسخة الاحتياطية بنجاح
                  </span>
                </div>
              </div>
              <button
                onClick={() => setRestoreConfirmModal(null)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs font-bold text-slate-700">
                <div className="flex justify-between">
                  <span>تاريخ استخراج النسخة:</span>
                  <span className="font-black text-slate-900" dir="ltr">{restoreConfirmModal.exportedAt ? formatDate(restoreConfirmModal.exportedAt) : 'غير محدد'}</span>
                </div>
                <div className="flex justify-between">
                  <span>المسؤول المستخرج:</span>
                  <span className="font-black text-blue-700">{restoreConfirmModal.exportedBy || 'مدير النظام'}</span>
                </div>
              </div>

              <div className="text-xs font-black text-slate-800">محتويات النسخة الاحتياطية المراد استعادتها:</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center text-xs font-bold">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="block text-slate-400 text-[10px]">العملاء</span>
                  <span className="font-black text-slate-900 text-sm">{restoreConfirmModal.data?.customers?.length || 0}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="block text-slate-400 text-[10px]">الزيارات الميدانية</span>
                  <span className="font-black text-slate-900 text-sm">{restoreConfirmModal.data?.visits?.length || 0}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="block text-slate-400 text-[10px]">أصناف المخزن</span>
                  <span className="font-black text-slate-900 text-sm">{restoreConfirmModal.data?.inventory?.length || 0}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="block text-slate-400 text-[10px]">الموظفون والفنيون</span>
                  <span className="font-black text-slate-900 text-sm">{restoreConfirmModal.data?.employees?.length || 0}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="block text-slate-400 text-[10px]">الأقساط</span>
                  <span className="font-black text-slate-900 text-sm">{restoreConfirmModal.data?.installments?.length || 0}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="block text-slate-400 text-[10px]">المصروفات</span>
                  <span className="font-black text-slate-900 text-sm">{restoreConfirmModal.data?.expenses?.length || 0}</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-amber-900 text-xs font-bold leading-relaxed">
                ⚠️ سيتم دمج السجلات وتحديث الإعدادات تلقائياً. تأكد من أن هذه النسخة خاصة بمؤسسة فلاتر الجمال.
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setRestoreConfirmModal(null)}
                  disabled={restoring}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleExecuteRestore}
                  disabled={restoring}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-black rounded-xl text-xs hover:brightness-110 shadow-md shadow-amber-600/20 flex items-center gap-2"
                >
                  <RefreshCw size={15} className={restoring ? 'animate-spin' : ''} />
                  <span>{restoring ? 'جاري الاستعادة...' : 'تأكيد واستعادة البيانات'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Users, Home, Wrench, Bell, UserCircle, Package, UserCheck, FileText, Settings as SettingsIcon, Moon, Sun } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import NotificationsPanel from '../components/NotificationsPanel';

export default function Dashboard({ children }: { children?: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('appDarkMode') === 'true';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('appDarkMode', isDark.toString());
  }, [isDark]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'الرئيسية', path: '/', icon: Home },
    { name: 'إدارة العملاء', path: '/customers', icon: Users },
    { name: 'الصيانات', path: '/maintenance', icon: Wrench },
    { name: 'المخزن', path: '/inventory', icon: Package },
    { name: 'الفنيين', path: '/employees', icon: UserCheck },
    { name: 'التقارير', path: '/reports', icon: FileText },
    { name: 'الإعدادات', path: '/settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080e1a] flex rtl font-sans">
      <NotificationsPanel isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
      {isNotifOpen && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={() => setIsNotifOpen(false)}></div>}

      {/* Sidebar - Pure Pearl-White & Executive Midnight Iris Theme */}
      <aside className="w-64 bg-white dark:bg-[#0b1325] border-l border-slate-200/80 dark:border-slate-800 hidden md:flex flex-col z-20 shadow-xs transition-colors select-none">
        
        {/* Logo Container with clean white card and subtle silver border */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-900/30">
          <div className="bg-white dark:bg-slate-900 p-2.5 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-700 flex items-center justify-center">
            <img 
              src="/logo-light-theme.png" 
              alt="فلاتر الجمال" 
              className="w-40 h-20 object-contain transition-transform hover:scale-105 duration-300" 
            />
          </div>
        </div>

        {/* Navigation items - Light Royal Theme */}
        <nav className="flex-1 p-3.5 space-y-1.5 mt-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`group flex items-center gap-3.5 px-4 py-3 rounded-2xl font-black text-sm transition-all duration-200 ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white shadow-md shadow-blue-600/25 scale-[1.01]' 
                    : 'text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-white hover:bg-blue-50/60 dark:hover:bg-slate-800/60'
                }`}
              >
                <item.icon 
                  size={20} 
                  className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600 dark:text-slate-400 dark:group-hover:text-blue-400 transition-colors'} 
                  strokeWidth={isActive ? 2.5 : 2} 
                />
                <span className="font-bold tracking-wide">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Subtle Bottom Status Bar */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-center bg-slate-50/80 dark:bg-slate-900/50">
          <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>مؤسسة فلاتر الجمال • متصل</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-[#080e1a] transition-colors">
        
        {/* Header - Pure Glass Pearl White */}
        <header className="bg-white/95 dark:bg-[#0b1325]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-6 py-4 flex justify-between items-center z-10 sticky top-0 transition-colors shadow-xs">
          <div className="md:hidden flex items-center gap-3">
            <img src="/logo-light-theme.png" alt="فلاتر الجمال" className="h-10 w-auto object-contain" />
            <h1 className="text-lg font-black text-slate-900 dark:text-white">فلاتر الجمال</h1>
          </div>
          <div className="hidden md:block">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
              {navItems.find(i => i.path === location.pathname)?.name || 'لوحة التحكم'}
            </h2>
          </div>
          
          <div className="flex items-center gap-5">
            <button 
              onClick={() => setIsDark(!isDark)} 
              className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              title="تغيير المظهر"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
              onClick={() => setIsNotifOpen(true)} 
              className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white transition-colors relative p-1.5 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-800"
              title="التنبيهات"
            >
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
            </button>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>
            <div className="flex items-center gap-3">
              <div className="text-left hidden sm:block">
                <div className="text-sm font-black text-slate-800 dark:text-white">{user?.username}</div>
                <div className="text-xs text-slate-400 font-bold">{user?.role === 'ADMIN' ? 'مدير النظام' : 'مستخدم'}</div>
              </div>
              <div className="bg-blue-50 dark:bg-slate-800 p-2 rounded-full text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-slate-700">
                <UserCircle size={24} />
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 ml-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
                title="تسجيل الخروج"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-6 transition-colors">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

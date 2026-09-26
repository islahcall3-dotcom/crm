import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

const Home = lazy(() => import('./pages/Home'));
const CustomersList = lazy(() => import('./pages/customers/CustomersList'));
const CustomerProfile = lazy(() => import('./pages/customers/CustomerProfile'));
const MaintenanceList = lazy(() => import('./pages/MaintenanceList'));
const InventoryList = lazy(() => import('./pages/InventoryList'));
const EmployeesList = lazy(() => import('./pages/EmployeesList'));
const Reports = lazy(() => import('./pages/Reports'));
const Settings = lazy(() => import('./pages/Settings'));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900 font-bold">جاري التحميل...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// A simple shell around nested routes
function DashboardLayout() {
  return (
    <Dashboard>
      <Suspense fallback={<div className="flex h-full items-center justify-center p-8 text-slate-400 font-bold">جاري تحميل الصفحة...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/customers" element={<CustomersList />} />
          <Route path="/customers/:id" element={<CustomerProfile />} />
          <Route path="/maintenance" element={<MaintenanceList />} />
          <Route path="/inventory" element={<InventoryList />} />
          <Route path="/employees" element={<EmployeesList />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Suspense>
    </Dashboard>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

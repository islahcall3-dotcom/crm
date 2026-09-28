import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

import Home from './pages/Home';
import CustomersList from './pages/customers/CustomersList';
import CustomerProfile from './pages/customers/CustomerProfile';
import MaintenanceList from './pages/MaintenanceList';
import InventoryList from './pages/InventoryList';
import EmployeesList from './pages/EmployeesList';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

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

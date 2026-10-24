import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { VoiceProvider } from './context/VoiceContext';

import DashboardLayout from './layouts/DashboardLayout';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import WalletPage from './pages/WalletPage';
import AddMoneyPage from './pages/AddMoneyPage';
import TransferPage from './pages/TransferPage';
import PayBillsPage from './pages/PayBillsPage';
import TransactionsPage from './pages/TransactionsPage';
import AdminPage from './pages/AdminPage';
import DatabaseSchemaPage from './pages/DatabaseSchemaPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <VoiceProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/database-schema" element={<DashboardLayout />}>
              <Route index element={<DatabaseSchemaPage />} />
            </Route>

            {/* Dashboard Workspace */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="wallet" element={<WalletPage />} />
              <Route path="add-money" element={<AddMoneyPage />} />
              <Route path="transfer" element={<TransferPage />} />
              <Route path="bills" element={<PayBillsPage />} />
              <Route path="transactions" element={<TransactionsPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            {/* Admin Console */}
            <Route path="/admin" element={<DashboardLayout />}>
              <Route index element={<AdminPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </VoiceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoginPage from '@/features/auth/LoginPage';
import CompanyListPage from '@/features/crm/CompanyListPage';
import CompanyDetailPage from '@/features/crm/CompanyDetailPage';
import ContactListPage from '@/features/crm/ContactListPage';
import ActivityLogPage from '@/features/activity/ActivityLogPage';
import DashboardPage from '@/features/dashboard/DashboardPage';
import TeamPage from '@/features/auth/TeamPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/companies" element={<CompanyListPage />} />
          <Route path="/companies/:id" element={<CompanyDetailPage />} />
          <Route path="/contacts" element={<ContactListPage />} />
          <Route path="/activity" element={<ActivityLogPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
      
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

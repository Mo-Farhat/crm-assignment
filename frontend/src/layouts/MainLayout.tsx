import React from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/store';
import { logout } from '@/features/auth/authSlice';
import { LogOut, LayoutDashboard, Building2, Users, History, Shield } from 'lucide-react';

const MainLayout: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200">
        <div className="p-6">
          <h1 className="text-xl font-bold text-slate-900 leading-tight">CRM Assessment</h1>
          <p className="text-xs text-slate-500 truncate mt-1">{user?.email}</p>
        </div>
        <nav className="mt-4 px-4 space-y-1">
          <Link
            to="/dashboard"
            className="flex items-center px-4 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 mr-3" />
            Dashboard
          </Link>
          <Link
            to="/companies"
            className="flex items-center px-4 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Building2 className="w-4 h-4 mr-3" />
            Companies
          </Link>
          <Link
            to="/contacts"
            className="flex items-center px-4 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Users className="w-4 h-4 mr-3" />
            Contacts
          </Link>
          {user?.role === 'admin' && (
            <Link
              to="/team"
              className="flex items-center px-4 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Shield className="w-4 h-4 mr-3 text-indigo-500" />
              Team Management
            </Link>
          )}
          <Link
            to="/activity"
            className="flex items-center px-4 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <History className="w-4 h-4 mr-3" />
            Activity Log
          </Link>
        </nav>
        <div className="absolute bottom-0 w-64 p-4 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
            {window.location.pathname.split('/').pop() || 'Dashboard'}
          </h2>
        </header>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;

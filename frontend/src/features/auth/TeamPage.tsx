import React, { useEffect, useState } from 'react';
import api from '@/services/api';
import { Shield, Mail, User, Plus } from 'lucide-react';
import AddUserModal from './AddUserModal';

const TeamPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users/');
      setUsers(response.data.data.results);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getRoleBadge = (role: string) => {
    const colors: any = {
      admin: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      manager: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      staff: 'bg-slate-100 text-slate-600 border-slate-200',
    };
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${colors[role] || colors.staff}`}>
        {role}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 leading-tight">Team Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage users and roles within your organization</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-32 bg-white rounded-2xl border border-slate-200 animate-pulse" />)}
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((u) => (
            <div key={u.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{u.first_name} {u.last_name}</h3>
                  <div className="mt-1">{getRoleBadge(u.role)}</div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-50 space-y-2">
                <div className="flex items-center text-sm text-slate-500">
                  <Mail className="w-4 h-4 mr-2 text-slate-300" />
                  {u.email}
                </div>
                <div className="flex items-center text-sm text-slate-500">
                  <Shield className="w-4 h-4 mr-2 text-slate-300" />
                  {u.organization_name || 'Organization Member'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddUserModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchUsers}
      />
    </div>
  );
};

export default TeamPage;

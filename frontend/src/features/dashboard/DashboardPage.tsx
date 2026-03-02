import React, { useEffect, useState } from 'react';
import api from '@/services/api';
import AddCompanyModal from '@/features/crm/AddCompanyModal';
import GlobalAddContactModal from '@/features/crm/GlobalAddContactModal';
import { Building2, Users, History, TrendingUp, Activity, Plus, UserPlus } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState({
    company_count: 0,
    contact_count: 0,
    recent_activity_count: 0
  });
  const [loading, setLoading] = useState(true);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/stats/');
        setStats(response.data.data);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Companies',
      value: stats.company_count,
      icon: Building2,
      color: 'bg-blue-500',
      description: 'Active business accounts'
    },
    {
      title: 'Active Contacts',
      value: stats.contact_count,
      icon: Users,
      color: 'bg-green-500',
      description: 'Key relationship stakeholders'
    },
    {
      title: 'System Activity',
      value: stats.recent_activity_count,
      icon: History,
      color: 'bg-purple-500',
      description: 'Total log entries recorded'
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500 text-sm mt-1">Real-time metrics for your organization</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.color} bg-opacity-10 rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 text-${stat.color.split('-')[1]}-600`} />
              </div>
              <TrendingUp className="w-4 h-4 text-slate-300" />
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.title}</div>
            <div className="text-3xl font-black text-slate-900">
              {loading ? <div className="h-9 w-16 bg-slate-100 animate-pulse rounded" /> : stat.value}
            </div>
            <p className="text-slate-400 text-xs mt-2">{stat.description}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900 flex items-center"><Activity className="w-4 h-4 mr-2 text-slate-400" /> Quick Actions</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setIsCompanyModalOpen(true)}
              className="p-4 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-100 transition-colors text-left group"
            >
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                <Plus className="w-4 h-4 text-slate-900" />
              </div>
              <div className="font-bold text-slate-900 text-sm">New Company</div>
              <div className="text-slate-400 text-xs">Add a business lead</div>
            </button>
            <button 
              onClick={() => setIsContactModalOpen(true)}
              className="p-4 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-100 transition-colors text-left group"
            >
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                <UserPlus className="w-4 h-4 text-slate-900" />
              </div>
              <div className="font-bold text-slate-900 text-sm">New Contact</div>
              <div className="text-slate-400 text-xs">Add a relationship</div>
            </button>
          </div>
        </div>

        <AddCompanyModal 
          isOpen={isCompanyModalOpen}
          onClose={() => setIsCompanyModalOpen(false)}
          onSuccess={() => {
            setIsCompanyModalOpen(false);
            // navigate to the new list or refresh
            window.location.reload(); 
          }}
        />

        <GlobalAddContactModal 
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
          onSuccess={() => {
            setIsContactModalOpen(false);
            window.location.reload(); 
          }}
        />

        <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-lg shadow-slate-900/20 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2 text-white">System Status</h3>
            <p className="text-slate-400 text-sm">All services are currently operational and secure.</p>
          </div>
          <div className="mt-8">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-slate-400">Security Coverage</span>
              <span className="font-bold">100%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-green-500 h-full w-[100%]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/store';
import { setCompanies, setLoading, setError, removeCompany } from '@/features/crm/crmSlice';
import api from '@/services/api';
import { Search, Plus, Building2, MapPin, Briefcase, Trash2 } from 'lucide-react';
import AddCompanyModal from './AddCompanyModal';
import { toast } from '@/components/ui/toast';

const CompanyListPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { companies, loading, error } = useAppSelector((state) => state.crm);
  const { user } = useAppSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const canAdd = isAdmin || isManager || user?.role === 'staff';
  const canDelete = isAdmin;

  useEffect(() => {
    const fetchCompanies = async () => {
      dispatch(setLoading(true));
      try {
        const response = await api.get(`/companies/?page=${page}`);
        dispatch(setCompanies(response.data.data.results));
        // Simple check for more results — StandardPagination returns 'next' URL
        setHasMore(!!response.data.data.next);
      } catch (err: any) {
        dispatch(setError(err.message));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchCompanies();
  }, [dispatch, page]);

  const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await api.delete(`/companies/${id}/`);
        dispatch(removeCompany(id));
        toast.success('Company deleted successfully');
      } catch (err) {
        toast.error('Failed to delete company');
      }
    }
  };

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Companies</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your organization's business relationships</p>
        </div>
        {canAdd && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Company
          </button>
        )}
      </div>

      <div className="flex items-center space-x-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all text-sm"
            placeholder="Search by name or industry..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
          Error: {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => (
            <div key={company.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group relative">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-colors shadow-sm">
                  {company.logo_url ? (
                    <img src={company.logo_url} alt={company.name} className="w-full h-full object-contain p-1" />
                  ) : (
                    <Building2 className="w-6 h-6" />
                  )}
                </div>
                {canDelete && (
                  <button 
                    onClick={(e) => handleDelete(e, company.id, company.name)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <h3 className="font-bold text-slate-900 text-lg group-hover:text-slate-700 transition-colors uppercase tracking-tight">{company.name}</h3>
              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-slate-500">
                  <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                  {company.country || 'Not specified'}
                </div>
                <div className="flex items-center text-sm text-slate-500">
                  <Briefcase className="w-4 h-4 mr-2 text-slate-400" />
                  {company.industry || 'General Business'}
                </div>
              </div>
              
            </div>
          ))}
          {filteredCompanies.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 border border-dashed border-slate-200 rounded-2xl bg-slate-50">
              No companies found matching your search.
            </div>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && !error && (
        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Page {page}</p>
          <div className="flex gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold disabled:opacity-30 hover:bg-slate-50 transition-colors"
            >
              Previous
            </button>
            <button 
              disabled={!hasMore}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold disabled:opacity-30 hover:bg-slate-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <AddCompanyModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default CompanyListPage;

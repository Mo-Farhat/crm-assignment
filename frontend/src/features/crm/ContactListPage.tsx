import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { Users, Search, Mail, Phone, Building2, Plus, Edit2, Trash2 } from 'lucide-react';
import GlobalAddContactModal from './GlobalAddContactModal';
import { useAppSelector } from '@/hooks/store';
import { toast } from '@/components/ui/toast';

const ContactListPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<any>(null);

  const canAdd = user?.role === 'admin' || user?.role === 'manager' || user?.role === 'staff';
  const canEdit = user?.role === 'admin' || user?.role === 'manager' || user?.role === 'staff';
  const canDelete = user?.role === 'admin' || user?.role === 'manager';

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/contacts/?page=${page}&search=${searchTerm}`);
      setContacts(response.data.data.results);
      setHasMore(!!response.data.data.next);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(fetchContacts, 300);
    return () => clearTimeout(debounce);
  }, [page, searchTerm]);

  const handleEdit = (e: React.MouseEvent, contact: any) => {
    e.stopPropagation();
    setSelectedContact(contact);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedContact(null);
    setIsModalOpen(true);
  };

  const handleDeleteContact = async (e: React.MouseEvent, contactId: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this contact?')) return;
    try {
      await api.delete(`/contacts/${contactId}/`);
      setContacts((prev) => prev.filter((c: any) => c.id !== contactId));
      toast.success('Contact deleted successfully');
    } catch (err: any) {
      toast.error('Failed to delete contact');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 leading-tight">Contacts</h1>
          <p className="text-slate-500 text-sm mt-1">Manage all organization relationships in one place</p>
        </div>
        <div className="flex items-center gap-3">
          {canAdd && (
            <button 
              onClick={handleAdd}
              className="flex items-center px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Contact
            </button>
          )}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search contacts..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all w-64"
            />
          </div>
        </div>
      </div>

      {loading && page === 1 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-40 bg-white rounded-2xl border border-slate-200 animate-pulse" />)}
        </div>
      ) : error ? (
        <div className="p-12 text-center bg-red-50 rounded-2xl border border-red-100 text-red-600 font-medium">
          Error: {error}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contacts.map((contact) => (
              <div 
                key={contact.id} 
                onClick={() => navigate(`/companies/${contact.company}`)}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
                        <Users className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 truncate max-w-[150px]">{contact.full_name}</h3>
                        <div className="text-xs text-slate-400 font-bold uppercase tracking-tighter flex items-center">
                          <Building2 className="w-3 h-3 mr-1" />
                          {contact.company_name || 'Individual'}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {canEdit && (
                        <button 
                          onClick={(e) => handleEdit(e, contact)}
                          className="p-2 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {canDelete && (
                        <button 
                          onClick={(e) => handleDeleteContact(e, contact.id)}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-3 pt-3 border-t border-slate-50">
                    <div className="flex items-center text-sm text-slate-600">
                      <Mail className="w-4 h-4 mr-3 text-slate-300" />
                      <span className="truncate">{contact.email}</span>
                    </div>
                    {contact.phone && (
                      <div className="flex items-center text-sm text-slate-600">
                        <Phone className="w-4 h-4 mr-3 text-slate-300" />
                        {contact.phone}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {contacts.length === 0 && (
              <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-400">No contacts found</h3>
                <p className="text-slate-400 text-sm">Try adjusting your search filters.</p>
              </div>
            )}
          </div>

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
        </>
      )}
      <GlobalAddContactModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedContact(null);
        }}
        onSuccess={fetchContacts}
        contact={selectedContact}
      />
    </div>
  );
};

export default ContactListPage;

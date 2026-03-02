import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { Building2, User, Mail, Phone, ArrowLeft, Plus, Trash2, Edit2 } from 'lucide-react';
import AddContactModal from './AddContactModal';
import AddCompanyModal from './AddCompanyModal';
import { toast } from '@/components/ui/toast';
import { useAppSelector } from '@/hooks/store';

const CompanyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [company, setCompany] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);

  const canAdd = user?.role === 'admin' || user?.role === 'manager' || user?.role === 'staff';
  const canEdit = user?.role === 'admin' || user?.role === 'manager' || user?.role === 'staff';
  const canDelete = user?.role === 'admin' || user?.role === 'manager';

  const fetchContacts = async () => {
    try {
      const contRes = await api.get(`/companies/${id}/contacts/`);
      setContacts(contRes.data.data.results);
    } catch (err: any) {
      console.error('Failed to refresh contacts', err);
    }
  };

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const [compRes] = await Promise.all([
        api.get(`/companies/${id}/`),
        fetchContacts()
      ]);
      setCompany(compRes.data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleEditCompany = () => {
    setIsCompanyModalOpen(true);
  };

  const handleEditContact = (contact: any) => {
    setSelectedContact(contact);
    setIsContactModalOpen(true);
  };

  const handleAddContact = () => {
    setSelectedContact(null);
    setIsContactModalOpen(true);
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;
    try {
      await api.delete(`/companies/${id}/contacts/${contactId}/`);
      setContacts(contacts.filter(c => c.id !== contactId));
      toast.success('Contact deleted successfully');
    } catch (err: any) {
      toast.error('Failed to delete contact');
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div></div>;
  if (error) return <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">Error: {error}</div>;
  if (!company) return <div>Company not found</div>;

  return (
    <div className="space-y-8">
      <button 
        onClick={() => navigate('/companies')}
        className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Companies
      </button>

      {/* Company Header */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center">
          <div className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center text-white mr-6 shadow-xl shadow-slate-900/20">
            {company.logo_url ? (
              <img src={company.logo_url} alt={company.name} className="w-full h-full object-contain p-2" />
            ) : (
              <Building2 className="w-10 h-10" />
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{company.name}</h1>
            <p className="text-slate-500 mt-1 flex items-center">
              <span className="px-2 py-0.5 bg-slate-100 rounded text-xs font-bold mr-3 uppercase">{company.industry}</span>
              {company.country}
            </p>
          </div>
        </div>
        {canEdit && (
          <div className="flex gap-3">
            <button 
              onClick={handleEditCompany}
              className="flex items-center px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Company
            </button>
          </div>
        )}
      </div>

      {/* Contacts Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Contacts</h2>
          {canAdd && (
            <button 
              onClick={handleAddContact}
              className="flex items-center px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Contact
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contacts.map((contact) => (
            <div key={contact.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex justify-between items-start group hover:border-slate-300 transition-colors">
              <div className="flex">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mr-4">
                  <User className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{contact.full_name}</h4>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-3">{contact.role || 'Member'}</p>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-slate-600">
                      <Mail className="w-3.5 h-3.5 mr-2 text-slate-400" />
                      {contact.email}
                    </div>
                    {contact.phone && (
                      <div className="flex items-center text-sm text-slate-600">
                        <Phone className="w-3.5 h-3.5 mr-2 text-slate-400" />
                        {contact.phone}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                {canEdit && (
                  <button 
                    onClick={() => handleEditContact(contact)}
                    className="p-2 text-slate-300 hover:text-indigo-500 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
                {canDelete && (
                  <button 
                    onClick={() => handleDeleteContact(contact.id)}
                    className="p-2 text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
          {contacts.length === 0 && (
            <div className="col-span-full py-12 bg-white rounded-xl border border-dashed border-slate-300 text-center text-slate-400">
              No contacts found for this company.
            </div>
          )}
        </div>
      </div>

      <AddCompanyModal 
        isOpen={isCompanyModalOpen} 
        onClose={() => setIsCompanyModalOpen(false)} 
        company={company}
        onSuccess={fetchDetails}
      />

      <AddContactModal 
        isOpen={isContactModalOpen} 
        onClose={() => {
          setIsContactModalOpen(false);
          setSelectedContact(null);
        }} 
        companyId={id!} 
        companyName={company.name}
        contact={selectedContact}
        onSuccess={fetchContacts}
      />
    </div>
  );
};

export default CompanyDetailPage;

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import api from '@/services/api';

const contactSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\d{8,15}$/, 'Phone must be 8-15 digits').optional().or(z.literal('')),
  role: z.string().optional(),
  company: z.string().min(1, 'Please select a company'),
});

type ContactFormValues = z.infer<typeof contactSchema>;

interface GlobalAddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  contact?: any; // For Edit mode
}

const GlobalAddContactModal: React.FC<GlobalAddContactModalProps> = ({ isOpen, onClose, onSuccess, contact }) => {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: contact || {
      full_name: '',
      email: '',
      phone: '',
      role: '',
      company: '',
    }
  });

  // Re-sync form
  useEffect(() => {
    if (contact) {
      reset({
        ...contact,
        company: contact.company_id || contact.company || '',
      });
    } else {
      reset({ full_name: '', email: '', phone: '', role: '', company: '' });
    }
  }, [contact, reset]);

  useEffect(() => {
    if (isOpen) {
      const fetchCompanies = async () => {
        setLoadingCompanies(true);
        try {
          const response = await api.get('/companies/?page_size=100');
          setCompanies(response.data.data.results);
        } catch (error) {
          console.error('Failed to fetch companies', error);
        } finally {
          setLoadingCompanies(false);
        }
      };
      fetchCompanies();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const onSubmit = async (data: ContactFormValues) => {
    try {
      if (contact?.id) {
        // Edit Mode
        await api.patch(`/contacts/${contact.id}/`, data);
        toast.success('Contact updated successfully!');
      } else {
        // Create Mode
        await api.post('/contacts/', data);
        toast.success('Contact added successfully!');
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-black text-slate-900">{contact ? 'Edit Contact' : 'Add New Contact'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Select Company</label>
            <select
              {...register('company')}
              className={`w-full px-4 py-2 bg-slate-50 border ${errors.company ? 'border-red-500' : 'border-slate-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all text-sm appearance-none cursor-pointer`}
              disabled={loadingCompanies}
            >
              <option value="">{loadingCompanies ? 'Loading companies...' : 'Choose a company...'}</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errors.company && <p className="text-red-500 text-xs mt-1 font-medium">{errors.company.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Full Name</label>
            <input
              {...register('full_name')}
              className={`w-full px-4 py-2 bg-slate-50 border ${errors.full_name ? 'border-red-500' : 'border-slate-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all text-sm`}
              placeholder="e.g. John Doe"
            />
            {errors.full_name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.full_name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Email</label>
              <input
                {...register('email')}
                className={`w-full px-4 py-2 bg-slate-50 border ${errors.email ? 'border-red-500' : 'border-slate-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all text-sm`}
                placeholder="john@acme.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Phone</label>
              <input
                {...register('phone')}
                className={`w-full px-4 py-2 bg-slate-50 border ${errors.phone ? 'border-red-500' : 'border-slate-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all text-sm`}
                placeholder="1234567890"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1 font-medium">{errors.phone.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Role</label>
            <input
              {...register('role')}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all text-sm"
              placeholder="e.g. CTO"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1 bg-slate-900 hover:bg-slate-800 text-white" disabled={isSubmitting}>
              {isSubmitting ? (contact ? 'Saving...' : 'Adding...') : (contact ? 'Save Changes' : 'Add Contact')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GlobalAddContactModal;

import React from 'react';
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
});

type ContactFormValues = z.infer<typeof contactSchema>;

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  companyName: string;
  onSuccess: () => void;
  contact?: any; // If provided, we are in Edit mode
}

const AddContactModal: React.FC<AddContactModalProps> = ({ isOpen, onClose, companyId, companyName, onSuccess, contact }) => {
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
    }
  });

  // Re-sync form if contact prop changes
  React.useEffect(() => {
    if (contact) {
      reset(contact);
    } else {
      reset({ full_name: '', email: '', phone: '', role: '' });
    }
  }, [contact, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data: ContactFormValues) => {
    try {
      if (contact?.id) {
        // Edit Mode
        await api.patch(`/companies/${companyId}/contacts/${contact.id}/`, data);
        toast.success('Contact updated successfully!');
      } else {
        // Create Mode - backend handles company_id from URL
        await api.post(`/companies/${companyId}/contacts/`, data);
        toast.success('Contact added successfully!');
      }
      onSuccess();
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
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Company</label>
            <input
              type="text"
              readOnly
              disabled
              value={companyName}
              className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-500 cursor-not-allowed font-medium"
            />
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

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Email Address</label>
            <input
              {...register('email')}
              className={`w-full px-4 py-2 bg-slate-50 border ${errors.email ? 'border-red-500' : 'border-slate-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all text-sm`}
              placeholder="e.g. john@example.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Phone Number</label>
            <input
              {...register('phone')}
              className={`w-full px-4 py-2 bg-slate-50 border ${errors.phone ? 'border-red-500' : 'border-slate-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all text-sm`}
              placeholder="e.g. 1234567890"
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1 font-medium">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Role / Job Title</label>
            <input
              {...register('role')}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all text-sm"
              placeholder="e.g. CTO, Sales Lead"
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

export default AddContactModal;

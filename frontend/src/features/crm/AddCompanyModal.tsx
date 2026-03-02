import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import api from '@/services/api';
import { useAppDispatch } from '@/hooks/store';
import { addCompany } from './crmSlice';

const companySchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters'),
  industry: z.string().min(2, 'Industry is required'),
  country: z.string().optional(),
  logo: z.any().optional(),
});

type CompanyFormValues = z.infer<typeof companySchema>;

interface AddCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  company?: any; // If provided, we are in Edit mode
}

const AddCompanyModal: React.FC<AddCompanyModalProps> = ({ isOpen, onClose, onSuccess, company }) => {
  const dispatch = useAppDispatch();
  const [logoPreview, setLogoPreview] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: company || {
      name: '',
      industry: '',
      country: '',
    }
  });

  // Re-sync form if company prop changes (for editing)
  React.useEffect(() => {
    if (company) {
      reset(company);
      setLogoPreview(company.logo_url || null);
    } else {
      reset({ name: '', industry: '', country: '' });
      setLogoPreview(null);
    }
  }, [company, reset]);

  const logoFile = watch('logo');

  React.useEffect(() => {
    if (logoFile && logoFile[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(logoFile[0]);
    }
  }, [logoFile]);

  if (!isOpen) return null;

  const onSubmit = async (data: CompanyFormValues) => {
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('industry', data.industry);
      if (data.country) formData.append('country', data.country);
      if (data.logo && data.logo[0] instanceof File) {
        formData.append('logo', data.logo[0]);
      }

      let response;
      if (company?.id) {
        // Edit Mode
        response = await api.patch(`/companies/${company.id}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Company updated successfully!');
      } else {
        // Create Mode
        response = await api.post('/companies/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        dispatch(addCompany(response.data.data));
        toast.success('Company created successfully!');
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
          <h2 className="text-xl font-black text-slate-900">{company ? 'Edit Company' : 'Add New Company'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="flex justify-center mb-4">
            <div className="relative group">
              <div className="w-24 h-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center overflow-hidden transition-colors group-hover:border-slate-300">
                {logoPreview ? (
                  <img src={logoPreview} alt="Preview" className="w-full h-full object-contain p-2" />
                ) : (
                  <div className="text-center">
                    <Building2 className="w-8 h-8 text-slate-300 mx-auto" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1 block">Logo</span>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                {...register('logo')}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Company Name</label>
            <input
              {...register('name')}
              className={`w-full px-4 py-2 bg-slate-50 border ${errors.name ? 'border-red-500' : 'border-slate-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all text-sm`}
              placeholder="e.g. Acme Corp"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Industry</label>
            <input
              {...register('industry')}
              className={`w-full px-4 py-2 bg-slate-50 border ${errors.industry ? 'border-red-500' : 'border-slate-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all text-sm`}
              placeholder="e.g. Technology"
            />
            {errors.industry && <p className="text-red-500 text-xs mt-1 font-medium">{errors.industry.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Country</label>
            <input
              {...register('country')}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all text-sm"
              placeholder="e.g. United States"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1 bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20" disabled={isSubmitting}>
              {isSubmitting ? (company ? 'Updating...' : 'Uploading...') : (company ? 'Save Changes' : 'Create Company')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCompanyModal;

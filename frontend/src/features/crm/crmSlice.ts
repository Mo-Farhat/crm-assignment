import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CRMState {
  companies: any[];
  contacts: any[];
  loading: boolean;
  error: string | null;
}

const initialState: CRMState = {
  companies: [],
  contacts: [],
  loading: false,
  error: null,
};

const crmSlice = createSlice({
  name: 'crm',
  initialState,
  reducers: {
    setCompanies: (state, action: PayloadAction<any[]>) => {
      state.companies = action.payload;
    },
    setContacts: (state, action: PayloadAction<any[]>) => {
      state.contacts = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addCompany: (state, action: PayloadAction<any>) => {
      state.companies = [action.payload, ...state.companies];
    },
    removeCompany: (state, action: PayloadAction<string>) => {
      state.companies = state.companies.filter((c) => c.id !== action.payload);
    },
  },
});

export const { setCompanies, setContacts, setLoading, setError, addCompany, removeCompany } = crmSlice.actions;
export default crmSlice.reducer;

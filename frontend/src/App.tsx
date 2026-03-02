import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { AppRoutes } from './routes';
import { Toaster } from '@/components/ui/toast';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Toaster position="top-right" richColors />
      <Router>
        <AppRoutes />
      </Router>
    </Provider>
  );
};

export default App;

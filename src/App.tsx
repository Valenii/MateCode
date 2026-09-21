import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { AppRouter } from './routes/AppRouter';
import { Navbar } from './components/Navbar';

export const App: React.FC = () => {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <div className="app-container">
          <Navbar />
          <AppRouter />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

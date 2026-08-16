import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { ThemeProvider } from './components/providers/ThemeProvider.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: {
  queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
  },
});

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
  <ThemeProvider defaultTheme="system">
  <QueryClientProvider client={queryClient}>
  <ToastProvider>
  <AuthProvider>
  <BrowserRouter>
  <App />
  </BrowserRouter>
  </AuthProvider>
  </ToastProvider>
  </QueryClientProvider>
  </ThemeProvider>
  </React.StrictMode>
);

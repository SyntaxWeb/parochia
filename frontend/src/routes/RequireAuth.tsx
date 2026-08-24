import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../stores/auth';

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="grid min-h-screen place-items-center bg-slate-50 text-sm text-parochia-muted">Carregando Parochia...</div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { api, csrf } from '../api/client';
import type { ApiEnvelope, User } from '../types/api';

interface AuthState { user: User | null; loading: boolean; isAuthenticated: boolean; login(email: string, password: string): Promise<void>; loginWithGoogle(credential: string): Promise<void>; acceptInviteWithGoogle(token: string, credential: string): Promise<void>; logout(): Promise<void>; setUser(user: User | null): void; }
const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get<ApiEnvelope<User>>('/auth/me').then((response) => setUser(response.data.data)).catch(() => setUser(null)).finally(() => setLoading(false)); }, []);

  const value = useMemo<AuthState>(() => ({
    user,
    loading,
    isAuthenticated: user !== null,
    setUser,
    async login(email: string, password: string) {
      await csrf();
      const response = await api.post<ApiEnvelope<User>>('/auth/login', { email, password });
      setUser(response.data.data);
    },
    async loginWithGoogle(credential: string) {
      await csrf();
      const response = await api.post<ApiEnvelope<User>>('/auth/google', { credential });
      setUser(response.data.data);
    },
    async acceptInviteWithGoogle(token: string, credential: string) {
      await csrf();
      const response = await api.post<ApiEnvelope<User>>(`/invites/${token}/google`, { credential, token });
      setUser(response.data.data);
    },
    async logout() {
      await api.post('/auth/logout');
      setUser(null);
    },
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return value;
}

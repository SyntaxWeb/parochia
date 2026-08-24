import { FormEvent, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Eye, Lock, LogIn, Mail } from 'lucide-react';
import { useAuth } from '../../stores/auth';
import { GoogleSignInButton } from '../../components/GoogleSignInButton';
import logoDark from '../../assets/parochia-logo.svg';

export function LoginPage() {
  const { login, loginWithGoogle, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('admin@parochia.local');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  async function handleGoogle(credential: string) {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle(credential);
    } catch {
      setError('Nao foi possivel entrar com o Google. Verifique se seu usuario ja foi convidado.');
    } finally {
      setLoading(false);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch {
      setError('Nao foi possivel entrar com essas credenciais.');
    } finally {
      setLoading(false);
    }
  }

  return <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_left,#1E4A8A_0,#0F2D54_44%,#07182d_100%)] px-4 py-8">
    <form onSubmit={submit} className="w-full max-w-md rounded-lg border border-white/15 bg-white p-7 shadow-2xl shadow-black/30">
      <div className="mb-7 rounded-lg bg-white px-3 py-2 shadow-sm">
        <img src={logoDark} alt="Parochia - Sistema de Gestao Paroquial" className="h-auto w-full rounded-md" />
      </div>
      <label className="mb-4 block text-sm font-medium text-parochia-navy">E-mail
        <span className="mt-1 flex h-11 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 focus-within:border-parochia-blue focus-within:ring-2 focus-within:ring-parochia-gold/30"><Mail size={17} className="text-parochia-muted"/><input className="h-full flex-1 text-parochia-navy outline-none" value={email} onChange={(e) => setEmail(e.target.value)} type="email" /></span>
      </label>
      <label className="mb-5 block text-sm font-medium text-parochia-navy">Senha
        <span className="mt-1 flex h-11 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 focus-within:border-parochia-blue focus-within:ring-2 focus-within:ring-parochia-gold/30"><Lock size={17} className="text-parochia-muted"/><input className="h-full flex-1 text-parochia-navy outline-none" value={password} onChange={(e) => setPassword(e.target.value)} type="password" /><Eye size={17} className="text-parochia-muted"/></span>
      </label>
      {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <button className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-parochia-navy px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-parochia-blue disabled:opacity-60" disabled={loading}><LogIn size={18} />{loading ? 'Entrando...' : 'ENTRAR'}</button>
      <div className="my-5 flex items-center gap-3 text-xs text-parochia-muted"><span className="h-px flex-1 bg-slate-200" />ou<span className="h-px flex-1 bg-slate-200" /></div>
      <GoogleSignInButton onCredential={handleGoogle} />
      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-parochia-muted"><span className="h-px w-8 bg-parochia-gold" />by SyntaxWeb<span className="h-px w-8 bg-parochia-gold" /></div>
    </form>
  </main>;
}

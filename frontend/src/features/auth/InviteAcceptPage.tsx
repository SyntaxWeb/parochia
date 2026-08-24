import { useCallback, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MailCheck } from 'lucide-react';
import { getUserInvite } from '../../api/resources';
import { GoogleSignInButton } from '../../components/GoogleSignInButton';
import { useAuth } from '../../stores/auth';
import logo from '../../assets/parochia-logo.svg';

export function InviteAcceptPage() {
  const { token = '' } = useParams();
  const { acceptInviteWithGoogle, isAuthenticated } = useAuth();
  const invite = useQuery({ queryKey: ['invite', token], queryFn: () => getUserInvite(token), enabled: !!token });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogle = useCallback(async (credential: string) => {
    setLoading(true);
    setError(null);
    try {
      await acceptInviteWithGoogle(token, credential);
    } catch {
      setError('Nao foi possivel aceitar o convite com esta conta Google.');
    } finally {
      setLoading(false);
    }
  }, [acceptInviteWithGoogle, token]);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_left,#1E4A8A_0,#0F2D54_44%,#07182d_100%)] px-4 py-8">
    <section className="w-full max-w-md rounded-lg border border-white/15 bg-white p-7 shadow-2xl shadow-black/30">
      <div className="mb-6 rounded-lg bg-white px-3 py-2 shadow-sm"><img src={logo} alt="Parochia" className="h-auto w-full rounded-md" /></div>
      {invite.isLoading && <p className="text-sm text-parochia-muted">Carregando convite...</p>}
      {invite.isError && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">Convite invalido ou expirado.</p>}
      {invite.data && <div className="space-y-5">
        <div className="flex items-start gap-3 rounded-md bg-parochia-goldLight/35 px-3 py-3"><MailCheck className="mt-0.5 text-parochia-gold" size={22}/><div><h1 className="font-semibold text-parochia-navy">Convite para acessar {invite.data.tenant.name}</h1><p className="mt-1 text-sm text-parochia-muted">Entre com sua conta Google para concluir o cadastro.</p></div></div>
        {invite.data.email && <p className="text-sm text-parochia-navy">Convite enviado para <strong>{invite.data.email}</strong>.</p>}
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        {loading ? <p className="text-sm text-parochia-muted">Validando conta Google...</p> : <GoogleSignInButton onCredential={handleGoogle} text="signup_with" />}
      </div>}
    </section>
  </main>;
}

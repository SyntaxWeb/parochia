import { FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowRight, CheckCircle2, CreditCard, Loader2, UserPlus } from 'lucide-react';
import { AxiosError } from 'axios';
import { api, csrf } from '../../api/client';
import { createOnboarding, getOnboardingPlans } from '../../api/resources';
import { Field } from '../../components/ui/FormControls';
import { useAuth } from '../../stores/auth';
import type { ApiEnvelope, OnboardingPayload, User } from '../../types/api';
import logo from '../../assets/parochia-logo.svg';

const initialForm: OnboardingPayload = {
  user: { name: '', email: '', password: '', password_confirmation: '', phone: '' },
  parish: { name: '', cnpj: '', phone: '', email: '', address: '', number: '', complement: '', district: '', city: '', state: '', zip_code: '', priest_name: '' },
  plan: 'mensal',
};

function money(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function errorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { message?: string; errors?: Record<string, string[]> } | undefined;
    const firstError = data?.errors ? Object.values(data.errors)[0]?.[0] : null;
    return firstError ?? data?.message ?? 'Nao foi possivel concluir o cadastro.';
  }
  return 'Nao foi possivel concluir o cadastro.';
}

export function OnboardingPage() {
  const { isAuthenticated, loading, setUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<OnboardingPayload>(initialForm);
  const [error, setError] = useState<string | null>(null);
  const plans = useQuery({ queryKey: ['onboarding-plans'], queryFn: getOnboardingPlans });

  const mutation = useMutation({
    mutationFn: async () => {
      await csrf();
      return createOnboarding(form);
    },
    onSuccess: async (result) => {
      const me = await api.get<ApiEnvelope<User>>('/auth/me');
      setUser(me.data.data);
      if (result.checkout.checkout_url) window.location.href = result.checkout.checkout_url;
      else navigate('/assinatura');
    },
    onError: (err) => setError(errorMessage(err)),
  });

  if (!loading && isAuthenticated) return <Navigate to="/dashboard" replace />;

  function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    mutation.mutate();
  }

  const selectedPlan = plans.data?.find((plan) => plan.key === form.plan);

  return <main className="min-h-screen bg-[linear-gradient(120deg,#0F2D54_0%,#143d70_46%,#f8fafc_46.2%,#ffffff_100%)] px-5 py-6 text-parochia-navy md:px-10">
    <header className="mx-auto flex max-w-7xl items-center justify-between">
      <Link to="/"><img src={logo} alt="Parochia" className="h-12 rounded-md bg-white px-3 py-1 shadow-sm" /></Link>
      <Link to="/login" className="inline-flex h-10 items-center rounded-md border border-white/40 px-4 text-sm font-semibold text-white hover:bg-white/10">Entrar</Link>
    </header>

    <section className="mx-auto grid max-w-7xl gap-8 py-10 lg:grid-cols-[0.78fr_1.22fr] lg:py-16">
      <aside className="max-w-xl text-white">
        <p className="mb-4 inline-flex rounded-full border border-parochia-gold/60 px-3 py-1 text-sm text-parochia-goldLight">Primeiro acesso</p>
        <h1 className="text-4xl font-semibold leading-tight md:text-5xl">Crie a conta da sua paroquia</h1>
        <p className="mt-5 text-base leading-7 text-white/85">Informe os dados principais, escolha um plano e finalize a ativacao. O primeiro usuario sera criado como administrador paroquial.</p>
        <div className="mt-8 grid gap-3 text-sm text-white/90">
          {['Administrador com acesso completo', 'Paroquia vinculada a um ambiente proprio', 'Categorias e permissoes padrao criadas automaticamente', 'Pagamento direcionado ao final do cadastro'].map((item) => <div key={item} className="flex items-center gap-3"><CheckCircle2 size={18} className="text-parochia-gold" />{item}</div>)}
        </div>
      </aside>

      <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-2xl shadow-parochia-navy/15 md:p-6">
        <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
          <div><p className="text-sm text-parochia-muted">Cadastro inicial</p><h2 className="text-xl font-semibold">Dados da paroquia</h2></div>
          <UserPlus className="text-parochia-gold" size={26} />
        </div>

        {error && <div className="mb-4 rounded-md bg-red-50 px-3 py-3 text-sm text-red-700">{error}</div>}

        <div className="grid gap-5 xl:grid-cols-2">
          <section className="grid gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-parochia-muted">Administrador</h3>
            <Field label="Nome" value={form.user.name} onChange={(e) => setForm({ ...form, user: { ...form.user, name: e.target.value } })} required />
            <Field label="E-mail" type="email" value={form.user.email} onChange={(e) => setForm({ ...form, user: { ...form.user, email: e.target.value, } })} required />
            <Field label="Telefone" value={form.user.phone} onChange={(e) => setForm({ ...form, user: { ...form.user, phone: e.target.value } })} />
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Senha" type="password" value={form.user.password} onChange={(e) => setForm({ ...form, user: { ...form.user, password: e.target.value } })} required />
              <Field label="Confirmar senha" type="password" value={form.user.password_confirmation} onChange={(e) => setForm({ ...form, user: { ...form.user, password_confirmation: e.target.value } })} required />
            </div>
          </section>

          <section className="grid gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-parochia-muted">Paroquia</h3>
            <Field label="Nome da paroquia" value={form.parish.name} onChange={(e) => setForm({ ...form, parish: { ...form.parish, name: e.target.value } })} required />
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="CNPJ" value={form.parish.cnpj} onChange={(e) => setForm({ ...form, parish: { ...form.parish, cnpj: e.target.value } })} />
              <Field label="Telefone" value={form.parish.phone} onChange={(e) => setForm({ ...form, parish: { ...form.parish, phone: e.target.value } })} />
            </div>
            <Field label="E-mail da paroquia" type="email" value={form.parish.email} onChange={(e) => setForm({ ...form, parish: { ...form.parish, email: e.target.value } })} />
            <Field label="Padre responsavel" value={form.parish.priest_name} onChange={(e) => setForm({ ...form, parish: { ...form.parish, priest_name: e.target.value } })} />
          </section>
        </div>

        <section className="mt-5 grid gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-parochia-muted">Endereco</h3>
          <div className="grid gap-3 xl:grid-cols-[1.4fr_0.45fr_1fr]">
            <Field label="Endereco" value={form.parish.address} onChange={(e) => setForm({ ...form, parish: { ...form.parish, address: e.target.value } })} />
            <Field label="Numero" value={form.parish.number} onChange={(e) => setForm({ ...form, parish: { ...form.parish, number: e.target.value } })} />
            <Field label="Bairro" value={form.parish.district} onChange={(e) => setForm({ ...form, parish: { ...form.parish, district: e.target.value } })} />
          </div>
          <div className="grid gap-3 md:grid-cols-[1fr_90px_0.8fr_1fr]">
            <Field label="Cidade" value={form.parish.city} onChange={(e) => setForm({ ...form, parish: { ...form.parish, city: e.target.value } })} />
            <Field label="UF" maxLength={2} value={form.parish.state} onChange={(e) => setForm({ ...form, parish: { ...form.parish, state: e.target.value.toUpperCase() } })} />
            <Field label="CEP" value={form.parish.zip_code} onChange={(e) => setForm({ ...form, parish: { ...form.parish, zip_code: e.target.value } })} />
            <Field label="Complemento" value={form.parish.complement} onChange={(e) => setForm({ ...form, parish: { ...form.parish, complement: e.target.value } })} />
          </div>
        </section>

        <section className="mt-5">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-parochia-muted">Plano</h3>
          <div className="grid gap-3 md:grid-cols-3">
            {(plans.data ?? []).map((plan) => <button key={plan.key} type="button" onClick={() => setForm({ ...form, plan: plan.key })} className={`rounded-lg border p-4 text-left transition ${form.plan === plan.key ? 'border-parochia-gold bg-parochia-gold/10 ring-1 ring-parochia-gold/30' : 'border-slate-200 bg-white hover:border-parochia-blue/40'}`}>
              <span className="block text-sm font-semibold">{plan.name}</span>
              <span className="mt-2 block text-2xl font-semibold">{money(plan.price)}</span>
              <span className="mt-1 block text-xs text-parochia-muted">{plan.months} mes(es)</span>
            </button>)}
          </div>
          {!plans.isLoading && !plans.data?.length && <p className="text-sm text-red-700">Nao foi possivel carregar os planos.</p>}
        </section>

        <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-parochia-muted">{selectedPlan ? <>Plano selecionado: <strong className="text-parochia-navy">{selectedPlan.name}</strong></> : 'Selecione um plano para continuar.'}</div>
          <button disabled={mutation.isPending || plans.isLoading} className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-parochia-navy px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
            {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
            Continuar <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </section>
  </main>;
}

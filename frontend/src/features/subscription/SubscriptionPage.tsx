import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, CreditCard, ExternalLink, ReceiptText, RefreshCw } from 'lucide-react';
import { getSubscription, requestSubscriptionCheckout } from '../../api/resources';
import { Panel } from '../../components/ui/Panel';
import type { SubscriptionPlan } from '../../types/api';

function money(value: string | number | undefined) {
  return Number(value ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function dateLabel(value: string | null | undefined) {
  if (!value) return 'Nao definida';
  return new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function statusClass(status: string | undefined) {
  return status === 'ativo' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-800 border-amber-200';
}

export function SubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const subscription = useQuery({ queryKey: ['subscription'], queryFn: getSubscription });
  const checkout = useMutation({
    mutationFn: requestSubscriptionCheckout,
    onMutate: (plan) => { setSelectedPlan(plan); setError(null); },
    onSuccess: (payload) => {
      if (payload.checkout_url) window.location.href = payload.checkout_url;
      else setError('Nao foi possivel gerar o link do Mercado Pago.');
    },
    onError: (err) => setError(err instanceof Error ? err.message : 'Nao foi possivel iniciar o pagamento.'),
    onSettled: () => setSelectedPlan(null),
  });

  const queryStatus = useMemo(() => new URLSearchParams(window.location.search).get('status'), []);

  if (subscription.isLoading) {
    return <Panel title="Assinatura"><p className="text-sm text-parochia-muted">Carregando assinatura...</p></Panel>;
  }

  if (!subscription.data) {
    return <Panel title="Assinatura"><p className="text-sm text-red-700">Nao foi possivel carregar os dados da assinatura.</p></Panel>;
  }

  const { tenant, plan, available_plans: plans, latest_order: latestOrder } = subscription.data;
  const inactive = tenant.subscription_status !== 'ativo';
  const pendingCheckoutUrl = latestOrder?.status === 'pendente' ? latestOrder.checkout_url : null;

  return <div className="space-y-5">
    {queryStatus && <div className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${queryStatus === 'sucesso' ? 'border-green-200 bg-green-50 text-green-700' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
      {queryStatus === 'sucesso' ? <CheckCircle2 size={18}/> : <AlertCircle size={18}/>}Retorno do Mercado Pago: {queryStatus}.
    </div>}

    <section className="grid gap-5 xl:grid-cols-[1fr_380px]">
      <Panel title="Minha assinatura">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs text-parochia-muted">Assinatura</p>
            <p className="mt-1 text-lg font-semibold text-parochia-navy">{tenant.name}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs text-parochia-muted">Plano atual</p>
            <p className="mt-1 text-lg font-semibold text-parochia-navy">{plan?.name ?? tenant.subscription_plan}</p>
          </div>
          <div className={`rounded-lg border px-4 py-3 ${statusClass(tenant.subscription_status)}`}>
            <p className="text-xs opacity-80">Status</p>
            <p className="mt-1 text-lg font-semibold capitalize">{tenant.subscription_status}</p>
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 px-4 py-3">
            <p className="text-xs text-parochia-muted">Valor</p>
            <p className="mt-1 text-2xl font-semibold text-parochia-navy">{money(tenant.subscription_price || plan?.price)}</p>
          </div>
          <div className="rounded-lg border border-slate-200 px-4 py-3">
            <p className="text-xs text-parochia-muted">Renovacao</p>
            <p className="mt-1 text-lg font-semibold text-parochia-navy">{dateLabel(tenant.subscription_renews_at)}</p>
          </div>
        </div>
        {inactive && <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">Sua assinatura nao esta ativa. Escolha um plano para liberar o uso completo do sistema.</p>}
        {pendingCheckoutUrl && <button onClick={() => window.open(pendingCheckoutUrl, '_blank', 'noopener,noreferrer')} className="mt-4 inline-flex h-10 items-center gap-2 rounded-md border border-parochia-gold/50 px-3 text-sm font-semibold text-parochia-navy"><ExternalLink size={16}/>Continuar pagamento pendente</button>}
        {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      </Panel>

      <Panel title="Mercado Pago">
        <div className="grid gap-3 text-sm text-parochia-navy">
          <div className="flex items-start gap-3 rounded-md bg-slate-50 px-3 py-3"><CreditCard className="mt-0.5 text-parochia-gold" size={18}/><span>O checkout e processado pelo Mercado Pago usando o fluxo de preferencia de pagamento.</span></div>
          <div className="flex items-start gap-3 rounded-md bg-slate-50 px-3 py-3"><ReceiptText className="mt-0.5 text-parochia-gold" size={18}/><span>Quando o pagamento for aprovado, o webhook atualiza plano, status, valor e renovacao da assinatura.</span></div>
          <div className="flex items-start gap-3 rounded-md bg-slate-50 px-3 py-3"><RefreshCw className="mt-0.5 text-parochia-gold" size={18}/><span>Use o token `MERCADO_PAGO_ACCESS_TOKEN` no backend para habilitar pagamentos reais.</span></div>
        </div>
      </Panel>
    </section>

    <section className="grid gap-4 md:grid-cols-3">
      {plans.map((availablePlan: SubscriptionPlan) => {
        const isCurrent = availablePlan.key === tenant.subscription_plan;
        const canCheckout = inactive || !isCurrent;
        return <article key={availablePlan.key} className={`rounded-lg border bg-white p-4 shadow-sm ${isCurrent ? 'border-parochia-gold ring-1 ring-parochia-gold/30' : 'border-slate-200'}`}>
          <div className="flex items-start justify-between gap-3">
            <div><h3 className="text-base font-semibold text-parochia-navy">{availablePlan.name}</h3><p className="text-sm text-parochia-muted">{availablePlan.months} mes(es)</p></div>
            {isCurrent && <span className="rounded-full bg-parochia-goldLight px-2 py-1 text-xs font-semibold text-parochia-navy">Atual</span>}
          </div>
          <p className="mt-4 text-2xl font-semibold text-parochia-navy">{money(availablePlan.price)}</p>
          <button disabled={!canCheckout || checkout.isPending} onClick={() => checkout.mutate(availablePlan.key)} className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-md bg-parochia-navy text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-55"><CreditCard size={16}/>{selectedPlan === availablePlan.key ? 'Gerando link...' : isCurrent && !inactive ? 'Plano ativo' : 'Assinar agora'}</button>
        </article>;
      })}
    </section>
  </div>;
}

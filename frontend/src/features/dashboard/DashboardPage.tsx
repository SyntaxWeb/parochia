import { useQuery } from '@tanstack/react-query';
import { getDashboard } from '../../api/resources';
import { Panel } from '../../components/ui/Panel';

export function DashboardPage() {
  const dashboard = useQuery({ queryKey: ['dashboard'], queryFn: getDashboard });
  const cards = dashboard.data?.cards ?? [];
  return <section className="space-y-5">
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{cards.map((card) => <article key={card.label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><p className="text-sm text-parochia-muted">{card.label}</p><strong className="mt-2 block text-2xl text-parochia-navy">{card.value}</strong></article>)}</div>
    <Panel title="Proximas acoes">{dashboard.isLoading ? <p className="text-sm text-parochia-muted">Carregando...</p> : <ul className="grid gap-2 text-sm text-slate-700">{dashboard.data?.next_steps.map((step) => <li key={step} className="rounded-md bg-slate-50 px-3 py-2">{step}</li>)}</ul>}</Panel>
  </section>;
}

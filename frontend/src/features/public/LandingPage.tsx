import { Link, Navigate } from 'react-router-dom';
import { CalendarDays, CheckCircle2, Church, CreditCard, ShieldCheck, Users } from 'lucide-react';
import { useAuth } from '../../stores/auth';
import logo from '../../assets/parochia-logo.svg';

const highlights = [
  { icon: CalendarDays, title: 'Agenda paroquial', text: 'Eventos, missas, reunioes, lembretes e filtros por igreja ou paroquia.' },
  { icon: Church, title: 'Igrejas e comunidades', text: 'Cadastro centralizado das comunidades vinculadas a cada paroquia.' },
  { icon: Users, title: 'Usuarios e perfis', text: 'Controle de acesso por funcao, permissao e contexto operacional.' },
  { icon: CreditCard, title: 'Assinatura e planos', text: 'Gestao simples do plano contratado e da continuidade do acesso.' },
];

export function LandingPage() {
  const { isAuthenticated, loading } = useAuth();

  if (!loading && isAuthenticated) return <Navigate to="/dashboard" replace />;

  return <main className="min-h-screen bg-white text-parochia-navy">
    <header className="absolute left-0 right-0 top-0 z-10 flex h-20 items-center justify-between px-5 md:px-10">
      <img src={logo} alt="Parochia" className="h-12 w-auto rounded-md bg-white/95 px-3 py-1 shadow-sm" />
      <Link to="/login" className="inline-flex h-10 items-center justify-center rounded-md bg-parochia-navy px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-parochia-blue">Entrar</Link>
    </header>

    <section className="relative overflow-hidden bg-[linear-gradient(110deg,#0F2D54_0%,#123b70_48%,#ffffff_48.2%,#ffffff_100%)] px-5 pt-28 md:px-10">
      <div className="mx-auto grid min-h-[620px] max-w-7xl items-center gap-10 lg:grid-cols-[1fr_0.9fr]">
        <div className="max-w-2xl pb-10 text-white">
          <p className="mb-4 inline-flex rounded-full border border-parochia-gold/60 px-3 py-1 text-sm text-parochia-goldLight">Sistema Web de Gestao Paroquial</p>
          <h1 className="text-4xl font-semibold leading-tight md:text-6xl">Parochia</h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-white/85">Uma plataforma para organizar a rotina paroquial com agenda, comunidades, usuarios, permissoes, notificacoes e assinatura em um unico lugar.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/cadastro" className="inline-flex h-11 items-center justify-center rounded-md bg-parochia-gold px-5 text-sm font-semibold text-parochia-navy shadow-sm transition hover:bg-parochia-goldLight">Comecar cadastro</Link>
            <a href="#recursos" className="inline-flex h-11 items-center justify-center rounded-md border border-white/40 px-5 text-sm font-semibold text-white transition hover:bg-white/10">Ver recursos</a>
          </div>
        </div>

        <div className="pb-10 lg:pl-8">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-2xl shadow-parochia-navy/20">
            <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
              <div><p className="text-sm text-parochia-muted">Visao geral</p><h2 className="text-xl font-semibold text-parochia-navy">Gestao paroquial</h2></div>
              <ShieldCheck className="text-parochia-gold" size={28} />
            </div>
            <div className="grid gap-3">
              {['Agenda compartilhada', 'Contexto por paroquia ou igreja', 'Categorias e itens padrao', 'Controle de assinatura'].map((item) => <div key={item} className="flex items-center gap-3 rounded-md bg-slate-50 px-3 py-3 text-sm text-parochia-navy"><CheckCircle2 size={17} className="text-parochia-gold" />{item}</div>)}
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-md bg-parochia-navy px-3 py-4 text-white"><strong className="block text-2xl">Gestao</strong><span className="text-xs text-white/75">paroquial</span></div>
              <div className="rounded-md bg-parochia-blue px-3 py-4 text-white"><strong className="block text-2xl">24/7</strong><span className="text-xs text-white/75">web</span></div>
              <div className="rounded-md bg-parochia-gold px-3 py-4 text-parochia-navy"><strong className="block text-2xl">Plano</strong><span className="text-xs">assinatura</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="recursos" className="mx-auto max-w-7xl px-5 py-14 md:px-10">
      <div className="mb-8 max-w-2xl"><h2 className="text-2xl font-semibold text-parochia-navy">Recursos principais</h2><p className="mt-2 text-sm leading-6 text-parochia-muted">Ferramentas praticas para secretaria, coordenacao pastoral e administracao paroquial trabalharem com dados consistentes.</p></div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{highlights.map(({ icon: Icon, title, text }) => <article key={title} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><Icon size={24} className="mb-4 text-parochia-gold" /><h3 className="font-semibold text-parochia-navy">{title}</h3><p className="mt-2 text-sm leading-6 text-parochia-muted">{text}</p></article>)}</div>
    </section>
  </main>;
}

import { Building2, CalendarDays, ChevronLeft, ChevronRight, CreditCard, Home, LogOut, Settings, ShieldCheck, Users } from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { useAuth } from '../stores/auth';
import type { ApiEnvelope, ContextPayload } from '../types/api';
import logo from '../assets/parochia-logo.svg';
import mark from '../assets/parochia-mark.svg';
import { NotificationBell } from '../components/NotificationBell';
import { ContextSwitcher } from '../components/ContextSwitcher';

const menuItems = [
  { label: 'Dashboard', icon: Home, to: '/dashboard' },
  { label: 'Agenda', icon: CalendarDays, to: '/agenda' },
  { label: 'Igrejas', icon: Building2, to: '/igrejas' },
  { label: 'Usuarios', icon: Users, to: '/usuarios' },
  { label: 'Perfis', icon: ShieldCheck, to: '/perfis' },
  { label: 'Paroquia', icon: Settings, to: '/configuracoes' },
  { label: 'Assinatura', icon: CreditCard, to: '/assinatura' },
];
const titles: Record<string, string> = { '/dashboard': 'Dashboard', '/agenda': 'Agenda Paroquial', '/igrejas': 'Igrejas', '/usuarios': 'Usuarios', '/perfis': 'Perfis e permissoes', '/configuracoes': 'Configuracoes da paroquia', '/assinatura': 'Assinatura' };

export function AppLayout() {
  const { user, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const contextQuery = useQuery({ queryKey: ['contexts'], queryFn: async () => (await api.get<ApiEnvelope<ContextPayload>>('/context')).data.data });

  return <div className="min-h-screen bg-[#f3f6fa]">
    <header className="flex h-16 items-center justify-between border-b border-parochia-gold/30 bg-parochia-navy px-4 text-white shadow-sm md:px-6">
      <div className="flex items-center gap-3">
        <div className="hidden h-11 w-44 overflow-hidden rounded-md bg-white p-1 shadow-sm sm:block"><img src={logo} alt="Parochia" className="h-full w-full object-contain" /></div>
        <img src={mark} alt="Parochia" className="h-10 w-10 rounded-md sm:hidden" />
      </div>
      <div className="flex items-center gap-3">
        <ContextSwitcher payload={contextQuery.data} />
        <NotificationBell />
        <button title="Sair" onClick={logout} className="grid h-10 w-10 place-items-center rounded-md border border-parochia-gold/40 bg-white/10 text-white transition hover:bg-white/20"><LogOut size={18} /></button>
      </div>
    </header>
    <div className={`grid min-h-[calc(100vh-4rem)] transition-[grid-template-columns] duration-200 ${sidebarCollapsed ? 'md:grid-cols-[76px_1fr]' : 'md:grid-cols-[248px_1fr]'}`}>
      <aside className="border-b border-slate-200 bg-white p-3 shadow-sm md:border-b-0 md:border-r">
        <div className={`mb-3 hidden items-center md:flex ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!sidebarCollapsed && <div className="flex items-center gap-2"><img src={mark} alt="Parochia" className="h-8 w-8 rounded-md" /><span className="text-sm font-semibold text-parochia-navy">Menu</span></div>}
          <button type="button" title={sidebarCollapsed ? 'Expandir menu' : 'Recolher menu'} aria-label={sidebarCollapsed ? 'Expandir menu' : 'Recolher menu'} onClick={() => setSidebarCollapsed((value) => !value)} className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 text-parochia-navy transition hover:bg-parochia-goldLight/35">
            {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
        <nav className="grid grid-cols-3 gap-2 md:grid-cols-1">{menuItems.map(({ label, icon: Icon, to }) => <NavLink key={label} to={to} title={sidebarCollapsed ? label : undefined} className={({ isActive }) => `flex h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium ${sidebarCollapsed ? 'md:px-0' : 'md:justify-start'} ${isActive ? 'bg-parochia-navy text-white shadow-sm ring-1 ring-parochia-gold/40' : 'text-parochia-navy hover:bg-parochia-goldLight/35'}`}><Icon size={17} /><span className={`${sidebarCollapsed ? 'md:hidden' : ''} hidden sm:inline`}>{label}</span></NavLink>)}</nav>
        <div className={`mt-8 hidden border-t border-slate-200 pt-4 text-xs text-parochia-muted md:block ${sidebarCollapsed ? 'text-center' : ''}`}>{sidebarCollapsed ? <span className="text-parochia-gold">SW</span> : <><span className="text-parochia-gold">by</span> SyntaxWeb</>}</div>
      </aside>
      <main className="min-w-0 p-4 md:p-6"><div className="mb-5 border-b border-slate-200 pb-4"><h2 className="text-xl font-semibold text-parochia-navy">{titles[location.pathname] ?? 'Parochia'}</h2><p className="text-sm text-parochia-muted">Bem-vindo, {user?.name}</p></div><Outlet /></main>
    </div>
  </div>;
}

import { Bell, CheckCheck } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../api/resources';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ['notifications'], queryFn: getNotifications, refetchInterval: 30000 });
  const markOne = useMutation({ mutationFn: markNotificationRead, onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }) });
  const markAll = useMutation({ mutationFn: markAllNotificationsRead, onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }) });
  const unread = query.data?.unread_count ?? 0;
  const notifications = query.data?.notifications ?? [];

  return <div className="relative">
    <button type="button" title="Notificacoes" onClick={() => setOpen((value) => !value)} className="relative grid h-10 w-10 place-items-center rounded-md border border-parochia-gold/40 bg-white/10 text-white transition hover:bg-white/20">
      <Bell size={18} />
      {unread > 0 && <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-parochia-gold px-1 text-[11px] font-bold text-parochia-navy">{unread > 9 ? '9+' : unread}</span>}
    </button>
    {open && <div className="absolute right-0 z-40 mt-2 w-[340px] overflow-hidden rounded-lg border border-slate-200 bg-white text-parochia-navy shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3"><strong className="text-sm">Notificacoes</strong><button onClick={() => markAll.mutate()} className="flex items-center gap-1 text-xs text-parochia-blue"><CheckCheck size={14}/>Marcar todas</button></div>
      <div className="max-h-[420px] overflow-auto">{notifications.length === 0 ? <p className="px-4 py-6 text-center text-sm text-parochia-muted">Nenhuma notificacao.</p> : notifications.map((notification) => <Link key={notification.id} to={notification.action_url ?? '#'} onClick={() => { if (!notification.read_at) markOne.mutate(notification.id); setOpen(false); }} className={`block border-b border-slate-100 px-4 py-3 text-sm hover:bg-parochia-goldLight/25 ${notification.read_at ? 'bg-white' : 'bg-[#f8fbff]'}`}><div className="flex items-start justify-between gap-3"><strong className="text-parochia-navy">{notification.title}</strong>{!notification.read_at && <span className="mt-1 h-2 w-2 rounded-full bg-parochia-gold" />}</div>{notification.message && <p className="mt-1 leading-5 text-slate-600">{notification.message}</p>}<p className="mt-2 text-xs text-parochia-muted">{formatDate(notification.created_at)}</p></Link>)}</div>
    </div>}
  </div>;
}

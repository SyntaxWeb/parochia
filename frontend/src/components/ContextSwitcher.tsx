import { Building2, Check, ChevronsUpDown, Church } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import type { AppContext, ContextPayload } from '../types/api';

export function ContextSwitcher({ payload }: { payload?: ContextPayload }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const contexts = payload?.contexts ?? [];
  const current = useMemo(() => contexts.find((item) => item.type === payload?.current.type && item.id === payload?.current.id) ?? contexts[0], [contexts, payload]);
  const mutation = useMutation({
    mutationFn: async (context: AppContext) => api.put('/context', { type: context.type, id: context.id }),
    onSuccess: () => { queryClient.invalidateQueries(); setOpen(false); },
  });

  return <div className="relative min-w-[260px] max-w-[360px]">
    <button type="button" onClick={() => setOpen((value) => !value)} className="flex h-11 w-full items-center justify-between gap-3 rounded-md border border-parochia-gold/40 bg-white px-3 text-left text-parochia-navy shadow-sm outline-none transition hover:border-parochia-gold focus:ring-2 focus:ring-parochia-gold/40">
      <span className="flex min-w-0 items-center gap-2">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-parochia-goldLight/50 text-parochia-navy">{current?.type === 'parish' ? <Building2 size={17} /> : <Church size={17} />}</span>
        <span className="min-w-0"><span className="block text-[11px] font-semibold uppercase tracking-wide text-parochia-muted">{current?.type === 'parish' ? 'Visao paroquial' : 'Igreja selecionada'}</span><span className="block truncate text-sm font-semibold">{current?.name ?? 'Selecionar contexto'}</span></span>
      </span>
      <ChevronsUpDown size={17} className="shrink-0 text-parochia-muted" />
    </button>
    {open && <div className="absolute right-0 z-50 mt-2 w-full overflow-hidden rounded-lg border border-slate-200 bg-white text-parochia-navy shadow-xl">
      <div className="border-b border-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-parochia-muted">Trocar contexto</div>
      <div className="max-h-72 overflow-auto p-1">{contexts.map((context) => {
        const active = current?.type === context.type && current.id === context.id;
        return <button key={`${context.type}:${context.id}`} type="button" onClick={() => mutation.mutate(context)} className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition ${active ? 'bg-parochia-goldLight/45' : 'hover:bg-slate-50'}`}>
          <span className="grid h-8 w-8 place-items-center rounded-md bg-slate-100 text-parochia-navy">{context.type === 'parish' ? <Building2 size={16} /> : <Church size={16} />}</span>
          <span className="min-w-0 flex-1"><span className="block truncate font-medium">{context.name}</span><span className="text-xs text-parochia-muted">{context.type === 'parish' ? 'Consolidado paroquial' : 'Dados da igreja'}</span></span>
          {active && <Check size={16} className="text-parochia-gold" />}
        </button>;
      })}</div>
    </div>}
  </div>;
}

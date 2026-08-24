import { FormEvent, useState } from 'react';
import { AxiosError } from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Save } from 'lucide-react';
import { createChurch, getChurches, getParish, updateChurch } from '../../api/resources';
import { Field, SelectField, TextAreaField } from '../../components/ui/FormControls';
import { Panel } from '../../components/ui/Panel';
import type { Church } from '../../types/api';

const empty = { name: '', status: 'ACTIVE', city: '', state: '', phone: '', email: '', responsible_name: '', description: '', address: '', number: '', district: '', zip_code: '', notes: '' };

function apiError(error: unknown): string {
  const axiosError = error as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;
  const errors = axiosError.response?.data?.errors;
  if (errors) return Object.values(errors).flat()[0] ?? 'Nao foi possivel salvar.';
  return axiosError.response?.data?.message ?? 'Nao foi possivel salvar a igreja.';
}

export function ChurchesPage() {
  const qc = useQueryClient();
  const churches = useQuery({ queryKey: ['churches'], queryFn: getChurches });
  const parish = useQuery({ queryKey: ['parish'], queryFn: getParish });
  const [selected, setSelected] = useState<Church | null>(null);
  const [form, setForm] = useState<Record<string, string>>(empty);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const mutation = useMutation({
    mutationFn: async () => selected ? updateChurch(selected.id, form) : createChurch({ ...form, parish_id: parish.data?.id }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['churches'] }); qc.invalidateQueries({ queryKey: ['contexts'] }); setSelected(null); setForm(empty); setFeedback({ type: 'success', message: 'Igreja salva com sucesso.' }); },
    onError: (error) => setFeedback({ type: 'error', message: apiError(error) }),
  });
  function edit(church: Church) { setFeedback(null); setSelected(church); setForm({ ...empty, ...Object.fromEntries(Object.entries(church).map(([k, v]) => [k, v === null ? '' : String(v)])) }); }
  function submit(e: FormEvent) { e.preventDefault(); setFeedback(null); mutation.mutate(); }
  function startNew() { setSelected(null); setForm(empty); setFeedback(null); }

  return <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
    <Panel title="Igrejas e comunidades" action={<button onClick={startNew} className="flex h-9 items-center gap-2 rounded-md bg-parochia-navy px-3 text-sm text-white"><Plus size={16}/>Nova</button>}>
      {churches.isLoading ? <p className="text-sm text-parochia-muted">Carregando igrejas...</p> : <div className="overflow-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="text-parochia-muted"><tr><th className="py-2">Nome</th><th>Cidade</th><th>Responsavel</th><th>Status</th></tr></thead><tbody>{churches.data?.map((church) => <tr key={church.id} onClick={() => edit(church)} className="cursor-pointer border-t border-slate-100 hover:bg-slate-50"><td className="py-3 font-medium text-parochia-navy">{church.name}</td><td>{church.city ?? '-'}</td><td>{church.responsible_name ?? '-'}</td><td>{church.status === 'ACTIVE' ? 'Ativa' : 'Inativa'}</td></tr>)}</tbody></table>{churches.data?.length === 0 && <p className="rounded-md bg-slate-50 px-3 py-8 text-center text-sm text-parochia-muted">Nenhuma igreja cadastrada.</p>}</div>}
    </Panel>
    <Panel title={selected ? 'Editar igreja' : 'Nova igreja'}>
      <form onSubmit={submit} className="grid gap-3">
        {feedback && <p className={`rounded-md px-3 py-2 text-sm ${feedback.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{feedback.message}</p>}
        <Field label="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <div className="grid grid-cols-2 gap-3"><Field label="Cidade" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /><Field label="UF" maxLength={2} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase() })} /></div>
        <Field label="Responsavel" value={form.responsible_name} onChange={(e) => setForm({ ...form, responsible_name: e.target.value })} />
        <div className="grid grid-cols-2 gap-3"><Field label="Telefone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /><Field label="E-mail" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        <Field label="Endereco" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        <div className="grid grid-cols-3 gap-3"><Field label="Numero" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} /><Field label="Bairro" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} /><Field label="CEP" value={form.zip_code} onChange={(e) => setForm({ ...form, zip_code: e.target.value })} /></div>
        <TextAreaField label="Descricao" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <SelectField label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="ACTIVE">Ativa</option><option value="DISABLED">Inativa</option></SelectField>
        <button disabled={mutation.isPending || parish.isLoading} className="flex h-10 items-center justify-center gap-2 rounded-md bg-parochia-navy text-sm font-semibold text-white disabled:opacity-60"><Save size={16}/>{mutation.isPending ? 'Salvando...' : 'Salvar'}</button>
      </form>
    </Panel>
  </div>;
}

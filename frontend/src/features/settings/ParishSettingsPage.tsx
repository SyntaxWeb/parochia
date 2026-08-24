import { FormEvent, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Palette, Plus, Save, Settings, SlidersHorizontal } from 'lucide-react';
import { createEventCategory, getAllEventCategories, getParish, updateEventCategory, updateParish } from '../../api/resources';
import { Field, SelectField, TextAreaField } from '../../components/ui/FormControls';
import { Panel } from '../../components/ui/Panel';
import type { EventCategory } from '../../types/api';

const defaultCategory = { name: '', color: '#1E4A8A', is_active: true };
const colorOptions = ['#0F2D54', '#1E4A8A', '#D4AF37', '#F5D78E', '#94A3B8', '#16A34A', '#7C3AED', '#EA580C'];
const systemDefaults = ['Missa', 'Batizado', 'Casamento', 'Confissao', 'Catequese', 'Reuniao', 'Formacao', 'Festa'];

type Tab = 'paroquia' | 'agenda' | 'padroes';

type CategoryForm = { id?: number; name: string; color: string; is_active: boolean };

function statusText(isPending: boolean, isSuccess: boolean) {
  if (isPending) return 'Salvando...';
  if (isSuccess) return 'Salvo';
  return 'Salvar';
}

export function ParishSettingsPage() {
  const qc = useQueryClient();
  const parish = useQuery({ queryKey: ['parish'], queryFn: getParish });
  const categories = useQuery({ queryKey: ['event-categories', 'all'], queryFn: getAllEventCategories });
  const [tab, setTab] = useState<Tab>('paroquia');
  const [form, setForm] = useState<Record<string, string>>({});
  const [categoryForm, setCategoryForm] = useState<CategoryForm>(defaultCategory);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (parish.data) setForm(Object.fromEntries(Object.entries(parish.data).map(([k, v]) => [k, v === null || v === undefined ? '' : String(v)])));
  }, [parish.data]);

  const parishMutation = useMutation({
    mutationFn: () => updateParish(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['parish'] });
      qc.invalidateQueries({ queryKey: ['contexts'] });
    },
  });

  const categoryMutation = useMutation({
    mutationFn: () => categoryForm.id ? updateEventCategory(categoryForm.id, categoryForm) : createEventCategory(categoryForm),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['event-categories'] });
      setCategoryForm(defaultCategory);
      setFeedback('Categoria salva com sucesso.');
    },
    onError: () => setFeedback('Nao foi possivel salvar a categoria.'),
  });

  function submitParish(e: FormEvent) {
    e.preventDefault();
    parishMutation.mutate();
  }

  function submitCategory(e: FormEvent) {
    e.preventDefault();
    setFeedback(null);
    categoryMutation.mutate();
  }

  function editCategory(category: EventCategory) {
    setFeedback(null);
    setCategoryForm({ id: category.id, name: category.name, color: category.color, is_active: category.is_active });
  }

  function addDefault(name: string) {
    setFeedback(null);
    setCategoryForm({ ...defaultCategory, name });
  }

  const activeCategories = categories.data?.filter((category) => category.is_active).length ?? 0;

  return <div className="space-y-5">
    <section className="grid gap-3 lg:grid-cols-3">
      <button onClick={() => setTab('paroquia')} className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left ${tab === 'paroquia' ? 'border-parochia-gold bg-white shadow-sm' : 'border-slate-200 bg-slate-50'}`}>
        <Settings size={18} className="text-parochia-gold" />
        <span><strong className="block text-sm text-parochia-navy">Paroquia</strong><span className="text-xs text-parochia-muted">Dados institucionais</span></span>
      </button>
      <button onClick={() => setTab('agenda')} className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left ${tab === 'agenda' ? 'border-parochia-gold bg-white shadow-sm' : 'border-slate-200 bg-slate-50'}`}>
        <SlidersHorizontal size={18} className="text-parochia-gold" />
        <span><strong className="block text-sm text-parochia-navy">Agenda</strong><span className="text-xs text-parochia-muted">Parametros operacionais</span></span>
      </button>
      <button onClick={() => setTab('padroes')} className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left ${tab === 'padroes' ? 'border-parochia-gold bg-white shadow-sm' : 'border-slate-200 bg-slate-50'}`}>
        <Palette size={18} className="text-parochia-gold" />
        <span><strong className="block text-sm text-parochia-navy">Itens padrao</strong><span className="text-xs text-parochia-muted">{activeCategories} categorias ativas</span></span>
      </button>
    </section>

    {tab === 'paroquia' && <form onSubmit={submitParish} className="grid gap-5 xl:grid-cols-[1fr_1fr]">
      <Panel title="Identificacao">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nome" value={form.name ?? ''} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Field label="CNPJ" value={form.cnpj ?? ''} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} />
          <Field label="Telefone" value={form.phone ?? ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Field label="E-mail" type="email" value={form.email ?? ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Field label="Paroco" value={form.priest_name ?? ''} onChange={(e) => setForm({ ...form, priest_name: e.target.value })} />
          <SelectField label="Status" value={form.status ?? 'ACTIVE'} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="ACTIVE">Ativa</option><option value="DISABLED">Inativa</option></SelectField>
          <div className="md:col-span-2"><TextAreaField label="Observacoes" value={form.notes ?? ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
        </div>
      </Panel>
      <Panel title="Endereco e contato">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Endereco" value={form.address ?? ''} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <Field label="Numero" value={form.number ?? ''} onChange={(e) => setForm({ ...form, number: e.target.value })} />
          <Field label="Complemento" value={form.complement ?? ''} onChange={(e) => setForm({ ...form, complement: e.target.value })} />
          <Field label="Bairro" value={form.district ?? ''} onChange={(e) => setForm({ ...form, district: e.target.value })} />
          <Field label="Cidade" value={form.city ?? ''} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <Field label="UF" maxLength={2} value={form.state ?? ''} onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase() })} />
          <Field label="CEP" value={form.zip_code ?? ''} onChange={(e) => setForm({ ...form, zip_code: e.target.value })} />
        </div>
      </Panel>
      <button disabled={parishMutation.isPending} className="flex h-10 items-center justify-center gap-2 rounded-md bg-parochia-navy px-4 text-sm font-semibold text-white xl:col-span-2"><Save size={16}/>{statusText(parishMutation.isPending, parishMutation.isSuccess)}</button>
    </form>}

    {tab === 'agenda' && <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
      <Panel title="Parametros da agenda">
        <div className="grid gap-4 md:grid-cols-2">
          <SelectField label="Visualizacao inicial" value="month" onChange={() => undefined}><option value="month">Mes</option><option value="week">Semana</option><option value="day">Dia</option></SelectField>
          <SelectField label="Padrao de novos eventos" value="IGREJA" onChange={() => undefined}><option value="IGREJA">Igreja</option><option value="PAROQUIAL">Paroquial</option></SelectField>
          <Field label="Antecedencia padrao do lembrete" value="1440 minutos" disabled />
          <Field label="Cor institucional principal" value="#0F2D54" disabled />
        </div>
      </Panel>
      <Panel title="Resumo">
        <div className="grid gap-3 text-sm text-parochia-navy">
          <div className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2"><span>Categorias ativas</span><strong>{activeCategories}</strong></div>
          <div className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2"><span>Padroes sugeridos</span><strong>{systemDefaults.length}</strong></div>
          <p className="text-parochia-muted">Os parametros editaveis da agenda serao ampliados conforme os proximos modulos forem conectados.</p>
        </div>
      </Panel>
    </section>}

    {tab === 'padroes' && <section className="grid gap-5 xl:grid-cols-[1fr_420px]">
      <Panel title="Categorias da agenda" action={<button onClick={() => setCategoryForm(defaultCategory)} className="flex h-9 items-center gap-2 rounded-md bg-parochia-navy px-3 text-sm text-white"><Plus size={16}/>Nova</button>}>
        <div className="overflow-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="text-parochia-muted"><tr><th className="py-2">Categoria</th><th>Cor</th><th>Status</th></tr></thead>
            <tbody>{categories.data?.map((category) => <tr key={category.id} onClick={() => editCategory(category)} className="cursor-pointer border-t border-slate-100 hover:bg-slate-50"><td className="py-3 font-medium text-parochia-navy">{category.name}</td><td><span className="inline-flex items-center gap-2"><span className="h-4 w-4 rounded border border-slate-200" style={{ backgroundColor: category.color }} />{category.color}</span></td><td>{category.is_active ? 'Ativa' : 'Inativa'}</td></tr>)}</tbody>
          </table>
        </div>
      </Panel>
      <Panel title={categoryForm.id ? 'Editar categoria' : 'Nova categoria'}>
        <form onSubmit={submitCategory} className="grid gap-4">
          {feedback && <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{feedback}</p>}
          <Field label="Nome" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} required />
          <div>
            <Field label="Cor" value={categoryForm.color} onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })} required />
            <div className="mt-2 flex flex-wrap gap-2">{colorOptions.map((color) => <button key={color} type="button" title={color} onClick={() => setCategoryForm({ ...categoryForm, color })} className="h-8 w-8 rounded-md border border-slate-200" style={{ backgroundColor: color }} />)}</div>
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-parochia-navy"><input type="checkbox" checked={categoryForm.is_active} onChange={(e) => setCategoryForm({ ...categoryForm, is_active: e.target.checked })}/>Categoria ativa</label>
          <button disabled={categoryMutation.isPending} className="flex h-10 items-center justify-center gap-2 rounded-md bg-parochia-navy text-sm font-semibold text-white"><Save size={16}/>{categoryMutation.isPending ? 'Salvando...' : 'Salvar categoria'}</button>
        </form>
        <div className="mt-5 border-t border-slate-100 pt-4">
          <p className="mb-2 text-sm font-medium text-parochia-navy">Sugestoes padrao</p>
          <div className="flex flex-wrap gap-2">{systemDefaults.map((name) => <button key={name} type="button" onClick={() => addDefault(name)} className="inline-flex h-8 items-center gap-1 rounded-md border border-parochia-gold/40 px-2 text-xs text-parochia-navy"><CheckCircle2 size={13}/>{name}</button>)}</div>
        </div>
      </Panel>
    </section>}
  </div>;
}

import { useQuery } from '@tanstack/react-query';
import { getPermissions, getRoles } from '../../api/resources';
import { Panel } from '../../components/ui/Panel';

export function RolesPage() {
  const roles = useQuery({ queryKey: ['roles'], queryFn: getRoles });
  const permissions = useQuery({ queryKey: ['permissions'], queryFn: getPermissions });
  return <div className="grid gap-5 xl:grid-cols-[1fr_360px]"><Panel title="Perfis"><div className="grid gap-3">{roles.data?.map((role) => <article key={role.id} className="rounded-md border border-slate-200 p-3"><h4 className="font-medium text-parochia-navy">{role.name}</h4><p className="text-xs text-parochia-muted">{role.slug}</p><div className="mt-3 flex flex-wrap gap-2">{role.permissions?.map((permission) => <span key={permission.id} className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">{permission.name}</span>)}</div></article>)}</div></Panel><Panel title="Permissoes disponiveis"><div className="flex flex-wrap gap-2">{permissions.data?.map((permission) => <span key={permission.id} className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700">{permission.name}</span>)}</div></Panel></div>;
}

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Building, FolderTree, Pencil, Plus } from 'lucide-react';
import { api, apiErrorMessage, unwrap } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Card, CardBody } from '../../components/ui/Card.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Skeleton } from '../../components/ui/Feedback.jsx';
import { Input, Textarea } from '../../components/ui/Field.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Tabs } from '../../components/ui/Tabs.jsx';

export default function AdminCatalog() {
  const [tab, setTab] = useState('categories');
  const [editing, setEditing] = useState(null);

  const { data: categories } = useQuery({
  queryKey: ['admin-categories'],
  queryFn: async () => unwrap(await api.get('/admin/categories')),
  });
  const { data: cities } = useQuery({
  queryKey: ['admin-cities'],
  queryFn: async () => unwrap(await api.get('/admin/cities')),
  });

  const catList = categories || [];
  const cityList = cities || [];

  return (
  <div className="space-y-6">
  <div className="flex flex-wrap items-center justify-between gap-3">
  <div>
  <h2 className="font-fraunces text-h2 text-text-primary">Catalog</h2>
  <p className="text-body-sm text-text-tertiary">Categories, filters and cities shown across the site.</p>
  </div>
  <Button onClick={() => setEditing({ kind: tab === 'categories' ? 'category' : 'city' })}>
  <Plus className="h-4 w-4" /> New {tab === 'categories' ? 'category' : 'city'}
  </Button>
  </div>

  <Tabs
  tabs={[
  { key: 'categories', label: `Categories (${catList.length})` },
  { key: 'cities', label: `Cities (${cityList.length})` },
  ]}
  value={tab}
  onChange={setTab}
  />

  {tab === 'categories' ? (
  !categories ? (
  <Skeleton className="h-40" />
  ) : (
  <div className="space-y-2">
  {catList.map((c) => (
  <Card key={c._id}>
  <CardBody>
  <div className="flex flex-wrap items-center justify-between gap-3">
  <div className="flex items-center gap-3">
  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400">
  <FolderTree className="h-5 w-5" />
  </span>
  <div>
  <div className="flex items-center gap-2">
  <p className="font-geist text-body-lg font-semibold text-text-primary">{c.name}</p>
  {c.isActive === false && <Badge tone="error">inactive</Badge>}
  </div>
  <p className="text-micro text-text-tertiary">
  /{c.slug} · {c.subcategories?.length || 0} subcategories · {c.filters?.length || 0} filters
  </p>
  </div>
  </div>
  <Button variant="ghost" size="sm" onClick={() => setEditing({ kind: 'category', item: c })}>
  <Pencil className="h-4 w-4" /> Edit
  </Button>
  </div>
  </CardBody>
  </Card>
  ))}
  </div>
  )
  ) : !cities ? (
  <Skeleton className="h-40" />
  ) : (
  <div className="space-y-2">
  {cityList.map((c) => (
  <Card key={c._id}>
  <CardBody>
  <div className="flex flex-wrap items-center justify-between gap-3">
  <div className="flex items-center gap-3">
  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-100 text-accent-600 dark:bg-accent-500/15 dark:text-accent-500">
  <Building className="h-5 w-5" />
  </span>
  <div>
  <div className="flex items-center gap-2">
  <p className="font-geist text-body-lg font-semibold text-text-primary">{c.displayName}</p>
  {c.isActive === false && <Badge tone="error">inactive</Badge>}
  </div>
  <p className="text-micro text-text-tertiary">
  /{c.slug} · {c.areas?.length || 0} areas
  </p>
  </div>
  </div>
  <Button variant="ghost" size="sm" onClick={() => setEditing({ kind: 'city', item: c })}>
  <Pencil className="h-4 w-4" /> Edit
  </Button>
  </div>
  </CardBody>
  </Card>
  ))}
  </div>
  )}

  {editing && (
  <CatalogModal
  kind={editing.kind}
  item={editing.item || null}
  onClose={() => setEditing(null)}
  />
  )}
  </div>
  );
}

function CatalogModal({ kind, item, onClose }) {
  const toast = useToast();
  const qc = useQueryClient();
  const [form, setForm] = useState(() =>
  kind === 'category'
  ? {
  name: item?.name || '',
  slug: item?.slug || '',
  description: item?.description || '',
  icon: item?.icon || '',
  sortOrder: item?.sortOrder ?? 0,
  isActive: item?.isActive ?? true,
  subcategories: item?.subcategories?.map((s) => s.name).join(', ') || '',
  filters: item?.filters?.length ? JSON.stringify(item.filters) : '',
  }
  : {
  name: item?.name || '',
  slug: item?.slug || '',
  displayName: item?.displayName || '',
  areas: item?.areas?.map((a) => a.name).join(', ') || '',
  sortOrder: item?.sortOrder ?? 0,
  isActive: item?.isActive ?? true,
  }
  );

  const save = useMutation({
  mutationFn: async () => {
  const payload =
  kind === 'category'
  ? {
  name: form.name,
  slug: form.slug || undefined,
  description: form.description || undefined,
  icon: form.icon || undefined,
  sortOrder: Number(form.sortOrder) || 0,
  isActive: form.isActive,
  subcategories: form.subcategories
  ? form.subcategories.split(',').map((s) => s.trim()).filter(Boolean).map((name) => ({
  name,
  slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
  }))
  : [],
  filters: form.filters ? JSON.parse(form.filters) : [],
  }
  : {
  name: form.name,
  slug: form.slug || undefined,
  displayName: form.displayName,
  areas: form.areas ? form.areas.split(',').map((s) => s.trim()).filter(Boolean) : [],
  sortOrder: Number(form.sortOrder) || 0,
  isActive: form.isActive,
  };
  return unwrap(await api.post(`/admin/${kind === 'category' ? 'categories' : 'cities'}`, payload));
  },
  onSuccess: () => {
  toast.success(`${kind === 'category' ? 'Category' : 'City'} saved`);
  onClose();
  qc.invalidateQueries({ queryKey: ['admin-categories'] });
  qc.invalidateQueries({ queryKey: ['admin-cities'] });
  qc.invalidateQueries({ queryKey: ['categories'] });
  qc.invalidateQueries({ queryKey: ['cities'] });
  },
  onError: (e) => {
  toast.error(apiErrorMessage(e));
  if (form.filters) {
  try {
  JSON.parse(form.filters);
  } catch {
  toast.error('Filters must be valid JSON');
  }
  }
  },
  });

  return (
  <Modal open onClose={onClose} title={`${item ? 'Edit' : 'New'} ${kind === 'category' ? 'category' : 'city'}`}>
  <div className="space-y-4">
  {kind === 'category' ? (
  <>
  <div className="grid grid-cols-2 gap-3">
  <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Catering" />
  <Input label="Slug (optional)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto from name" />
  </div>
  <Textarea label="Description" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
  <div className="grid grid-cols-2 gap-3">
  <Input label="Icon (emoji or name)" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="e.g. " />
  <Input label="Sort order" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
  </div>
  <Input label="Subcategories (comma separated)" value={form.subcategories} onChange={(e) => setForm({ ...form, subcategories: e.target.value })} placeholder="e.g. BBQ, Desi, Chinese" />
  <Textarea label="Filters (JSON, optional)" rows={3} value={form.filters} onChange={(e) => setForm({ ...form, filters: e.target.value })} placeholder='[{"key":"minPrice","label":"Min price","type":"number"}]' />
  </>
  ) : (
  <>
  <div className="grid grid-cols-2 gap-3">
  <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Sukkur" />
  <Input label="Slug (optional)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto from name" />
  </div>
  <Input label="Display name" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} placeholder="e.g. Sukkur, Sindh" />
  <Input label="Areas (comma separated)" value={form.areas} onChange={(e) => setForm({ ...form, areas: e.target.value })} placeholder="e.g. City Centre, Air Port Road" />
  <Input label="Sort order" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
  </>
  )}
  <label className="flex items-center gap-2 text-body-sm text-text-secondary">
  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4 accent-primary-600" />
  Active
  </label>
  <div className="flex justify-end gap-2">
  <Button variant="ghost" onClick={onClose}>Cancel</Button>
  <Button loading={save.isPending} disabled={!form.name.trim()} onClick={() => save.mutate()}>Save</Button>
  </div>
  </div>
  </Modal>
  );
}
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { api, apiErrorMessage, unwrap } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Card, CardBody } from '../../components/ui/Card.jsx';
import { EmptyState, Skeleton } from '../../components/ui/Feedback.jsx';
import { Input, Select, Textarea } from '../../components/ui/Field.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { formatPrice } from '../../lib/utils.js';

const packageSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be ≥ 0'),
  priceType: z.enum(['fixed', 'per_person']),
  inclusions: z.string().optional(),
});

export default function SellerPackages() {
  const toast = useToast();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null);

  const { data: me } = useQuery({
  queryKey: ['seller-me'],
  queryFn: async () => unwrap(await api.get('/sellers/dashboard')),
  });
  const sellerId = me?.profile?._id;

  const { data, isLoading } = useQuery({
  queryKey: ['packages', sellerId],
  queryFn: async () => unwrap(await api.get(`/sellers/${sellerId}/packages`)),
  enabled: !!sellerId,
  });
  const packages = data?.packages || data?.data || [];

  const remove = useMutation({
  mutationFn: async (id) => unwrap(await api.delete(`/services/packages/${id}`)),
  onSuccess: () => {
  toast.success('Package deleted');
  qc.invalidateQueries({ queryKey: ['packages'] });
  },
  onError: (e) => toast.error(apiErrorMessage(e)),
  });

  return (
  <div className="space-y-6">
  <div className="flex flex-wrap items-center justify-between gap-3">
  <div>
  <h2 className="font-fraunces text-h2 text-text-primary">Packages</h2>
  <p className="text-body-sm text-text-tertiary">Bundle your services into irresistible packages.</p>
  </div>
  <Button variant="gold" onClick={() => setEditing({})}><Plus className="h-4 w-4" /> Add package</Button>
  </div>

  {isLoading ? (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  <Skeleton className="h-44" />
  <Skeleton className="h-44" />
  </div>
  ) : packages.length === 0 ? (
  <EmptyState icon={Plus} title="No packages yet" description="Create packages to make booking easier for couples." />
  ) : (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {packages.map((p) => (
  <Card key={p._id} className="relative overflow-hidden">
  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-600 to-accent-500" />
  <CardBody>
  <div className="flex items-start justify-between">
  <h3 className="font-geist text-body-lg font-semibold text-text-primary">{p.name}</h3>
  <div className="flex gap-1">
  <Button variant="ghost" size="sm" onClick={() => setEditing(p)}><Pencil className="h-4 w-4" /></Button>
  <Button variant="ghost" size="sm" className="text-error" loading={remove.isPending} onClick={() => remove.mutate(p._id)}><Trash2 className="h-4 w-4" /></Button>
  </div>
  </div>
  <p className="mt-1 font-geist text-h4 font-semibold text-accent-600 dark:text-accent-500">
  {formatPrice(p.price)} <span className="text-micro font-normal text-text-tertiary">{p.priceType === 'fixed' ? 'per event' : 'per person'}</span>
  </p>
  {p.description && <p className="mt-2 line-clamp-3 text-body-sm text-text-secondary">{p.description}</p>}
  {p.inclusions?.length > 0 && (
  <div className="mt-3 flex flex-wrap gap-1">
  {p.inclusions.slice(0, 4).map((inc) => (
  <span key={inc} className="rounded-full bg-primary-50 px-2 py-0.5 text-micro text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
  {inc}
  </span>
  ))}
  {p.inclusions.length > 4 && (
  <span className="rounded-full bg-surface-sunken px-2 py-0.5 text-micro text-text-tertiary">+{p.inclusions.length - 4} more</span>
  )}
  </div>
  )}
  </CardBody>
  </Card>
  ))}
  </div>
  )}

  {editing && <PackageModal pkg={editing._id ? editing : null} onClose={() => setEditing(null)} />}
  </div>
  );
}

function PackageModal({ pkg, onClose }) {
  const toast = useToast();
  const qc = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(packageSchema),
  defaultValues: pkg || { priceType: 'fixed', price: 0 },
  });

  const save = useMutation({
  mutationFn: async (values) => {
  const payload = {
  ...values,
  description: values.description || undefined,
  inclusions: values.inclusions ? values.inclusions.split(',').map((s) => s.trim()).filter(Boolean) : [],
  };
  return pkg
  ? unwrap(await api.put(`/services/packages/${pkg._id}`, payload))
  : unwrap(await api.post('/services/packages', payload));
  },
  onSuccess: () => {
  toast.success(pkg ? 'Package updated' : 'Package added');
  onClose();
  qc.invalidateQueries({ queryKey: ['packages'] });
  },
  onError: (e) => toast.error(apiErrorMessage(e)),
  });

  return (
  <Modal open onClose={onClose} title={pkg ? 'Edit package' : 'Add package'}>
  <form onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-4">
  <Input label="Name" placeholder="e.g. Royal Wedding Package" error={errors.name?.message} {...register('name')} />
  <Textarea label="Description" rows={3} placeholder="What does the couple get…" error={errors.description?.message} {...register('description')} />
  <div className="grid grid-cols-2 gap-3">
  <Input label="Price (PKR)" type="number" min="0" error={errors.price?.message} {...register('price')} />
  <Select label="Price type" error={errors.priceType?.message} {...register('priceType')}>
  <option value="fixed">Per event</option>
  <option value="per_person">Per person</option>
  </Select>
  </div>
  <Input label="Inclusions (comma separated)" placeholder="Venue setup, DJ, Catering…" error={errors.inclusions?.message} {...register('inclusions')} />
  <div className="flex justify-end gap-2">
  <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
  <Button type="submit" loading={save.isPending}>{pkg ? 'Save changes' : 'Add package'}</Button>
  </div>
  </form>
  </Modal>
  );
}
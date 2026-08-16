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

const serviceSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be ≥ 0'),
  priceType: z.enum(['fixed', 'per_person', 'per_hour', 'per_day']),
  capacity: z.coerce.number().min(0).optional(),
  duration: z.coerce.number().min(0).optional(),
  inclusions: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
});

export default function SellerServices() {
  const toast = useToast();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null);

  const { data: me } = useQuery({
  queryKey: ['seller-me'],
  queryFn: async () => unwrap(await api.get('/sellers/dashboard')),
  });
  const sellerId = me?.profile?._id;

  const { data, isLoading } = useQuery({
  queryKey: ['services', sellerId],
  queryFn: async () => unwrap(await api.get(`/sellers/${sellerId}/services`)),
  enabled: !!sellerId,
  });
  const services = data?.services || data?.data || [];

  const remove = useMutation({
  mutationFn: async (id) => unwrap(await api.delete(`/services/services/${id}`)),
  onSuccess: () => {
  toast.success('Service deleted');
  qc.invalidateQueries({ queryKey: ['services'] });
  },
  onError: (e) => toast.error(apiErrorMessage(e)),
  });

  return (
  <div className="space-y-6">
  <div className="flex flex-wrap items-center justify-between gap-3">
  <div>
  <h2 className="font-fraunces text-h2 text-text-primary">Services</h2>
  <p className="text-body-sm text-text-tertiary">What couples can book from you.</p>
  </div>
  <Button onClick={() => setEditing({})}><Plus className="h-4 w-4" /> Add service</Button>
  </div>

  {isLoading ? (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  <Skeleton className="h-40" />
  <Skeleton className="h-40" />
  <Skeleton className="h-40" />
  </div>
  ) : services.length === 0 ? (
  <EmptyState icon={Plus} title="No services yet" description="Add your first service to appear on your public profile." />
  ) : (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {services.map((s) => (
  <Card key={s._id}>
  <CardBody>
  <h3 className="font-geist text-body-lg font-semibold text-text-primary">{s.name}</h3>
  <p className="mt-1 text-body-sm text-text-tertiary">{s.category}{s.duration ? ` · ${s.duration} hrs` : ''}{s.capacity ? ` · up to ${s.capacity}` : ''}</p>
  {s.description && <p className="mt-2 line-clamp-2 text-body-sm text-text-secondary">{s.description}</p>}
  <div className="mt-3 flex items-center justify-between">
  <p className="font-geist text-h4 font-semibold text-primary-600 dark:text-primary-400">
  {formatPrice(s.price)} <span className="text-micro font-normal text-text-tertiary">{s.priceType.replace('_', ' ')}</span>
  </p>
  <div className="flex gap-1">
  <Button variant="ghost" size="sm" onClick={() => setEditing(s)}><Pencil className="h-4 w-4" /></Button>
  <Button variant="ghost" size="sm" className="text-error" loading={remove.isPending} onClick={() => remove.mutate(s._id)}><Trash2 className="h-4 w-4" /></Button>
  </div>
  </div>
  </CardBody>
  </Card>
  ))}
  </div>
  )}

  {editing && <ServiceModal service={editing._id ? editing : null} onClose={() => setEditing(null)} />}
  </div>
  );
}

function ServiceModal({ service, onClose }) {
  const toast = useToast();
  const qc = useQueryClient();
  const { data: categories } = useQuery({
  queryKey: ['categories'],
  queryFn: async () => unwrap(await api.get('/search/categories')),
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(serviceSchema),
  defaultValues: service || { priceType: 'fixed', category: '', price: 0 },
  });

  const save = useMutation({
  mutationFn: async (values) => {
  const payload = {
  ...values,
  description: values.description || undefined,
  capacity: values.capacity || undefined,
  duration: values.duration || undefined,
  inclusions: values.inclusions ? values.inclusions.split(',').map((s) => s.trim()).filter(Boolean) : [],
  };
  return service
  ? unwrap(await api.put(`/services/services/${service._id}`, payload))
  : unwrap(await api.post('/services/services', payload));
  },
  onSuccess: () => {
  toast.success(service ? 'Service updated' : 'Service added');
  onClose();
  qc.invalidateQueries({ queryKey: ['services'] });
  },
  onError: (e) => toast.error(apiErrorMessage(e)),
  });

  return (
  <Modal open onClose={onClose} title={service ? 'Edit service' : 'Add service'}>
  <form onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-4">
  <Input label="Name" placeholder="e.g. Full buffet service" error={errors.name?.message} {...register('name')} />
  <Textarea label="Description" rows={3} placeholder="What's included…" error={errors.description?.message} {...register('description')} />
  <div className="grid grid-cols-2 gap-3">
  <Input label="Price (PKR)" type="number" min="0" error={errors.price?.message} {...register('price')} />
  <Select label="Price type" error={errors.priceType?.message} {...register('priceType')}>
  <option value="fixed">Fixed</option>
  <option value="per_person">Per person</option>
  <option value="per_hour">Per hour</option>
  <option value="per_day">Per day</option>
  </Select>
  <Select label="Category" error={errors.category?.message} {...register('category')}>
  <option value="">Select…</option>
  {(categories || []).map((c) => (
  <option key={c._id} value={c.name}>{c.name}</option>
  ))}
  </Select>
  <Input label="Capacity (optional)" type="number" min="0" error={errors.capacity?.message} {...register('capacity')} />
  </div>
  <div className="grid grid-cols-2 gap-3">
  <Input label="Duration hours (optional)" type="number" min="0" error={errors.duration?.message} {...register('duration')} />
  <Input label="Inclusions (comma separated)" error={errors.inclusions?.message} {...register('inclusions')} />
  </div>
  <div className="flex justify-end gap-2">
  <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
  <Button type="submit" loading={save.isPending}>{service ? 'Save changes' : 'Add service'}</Button>
  </div>
  </form>
  </Modal>
  );
}
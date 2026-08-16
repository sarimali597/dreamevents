import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarPlus, Plus, Trash2 } from 'lucide-react';
import { api, apiErrorMessage, unwrap } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Card, CardBody } from '../../components/ui/Card.jsx';
import { EmptyState, Skeleton } from '../../components/ui/Feedback.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Input, Select, Textarea } from '../../components/ui/Field.jsx';
import { StatusBadge } from '../../components/ui/Badge.jsx';
import { formatDate } from '../../lib/utils.js';

const schema = z.object({
  name: z.string().min(2, 'Give your event a name'),
  eventType: z.enum(['wedding', 'mehndi', 'engagement', 'birthday', 'corporate', 'family', 'other']),
  eventDate: z.string().min(1, 'Pick a date'),
  venue: z.string().max(200).optional(),
  guestCount: z.coerce.number().min(1).optional().or(z.literal('')),
  notes: z.string().max(1000).optional(),
});

export default function MyEvents() {
  const toast = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data: events, isLoading } = useQuery({
  queryKey: ['events'],
  queryFn: async () => unwrap(await api.get('/events')),
  });

  const saveMutation = useMutation({
  mutationFn: async (values) => {
  const payload = { ...values, guestCount: values.guestCount ? Number(values.guestCount) : undefined };
  if (editing) return unwrap(await api.put(`/events/${editing._id}`, payload));
  return unwrap(await api.post('/events', payload));
  },
  onSuccess: () => {
  toast.success(editing ? 'Event updated' : 'Event created');
  setOpen(false);
  setEditing(null);
  qc.invalidateQueries({ queryKey: ['events'] });
  },
  onError: (e) => toast.error(apiErrorMessage(e)),
  });

  const deleteMutation = useMutation({
  mutationFn: async (id) => unwrap(await api.delete(`/events/${id}`)),
  onSuccess: () => {
  toast.success('Event deleted');
  qc.invalidateQueries({ queryKey: ['events'] });
  },
  onError: (e) => toast.error(apiErrorMessage(e)),
  });

  const {
  register,
  handleSubmit,
  reset,
  formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const openModal = (event) => {
  setEditing(event);
  reset(
  event
  ? {
  name: event.name,
  eventType: event.eventType,
  eventDate: new Date(event.eventDate).toISOString().slice(0, 10),
  venue: event.venue || '',
  guestCount: event.guestCount || '',
  notes: event.notes || '',
  }
  : { eventType: 'wedding' }
  );
  setOpen(true);
  };

  const list = events || [];

  return (
  <div className="space-y-6">
  <div className="flex flex-wrap items-center justify-between gap-3">
  <div>
  <h2 className="font-fraunces text-h2 text-text-primary">My events</h2>
  <p className="text-body-sm text-text-tertiary">Keep your celebrations organised</p>
  </div>
  <Button onClick={() => openModal(null)}>
  <Plus className="h-4 w-4" /> New event
  </Button>
  </div>

  {isLoading ? (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {Array.from({ length: 3 }).map((_, i) => (
  <Skeleton key={i} className="h-40" />
  ))}
  </div>
  ) : list.length === 0 ? (
  <Card>
  <CardBody>
  <EmptyState
  icon={CalendarPlus}
  title="No events yet"
  description="Create your wedding or celebration to keep everything in one place."
  action={<Button onClick={() => openModal(null)}><Plus className="h-4 w-4" /> Create event</Button>}
  />
  </CardBody>
  </Card>
  ) : (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {list.map((e) => (
  <Card key={e._id} hover>
  <CardBody>
  <div className="flex items-start justify-between gap-2">
  <div>
  <h3 className="font-geist text-h4 font-semibold text-text-primary">{e.name}</h3>
  <p className="mt-0.5 text-micro capitalize text-text-tertiary">{e.eventType}</p>
  </div>
  <StatusBadge status={e.status} />
  </div>
  <p className="mt-3 text-body-sm text-text-secondary">{formatDate(e.eventDate)}</p>
  {e.venue && <p className="text-micro text-text-tertiary">{e.venue}</p>}
  {e.guestCount ? <p className="text-micro text-text-tertiary">{e.guestCount} guests</p> : null}
  <div className="mt-4 flex justify-end gap-2 border-t border-border-subtle pt-3">
  <Button variant="ghost" size="sm" onClick={() => openModal(e)}>Edit</Button>
  <Button
  variant="ghost"
  size="sm"
  className="text-error hover:bg-error-light hover:text-error"
  onClick={() => {
  if (window.confirm(`Delete "${e.name}"?`)) deleteMutation.mutate(e._id);
  }}
  >
  <Trash2 className="h-3.5 w-3.5" /> Delete
  </Button>
  </div>
  </CardBody>
  </Card>
  ))}
  </div>
  )}

  <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit event' : 'New event'}>
  <form onSubmit={handleSubmit((v) => saveMutation.mutate(v))} className="space-y-4">
  <Input label="Event name" placeholder="e.g. Ayesha & Hamza's wedding" error={errors.name?.message} {...register('name')} />
  <div className="grid gap-4 sm:grid-cols-2">
  <Select label="Type" error={errors.eventType?.message} {...register('eventType')}>
  {['wedding', 'mehndi', 'engagement', 'birthday', 'corporate', 'family', 'other'].map((t) => (
  <option key={t} value={t} className="capitalize">{t}</option>
  ))}
  </Select>
  <Input label="Date" type="date" min={new Date().toISOString().slice(0, 10)} error={errors.eventDate?.message} {...register('eventDate')} />
  <Input label="Venue (optional)" placeholder="Banquet hall name" error={errors.venue?.message} {...register('venue')} />
  <Input label="Guest count (optional)" type="number" min="1" error={errors.guestCount?.message} {...register('guestCount')} />
  </div>
  <Textarea label="Notes (optional)" error={errors.notes?.message} {...register('notes')} />
  <div className="flex justify-end gap-2">
  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
  <Button type="submit" loading={saveMutation.isPending}>{editing ? 'Save changes' : 'Create event'}</Button>
  </div>
  </form>
  </Modal>
  </div>
  );
}
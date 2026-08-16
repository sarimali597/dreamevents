import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Lock, LockOpen } from 'lucide-react';
import { api, apiErrorMessage, unwrap } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Card, CardBody } from '../../components/ui/Card.jsx';
import { Skeleton } from '../../components/ui/Feedback.jsx';
import { cn, formatDate } from '../../lib/utils.js';

const STATUS_STYLES = {
  available: 'bg-primary-50 text-primary-700 border-primary-200 dark:bg-primary-900/40 dark:text-primary-300',
  pending: 'bg-warning-light text-warning border-warning/40 dark:bg-warning/10 dark:text-warning-300',
  booked: 'bg-error-light text-error border-error/40 dark:bg-error/10 dark:text-error-300',
  blocked: 'bg-surface-sunken text-text-tertiary border-border-subtle line-through',
};

export default function SellerCalendar() {
  const toast = useToast();
  const qc = useQueryClient();
  const [today] = useState(() => new Date());
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [selected, setSelected] = useState([]);

  const { data: me } = useQuery({
  queryKey: ['seller-me'],
  queryFn: async () => unwrap(await api.get('/sellers/dashboard')),
  });
  const sellerId = me?.profile?._id;

  const { data: cal, isLoading } = useQuery({
  queryKey: ['seller-calendar', year, month],
  queryFn: async () => unwrap(await api.get(`/availability/${sellerId}`, { params: { year, month: month + 1 } })),
  enabled: !!sellerId,
  });
  const days = cal?.days || {};

  const toggleSelection = (key) => {
  const status = days[key]?.status;
  if (status === 'pending' || status === 'booked') return;
  setSelected((s) => (s.includes(key) ? s.filter((k) => k !== key) : [...s, key]));
  };

  const save = useMutation({
  mutationFn: async () => {
  const updates = selected.map((key) => {
  const status = days[key]?.status === 'blocked' ? 'available' : 'blocked';
  return { date: key, status };
  });
  if (updates.length === 0) return;
  return unwrap(await api.post(`/availability/${sellerId}`, { updates }));
  },
  onSuccess: () => {
  toast.success('Calendar updated');
  setSelected([]);
  qc.invalidateQueries({ queryKey: ['seller-calendar'] });
  },
  onError: (e) => toast.error(apiErrorMessage(e)),
  });

  const grid = useMemo(() => {
  const first = new Date(year, month, 1);
  const startDow = first.getDay();
  const lastDay = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= lastDay; d++) cells.push(d);
  return cells;
  }, [year, month]);

  const monthLabel = new Date(year, month, 1).toLocaleDateString('en-PK', { month: 'long', year: 'numeric' });
  const shift = (delta) => {
  const d = new Date(year, month + delta, 1);
  setYear(d.getFullYear());
  setMonth(d.getMonth());
  };

  const upcoming = Object.values(days)
  .filter((d) => d.status === 'pending' || d.status === 'booked')
  .sort((a, b) => (a.date < b.date ? -1 : 1));

  return (
  <div className="space-y-6">
  <div>
  <h2 className="font-fraunces text-h2 text-text-primary">Calendar</h2>
  <p className="text-body-sm text-text-tertiary">
  Tap a day to block or unblock it. Requests and confirmed bookings lock their dates automatically.
  </p>
  </div>

  <div className="grid gap-6 lg:grid-cols-3">
  <Card className="lg:col-span-2">
  <CardBody>
  <div className="flex items-center justify-between">
  <h3 className="font-geist text-body-lg font-semibold text-text-primary">{monthLabel}</h3>
  <div className="flex gap-1">
  <Button variant="ghost" size="sm" onClick={() => shift(-1)}><ChevronLeft className="h-4 w-4" /></Button>
  <Button variant="ghost" size="sm" onClick={() => { setMonth(today.getMonth()); setYear(today.getFullYear()); }}>Today</Button>
  <Button variant="ghost" size="sm" onClick={() => shift(1)}><ChevronRight className="h-4 w-4" /></Button>
  </div>
  </div>

  {isLoading ? (
  <Skeleton className="mt-4 h-72" />
  ) : (
  <>
  <div className="mt-4 grid grid-cols-7 gap-1 text-center">
  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
  <span key={d} className="py-1 text-micro font-medium uppercase text-text-tertiary">{d}</span>
  ))}
  </div>
  <div className="mt-1 grid grid-cols-7 gap-1">
  {grid.map((d, i) => {
  if (!d) return <span key={i} />;
  const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const entry = days[key];
  const status = entry?.status || 'available';
  const isSelected = selected.includes(key);
  const isToday = key === today.toISOString().slice(0, 10);
  const locked = status === 'pending' || status === 'booked';
  return (
  <button
  key={key}
  type="button"
  onClick={() => toggleSelection(key)}
  disabled={locked}
  title={locked ? (status === 'pending' ? 'Pending request' : 'Confirmed booking') : entry?.note}
  className={cn(
  'relative flex aspect-square flex-col items-center justify-center rounded-lg border text-body-sm transition-all',
  isSelected ? 'border-primary-600 bg-primary-600 text-white shadow-lg shadow-primary-600/30 scale-105' : STATUS_STYLES[status],
  locked && 'cursor-not-allowed opacity-70',
  !locked && !isSelected && 'hover:scale-105 hover:border-primary-400 cursor-pointer'
  )}
  >
  <span>{d}</span>
  {isToday && <span className="absolute top-1 h-1 w-1 rounded-full bg-current opacity-60" />}
  {isSelected && (status === 'blocked' ? <LockOpen className="h-3 w-3" /> : <Lock className="h-3 w-3" />)}
  </button>
  );
  })}
  </div>
  </>
  )}

  {selected.length > 0 && (
  <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
  <p className="text-body-sm text-text-secondary">
  {selected.length} day{selected.length > 1 ? 's' : ''} selected
  {days[selected[0]]?.status === 'blocked' ? ' — will be opened for booking' : ' — will be blocked'}
  </p>
  <div className="flex gap-2">
  <Button variant="ghost" size="sm" onClick={() => setSelected([])}>Clear</Button>
  <Button size="sm" loading={save.isPending} onClick={() => save.mutate()}>Apply</Button>
  </div>
  </div>
  )}
  </CardBody>
  </Card>

  <Card>
  <CardBody>
  <h3 className="font-geist text-body-lg font-semibold text-text-primary">Locked dates</h3>
  <div className="mt-3 space-y-2">
  {upcoming.length === 0 && (
  <p className="text-body-sm text-text-tertiary">Nothing locked this month.</p>
  )}
  {upcoming.map((d) => (
  <div key={d._id} className="flex items-center justify-between rounded-lg border border-border-subtle px-3 py-2">
  <div>
  <p className="text-body-sm font-medium capitalize text-text-primary">{formatDate(d.date)}</p>
  {d.note && <p className="text-micro text-text-tertiary">{d.note}</p>}
  </div>
  <span className={cn('rounded-full px-2 py-0.5 text-micro font-medium', d.status === 'pending' ? 'bg-warning-light text-warning' : 'bg-error-light text-error')}>
  {d.status}
  </span>
  </div>
  ))}
  </div>
  </CardBody>
  </Card>
  </div>
  </div>
  );
}
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BadgeCheck, CalendarDays, HandCoins, Wallet } from 'lucide-react';
import { api, apiErrorMessage, unwrap } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Card, CardBody } from '../../components/ui/Card.jsx';
import { Badge, StatusBadge } from '../../components/ui/Badge.jsx';
import { EmptyState, Skeleton } from '../../components/ui/Feedback.jsx';
import { Input } from '../../components/ui/Field.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { formatDate, formatPrice } from '../../lib/utils.js';

export default function SellerBookings() {
  const toast = useToast();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  const { data, isLoading } = useQuery({
  queryKey: ['seller-bookings', page],
  queryFn: async () => unwrap(await api.get('/bookings', { params: { page, limit: 8 } })),
  });
  const bookings = data?.bookings || data?.data || [];

  return (
  <div className="space-y-6">
  <div>
  <h2 className="font-fraunces text-h2 text-text-primary">Bookings</h2>
  <p className="text-body-sm text-text-tertiary">
  Confirmed bookings with deposits, balances and payment tracking.
  </p>
  </div>

  {isLoading ? (
  <div className="space-y-3">
  <Skeleton className="h-24" />
  <Skeleton className="h-24" />
  </div>
  ) : bookings.length === 0 ? (
  <EmptyState
  icon={CalendarDays}
  title="No bookings yet"
  description="Once a customer accepts your estimate and pays, the booking shows up here."
  />
  ) : (
  <div className="space-y-3">
  {bookings.map((b) => (
  <Card key={b._id} clickable onClick={() => setSelected(b)}>
  <CardBody>
  <div className="flex flex-wrap items-center justify-between gap-3">
  <div>
  <div className="flex flex-wrap items-center gap-2">
  <p className="font-geist text-body-lg font-semibold capitalize text-text-primary">
  {b.eventType} event
  </p>
  <StatusBadge status={b.status} />
  {b.depositConfirmedAt && <Badge tone="gold"><BadgeCheck className="h-3 w-3" /> deposit confirmed</Badge>}
  </div>
  <p className="text-body-sm text-text-tertiary">
  {formatDate(b.eventDate)} · {b.guestCount} guests
  </p>
  </div>
  <div className="text-right">
  <p className="font-geist text-h4 font-semibold text-primary-600 dark:text-primary-400">{formatPrice(b.totalAmount)}</p>
  <p className="text-micro text-text-tertiary">
  {formatPrice(b.depositAmount)} deposit · {formatPrice(b.balanceAmount)} balance
  </p>
  </div>
  </div>
  </CardBody>
  </Card>
  ))}
  </div>
  )}

  {data?.pages > 1 && (
  <Pagination page={page} pages={data.pages} total={data.total} onChange={setPage} />
  )}

  {selected && <BookingDetailModal booking={selected} onClose={() => setSelected(null)} />}
  </div>
  );
}

function BookingDetailModal({ booking: b, onClose }) {
  const toast = useToast();
  const qc = useQueryClient();
  const [method, setMethod] = useState('bank transfer');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [showLedgerForm, setShowLedgerForm] = useState(false);
  const [ledger, setLedger] = useState({ type: 'deposit_received', amount: '', method: 'bank transfer', reference: '', notes: '' });

  const { data: ledgerData, isLoading } = useQuery({
  queryKey: ['ledger', b.bookingRequestId],
  queryFn: async () => unwrap(await api.get(`/bookings/${b.bookingRequestId}/ledger`)),
  });
  const entries = ledgerData?.entries || ledgerData?.data || [];

  const confirmDeposit = useMutation({
  mutationFn: async () =>
  unwrap(await api.post(`/bookings/${b._id}/confirm-deposit`, {
  method,
  reference: reference || undefined,
  notes: notes || undefined,
  })),
  onSuccess: () => {
  toast.success('Deposit confirmed');
  qc.invalidateQueries({ queryKey: ['seller-bookings'] });
  qc.invalidateQueries({ queryKey: ['ledger'] });
  },
  onError: (e) => toast.error(apiErrorMessage(e)),
  });

  const addLedger = useMutation({
  mutationFn: async () =>
  unwrap(await api.post(`/bookings/${b.bookingRequestId}/ledger`, {
  ...ledger,
  amount: Number(ledger.amount),
  })),
  onSuccess: () => {
  toast.success('Ledger entry recorded');
  setShowLedgerForm(false);
  setLedger({ type: 'deposit_received', amount: '', method: 'bank transfer', reference: '', notes: '' });
  qc.invalidateQueries({ queryKey: ['ledger'] });
  },
  onError: (e) => toast.error(apiErrorMessage(e)),
  });

  const showConfirm = b.status === 'booked' && !b.depositConfirmedAt;

  return (
  <Modal open onClose={onClose} title={`${b.eventType} booking`}>
  <div className="space-y-4">
  <div className="flex flex-wrap items-center gap-2">
  <StatusBadge status={b.status} />
  <Badge tone="gold">{formatPrice(b.depositAmount)} deposit</Badge>
  <Badge>{formatPrice(b.balanceAmount)} balance</Badge>
  </div>
  <p className="text-body-sm text-text-secondary">
  {formatDate(b.eventDate)} · {b.guestCount} guests · total {formatPrice(b.totalAmount)}
  </p>
  {b.depositConfirmedAt && (
  <p className="text-body-sm text-success">Deposit confirmed on {formatDate(b.depositConfirmedAt)}</p>
  )}

  {showConfirm && (
  <div className="rounded-xl border border-warning/40 bg-warning-light p-4 dark:bg-warning/10">
  <p className="font-geist text-body-sm font-semibold text-text-primary">Confirm deposit receipt</p>
  <p className="text-body-sm text-text-secondary">Mark this booking's deposit as received.</p>
  <div className="mt-3 grid gap-2 sm:grid-cols-2">
  <Input label="Method" value={method} onChange={(e) => setMethod(e.target.value)} placeholder="bank transfer / cash" />
  <Input label="Reference" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="TRX id (optional)" />
  </div>
  <Input label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="optional" />
  <Button className="mt-2" variant="gold" loading={confirmDeposit.isPending} onClick={() => confirmDeposit.mutate()}>
  <HandCoins className="h-4 w-4" /> Confirm deposit
  </Button>
  </div>
  )}

  <div className="border-t border-border-subtle pt-4">
  <div className="flex items-center justify-between">
  <h4 className="font-geist text-body-lg font-semibold text-text-primary">Payment ledger</h4>
  <Button variant="outline" size="sm" onClick={() => setShowLedgerForm(!showLedgerForm)}>
  <Wallet className="h-4 w-4" /> Record payment
  </Button>
  </div>

  {showLedgerForm && (
  <div className="mt-3 space-y-2 rounded-lg bg-surface-sunken p-3">
  <div className="grid gap-2 sm:grid-cols-2">
  <select
  value={ledger.type}
  onChange={(e) => setLedger({ ...ledger, type: e.target.value })}
  className="h-10 rounded-lg border border-border-default bg-surface-base px-3 text-sm focus:border-primary-500 focus:outline-none"
  >
  <option value="deposit_received">Deposit received</option>
  <option value="deposit_sent">Deposit sent</option>
  <option value="balance_received">Balance received</option>
  <option value="balance_sent">Balance sent</option>
  <option value="refund">Refund</option>
  </select>
  <Input label="Amount" type="number" min="0" value={ledger.amount} onChange={(e) => setLedger({ ...ledger, amount: e.target.value })} />
  </div>
  <div className="grid gap-2 sm:grid-cols-2">
  <Input label="Method" value={ledger.method} onChange={(e) => setLedger({ ...ledger, method: e.target.value })} />
  <Input label="Reference" value={ledger.reference} onChange={(e) => setLedger({ ...ledger, reference: e.target.value })} />
  </div>
  <Button size="sm" loading={addLedger.isPending} onClick={() => addLedger.mutate()}>Save entry</Button>
  </div>
  )}

  <div className="mt-3 space-y-2">
  {isLoading ? (
  <Skeleton className="h-10" />
  ) : entries.length === 0 ? (
  <p className="text-body-sm text-text-tertiary">No payments recorded yet.</p>
  ) : (
  entries.map((en) => (
  <div key={en._id} className="flex items-center justify-between rounded-lg border border-border-subtle px-3 py-2">
  <div>
  <p className="text-body-sm font-medium capitalize text-text-primary">{en.type.replace('_', ' ')}</p>
  <p className="text-micro text-text-tertiary">{formatDate(en.createdAt)}{en.method ? ` · ${en.method}` : ''}{en.reference ? ` · ${en.reference}` : ''}</p>
  </div>
  <p className={`font-geist text-body-sm font-semibold ${en.type === 'refund' ? 'text-error' : 'text-success'}`}>
  {en.type === 'refund' ? '−' : '+'}{formatPrice(en.amount)}
  </p>
  </div>
  ))
  )}
  </div>
  </div>
  </div>
  </Modal>
  );
}
import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FileText, Plus, Send } from 'lucide-react';
import { api, apiErrorMessage, unwrap } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Card, CardBody } from '../../components/ui/Card.jsx';
import { Badge, StatusBadge } from '../../components/ui/Badge.jsx';
import { EmptyState, Skeleton } from '../../components/ui/Feedback.jsx';
import { Input, Textarea } from '../../components/ui/Field.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { formatDate, formatPrice } from '../../lib/utils.js';

export default function SellerEstimates() {
  const toast = useToast();
  const qc = useQueryClient();
  const [params] = useSearchParams();
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(!!params.get('request'));
  const [selected, setSelected] = useState(null);

  const { data, isLoading } = useQuery({
  queryKey: ['seller-estimates', page],
  queryFn: async () => unwrap(await api.get('/estimates', { params: { page, limit: 8 } })),
  });
  const estimates = data?.estimates || data?.data || [];

  return (
  <div className="space-y-6">
  <div className="flex flex-wrap items-center justify-between gap-3">
  <div>
  <h2 className="font-fraunces text-h2 text-text-primary">Estimates</h2>
  <p className="text-body-sm text-text-tertiary">Send quotes with line items, discounts and taxes.</p>
  </div>
  <Button variant="gold" onClick={() => setCreating(true)}><Plus className="h-4 w-4" /> New estimate</Button>
  </div>

  {isLoading ? (
  <div className="space-y-3">
  <Skeleton className="h-24" />
  <Skeleton className="h-24" />
  </div>
  ) : estimates.length === 0 ? (
  <EmptyState icon={FileText} title="No estimates yet" description="Create your first estimate from a booking request." />
  ) : (
  <div className="space-y-3">
  {estimates.map((e) => (
  <Card key={e._id} clickable onClick={() => setSelected(e)}>
  <CardBody>
  <div className="flex flex-wrap items-center justify-between gap-3">
  <div>
  <div className="flex items-center gap-2">
  <p className="font-geist text-body-lg font-semibold capitalize text-text-primary">
  v{e.version} · {e.bookingRequestId?.eventType} event
  </p>
  <StatusBadge status={e.status} />
  </div>
  <p className="text-body-sm text-text-tertiary">
  {formatDate(e.bookingRequestId?.eventDate)} · {e.bookingRequestId?.guestCount} guests · sent {formatDate(e.createdAt)}
  </p>
  </div>
  <div className="text-right">
  <p className="font-geist text-h4 font-semibold text-primary-600 dark:text-primary-400">{formatPrice(e.total)}</p>
  {e.status === 'sent' && <Badge tone="gold">awaiting customer</Badge>}
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

  {creating && (
  <CreateEstimateModal
  presetRequestId={params.get('request')}
  onClose={() => setCreating(false)}
  />
  )}
  {selected && (
  <EstimateDetailModal estimate={selected} onClose={() => setSelected(null)} />
  )}
  </div>
  );
}

function CreateEstimateModal({ presetRequestId, onClose }) {
  const toast = useToast();
  const qc = useQueryClient();
  const [requestId, setRequestId] = useState(presetRequestId || '');
  const [lineItems, setLineItems] = useState([{ name: '', description: '', quantity: 1, unitPrice: '' }]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [serviceChargePercent, setServiceChargePercent] = useState(0);
  const [taxPercent, setTaxPercent] = useState(0);
  const [validityDate, setValidityDate] = useState('');
  const [notes, setNotes] = useState('');

  const { data: requests } = useQuery({
  queryKey: ['seller-requests-all'],
  queryFn: async () => unwrap(await api.get('/booking-requests', { params: { limit: 50 } })),
  });
  const pendingRequests = useMemo(
  () => (requests?.requests || requests?.data || []).filter((r) => r.status === 'pending'),
  [requests]
  );

  const subtotal = lineItems.reduce((s, l) => s + (Number(l.quantity) || 0) * (Number(l.unitPrice) || 0), 0);
  const discount = (subtotal * Number(discountPercent || 0)) / 100;
  const afterDiscount = subtotal - discount;
  const serviceCharge = (afterDiscount * Number(serviceChargePercent || 0)) / 100;
  const tax = (afterDiscount + serviceCharge) * Number(taxPercent || 0) / 100;
  const total = afterDiscount + serviceCharge + tax;

  const create = useMutation({
  mutationFn: async () =>
  unwrap(
  await api.post('/estimates', {
  bookingRequestId: requestId,
  lineItems: lineItems
  .filter((l) => l.name.trim())
  .map((l) => ({
  name: l.name.trim(),
  description: l.description || undefined,
  quantity: Number(l.quantity) || 1,
  unitPrice: Number(l.unitPrice) || 0,
  })),
  discountPercent: Number(discountPercent) || 0,
  serviceChargePercent: Number(serviceChargePercent) || 0,
  taxPercent: Number(taxPercent) || 0,
  validityDate: validityDate || undefined,
  notes: notes || undefined,
  })
  ),
  onSuccess: (r) => {
  toast.success(`Estimate v${r.version} sent to customer`);
  onClose();
  qc.invalidateQueries({ queryKey: ['seller-estimates'] });
  },
  onError: (e) => toast.error(apiErrorMessage(e)),
  });

  return (
  <Modal open onClose={onClose} title="New estimate">
  <div className="space-y-4">
  <div>
  <label className="text-micro font-medium text-text-secondary">Booking request</label>
  <select
  value={requestId}
  onChange={(e) => setRequestId(e.target.value)}
  className="mt-1 w-full rounded-lg border border-border-default bg-surface-sunken px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
  >
  <option value="">Select a request…</option>
  {pendingRequests.map((r) => (
  <option key={r._id} value={r._id}>
  {r.eventType} · {formatDate(r.eventDate)} · {r.guestCount} guests
  </option>
  ))}
  </select>
  </div>

  <div className="space-y-2">
  <p className="text-micro font-medium text-text-secondary">Line items</p>
  {lineItems.map((item, i) => (
  <div key={i} className="grid grid-cols-12 gap-2">
  <input
  value={item.name}
  onChange={(e) => setLineItems((l) => l.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
  placeholder="Item"
  className="col-span-5 h-10 rounded-lg border border-border-default bg-surface-sunken px-3 text-sm focus:border-primary-500 focus:outline-none"
  />
  <input
  value={item.quantity}
  onChange={(e) => setLineItems((l) => l.map((x, j) => (j === i ? { ...x, quantity: e.target.value } : x)))}
  placeholder="Qty"
  type="number"
  min="1"
  className="col-span-2 h-10 rounded-lg border border-border-default bg-surface-sunken px-3 text-sm focus:border-primary-500 focus:outline-none"
  />
  <input
  value={item.unitPrice}
  onChange={(e) => setLineItems((l) => l.map((x, j) => (j === i ? { ...x, unitPrice: e.target.value } : x)))}
  placeholder="Unit price"
  type="number"
  min="0"
  className="col-span-4 h-10 rounded-lg border border-border-default bg-surface-sunken px-3 text-sm focus:border-primary-500 focus:outline-none"
  />
  <button
  type="button"
  onClick={() => setLineItems((l) => l.filter((_, j) => j !== i))}
  className="col-span-1 text-error hover:opacity-70"
  aria-label="Remove"
  >
  ×
  </button>
  </div>
  ))}
  <Button variant="outline" size="sm" onClick={() => setLineItems((l) => [...l, { name: '', description: '', quantity: 1, unitPrice: '' }])}>
  + Add item
  </Button>
  </div>

  <div className="grid grid-cols-3 gap-3">
  <Input label="Discount %" type="number" min="0" max="100" value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)} />
  <Input label="Service charge %" type="number" min="0" value={serviceChargePercent} onChange={(e) => setServiceChargePercent(e.target.value)} />
  <Input label="Tax %" type="number" min="0" value={taxPercent} onChange={(e) => setTaxPercent(e.target.value)} />
  </div>
  <Input label="Valid until" type="date" value={validityDate} onChange={(e) => setValidityDate(e.target.value)} />
  <Textarea label="Notes (optional)" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />

  <div className="rounded-lg bg-surface-sunken p-3 text-body-sm text-text-secondary">
  Subtotal <span className="float-right">{formatPrice(subtotal)}</span>
  <br />
  Discount <span className="float-right text-error">− {formatPrice(discount)}</span>
  <br />
  Service charge <span className="float-right">{formatPrice(serviceCharge)}</span>
  <br />
  Tax <span className="float-right">{formatPrice(tax)}</span>
  <br />
  <strong className="text-text-primary">
  Total <span className="float-right">{formatPrice(total)}</span>
  </strong>
  </div>

  <div className="flex justify-end gap-2">
  <Button variant="ghost" onClick={onClose}>Cancel</Button>
  <Button variant="gold" loading={create.isPending} disabled={!requestId} onClick={() => create.mutate()}>
  <Send className="h-4 w-4" /> Send estimate
  </Button>
  </div>
  </div>
  </Modal>
  );
}

function EstimateDetailModal({ estimate: e, onClose }) {
  const items = e.lineItems || [];
  const subtotal = items.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
  return (
  <Modal open onClose={onClose} title={`Estimate v${e.version}`}>
  <div className="space-y-3">
  <div className="flex items-center gap-2">
  <StatusBadge status={e.status} />
  <p className="text-micro text-text-tertiary">Sent {formatDate(e.createdAt)}</p>
  </div>
  <table className="w-full text-body-sm">
  <thead>
  <tr className="border-b border-border-subtle text-left text-micro uppercase tracking-wide text-text-tertiary">
  <th className="py-2">Item</th>
  <th className="py-2 text-right">Qty</th>
  <th className="py-2 text-right">Price</th>
  <th className="py-2 text-right">Total</th>
  </tr>
  </thead>
  <tbody>
  {items.map((l, i) => (
  <tr key={i} className="border-b border-border-subtle">
  <td className="py-2">{l.name}</td>
  <td className="py-2 text-right">{l.quantity}</td>
  <td className="py-2 text-right">{formatPrice(l.unitPrice)}</td>
  <td className="py-2 text-right">{formatPrice(l.quantity * l.unitPrice)}</td>
  </tr>
  ))}
  </tbody>
  </table>
  <div className="text-body-sm text-text-secondary">
  Subtotal <span className="float-right">{formatPrice(subtotal)}</span>
  {e.discountAmount > 0 && (
  <><br />Discount <span className="float-right text-error">− {formatPrice(e.discountAmount)}</span></>
  )}
  {e.serviceChargeAmount > 0 && (
  <><br />Service charge <span className="float-right">{formatPrice(e.serviceChargeAmount)}</span></>
  )}
  {e.taxAmount > 0 && (
  <><br />Tax <span className="float-right">{formatPrice(e.taxAmount)}</span></>
  )}
  <br />
  <strong className="text-text-primary">Total <span className="float-right">{formatPrice(e.total)}</span></strong>
  </div>
  {e.validityDate && (
  <p className="text-micro text-text-tertiary">Valid until {formatDate(e.validityDate)}</p>
  )}
  {e.notes && <p className="text-body-sm italic text-text-secondary">“{e.notes}”</p>}
  <div className="flex justify-end">
  <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
  </div>
  </div>
  </Modal>
  );
}
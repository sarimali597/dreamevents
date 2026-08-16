import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, FileText, Send, X } from 'lucide-react';
import { api, apiErrorMessage, unwrap } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card.jsx';
import { StatusBadge } from '../../components/ui/Badge.jsx';
import { EmptyState, Skeleton } from '../../components/ui/Feedback.jsx';
import { ThreadPanel } from '../../components/booking/ThreadPanel.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Field.jsx';
import { formatDate, formatPrice } from '../../lib/utils.js';

export default function RequestDetail() {
  const { id } = useParams();
  const toast = useToast();
  const qc = useQueryClient();
  const [acceptOpen, setAcceptOpen] = useState(false);
  const [deposit, setDeposit] = useState('');

  const { data: request, isLoading } = useQuery({
  queryKey: ['request', id],
  queryFn: async () => unwrap(await api.get(`/booking-requests/${id}`)),
  });

  const { data: estimates } = useQuery({
  queryKey: ['estimates'],
  queryFn: async () => unwrap(await api.get('/estimates')),
  });

  const latestEstimate = (estimates || [])
  .filter((e) => String(e.bookingRequestId?._id || e.bookingRequestId) === String(id))
  .sort((a, b) => b.version - a.version)[0];

  const acceptMutation = useMutation({
  mutationFn: async () => unwrap(await api.post(`/estimates/${latestEstimate._id}/accept`, { depositAmount: Number(deposit) })),
  onSuccess: (booking) => {
  toast.success('Estimate accepted — your booking is confirmed!');
  qc.invalidateQueries({ queryKey: ['request', id] });
  qc.invalidateQueries({ queryKey: ['estimates'] });
  qc.invalidateQueries({ queryKey: ['bookings'] });
  qc.invalidateQueries({ queryKey: ['booking', booking?._id] });
  setAcceptOpen(false);
  },
  onError: (e) => toast.error(apiErrorMessage(e)),
  });

  const rejectMutation = useMutation({
  mutationFn: async () => unwrap(await api.post(`/estimates/${latestEstimate._id}/reject`, { reason: 'I would like to negotiate' })),
  onSuccess: () => {
  toast.success('Estimate declined — the vendor can now revise it.');
  qc.invalidateQueries({ queryKey: ['request', id] });
  qc.invalidateQueries({ queryKey: ['estimates'] });
  },
  onError: (e) => toast.error(apiErrorMessage(e)),
  });

  const cancelMutation = useMutation({
  mutationFn: async () => unwrap(await api.post(`/booking-requests/${id}/cancel`)),
  onSuccess: () => {
  toast.success('Request cancelled');
  qc.invalidateQueries({ queryKey: ['request', id] });
  qc.invalidateQueries({ queryKey: ['requests'] });
  },
  onError: (e) => toast.error(apiErrorMessage(e)),
  });

  if (isLoading) {
  return (
  <div className="grid gap-6 lg:grid-cols-3">
  <Skeleton className="h-96 lg:col-span-1" />
  <Skeleton className="h-96 lg:col-span-2" />
  </div>
  );
  }

  if (!request) {
  return <EmptyState icon={CalendarDays} title="Request not found" />;
  }

  const openForAction = ['pending', 'seller_replied', 'estimate_sent', 'negotiating'].includes(request.status);
  const canAccept = latestEstimate && ['sent', 'viewed'].includes(latestEstimate.status) && openForAction;
  const canReject = canAccept;
  const canCancel = !['accepted', 'cancelled', 'rejected', 'expired'].includes(request.status);

  return (
  <div className="grid gap-6 lg:grid-cols-5">
  {/* Request info + estimate */}
  <div className="space-y-5 lg:col-span-2">
  <Card>
  <CardHeader>
  <CardTitle>Request details</CardTitle>
  <StatusBadge status={request.status} />
  </CardHeader>
  <CardBody className="mt-4 space-y-3">
  <Link to={`/seller/${request.sellerId?.slug}`} className="flex items-center gap-3 rounded-lg border border-border-subtle p-3 transition-colors hover:border-primary-300">
  <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900">
  {request.sellerId?.coverImage ? (
  <img src={request.sellerId.coverImage} alt="" className="h-full w-full object-cover" />
  ) : (
  request.sellerId?.businessName?.charAt(0)
  )}
  </div>
  <div>
  <p className="font-geist text-body-sm font-semibold text-text-primary">{request.sellerId?.businessName}</p>
  <p className="text-micro text-text-tertiary">{request.sellerId?.category} · {request.sellerId?.city}</p>
  </div>
  </Link>
  <Info label="Event type" value={request.eventType} capitalize />
  <Info label="Event date" value={formatDate(request.eventDate)} />
  <Info label="Guests" value={`${request.guestCount} guests`} />
  {request.timeWindow && <Info label="Time window" value={request.timeWindow} />}
  {request.budgetRange?.min || request.budgetRange?.max ? (
  <Info
  label="Budget range"
  value={`${request.budgetRange.min ? formatPrice(request.budgetRange.min) : '—'} – ${request.budgetRange.max ? formatPrice(request.budgetRange.max) : '—'}`}
  />
  ) : null}
  {request.specialRequirements && <Info label="Special requirements" value={request.specialRequirements} />}
  <div>
  <p className="text-micro text-text-tertiary">Your message</p>
  <p className="mt-1 text-body-sm text-text-secondary">{request.message}</p>
  </div>
  {request.sellerResponse && (
  <div className="rounded-lg bg-success-light/50 p-3 dark:bg-success/10">
  <p className="text-micro font-semibold text-success">Vendor's response</p>
  <p className="mt-1 text-body-sm text-text-secondary">{request.sellerResponse}</p>
  </div>
  )}
  </CardBody>
  </Card>

  {latestEstimate && (
  <Card className="border-accent-300 dark:border-accent-700">
  <CardHeader>
  <CardTitle className="flex items-center gap-2">
  <FileText className="h-4 w-4 text-accent-600 dark:text-accent-400" />
  Estimate #{latestEstimate.version}
  </CardTitle>
  <StatusBadge status={latestEstimate.status} />
  </CardHeader>
  <CardBody className="mt-4">
  <div className="overflow-hidden rounded-lg border border-border-default">
  <table className="w-full text-body-sm">
  <tbody className="divide-y divide-border-subtle">
  {latestEstimate.lineItems.map((li, i) => (
  <tr key={i}>
  <td className="px-3 py-2 text-text-primary">
  {li.name}
  {li.description && <span className="block text-micro text-text-tertiary">{li.description}</span>}
  </td>
  <td className="px-3 py-2 text-right text-micro text-text-tertiary">
  {li.quantity} × {formatPrice(li.unitPrice)}
  </td>
  <td className="px-3 py-2 text-right font-medium text-text-primary">{formatPrice(li.quantity * li.unitPrice)}</td>
  </tr>
  ))}
  </tbody>
  <tfoot className="border-t border-border-default text-body-sm">
  {latestEstimate.discountPercent > 0 && (
  <tr><td colSpan="2" className="px-3 py-1.5 text-right text-text-tertiary">Discount ({latestEstimate.discountPercent}%)</td><td className="px-3 py-1.5 text-right font-medium text-error">−{formatPrice(latestEstimate.discountAmount)}</td></tr>
  )}
  {latestEstimate.serviceChargePercent > 0 && (
  <tr><td colSpan="2" className="px-3 py-1.5 text-right text-text-tertiary">Service charge</td><td className="px-3 py-1.5 text-right font-medium">{formatPrice(latestEstimate.serviceChargeAmount)}</td></tr>
  )}
  {latestEstimate.taxPercent > 0 && (
  <tr><td colSpan="2" className="px-3 py-1.5 text-right text-text-tertiary">Tax ({latestEstimate.taxPercent}%)</td><td className="px-3 py-1.5 text-right font-medium">{formatPrice(latestEstimate.taxAmount)}</td></tr>
  )}
  <tr className="bg-accent-50 dark:bg-accent-900/40">
  <td colSpan="2" className="px-3 py-2.5 text-right font-semibold text-text-primary">Total</td>
  <td className="px-3 py-2.5 text-right font-geist font-semibold text-accent-700 dark:text-accent-400">{formatPrice(latestEstimate.total)}</td>
  </tr>
  </tfoot>
  </table>
  </div>
  {latestEstimate.notes && (
  <p className="mt-3 rounded-lg bg-slate-50 p-3 text-body-sm text-text-secondary dark:bg-ink-800">{latestEstimate.notes}</p>
  )}
  <p className="mt-2 text-micro text-text-tertiary">Valid until {formatDate(latestEstimate.validityDate)}</p>

  <div className="mt-4 flex flex-wrap gap-2">
  {canAccept && (
  <Button onClick={() => { setAcceptOpen(true); setDeposit(String(latestEstimate.depositAmount ?? Math.round(latestEstimate.total * 0.3))); }}>
  <Send className="h-4 w-4" /> Accept & book
  </Button>
  )}
  {canReject && (
  <Button variant="outline" loading={rejectMutation.isPending} onClick={() => rejectMutation.mutate()}>
  Decline — negotiate
  </Button>
  )}
  </div>
  </CardBody>
  </Card>
  )}

  {canCancel && (
  <Button
  variant="danger-outline"
  className="w-full"
  loading={cancelMutation.isPending}
  onClick={() => {
  if (window.confirm('Cancel this booking request? The vendor will be notified.')) cancelMutation.mutate();
  }}
  >
  <X className="h-4 w-4" /> Cancel request
  </Button>
  )}
  </div>

  {/* Chat */}
  <Card className="overflow-hidden lg:col-span-3">
  <CardBody className="flex h-[560px] flex-col p-0">
  <div className="flex items-center justify-between border-b border-border-default px-4 py-3">
  <h3 className="font-geist text-h4 font-semibold text-text-primary">Conversation</h3>
  <span className="text-micro capitalize text-text-tertiary">{request.eventType} · {formatDate(request.eventDate)}</span>
  </div>
  <ThreadPanel requestId={id} className="min-h-0 flex-1" />
  </CardBody>
  </Card>

  {/* Accept modal */}
  {acceptOpen && (
  <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
  <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" onClick={() => setAcceptOpen(false)} />
  <div className="relative z-10 w-full max-w-md rounded-xl border border-border-default bg-surface-raised p-6 shadow-xl">
  <h3 className="font-fraunces text-h3 text-text-primary">Confirm your booking</h3>
  <p className="mt-2 text-body-sm text-text-secondary">
  Accepting locks in the total of <strong className="text-text-primary">{formatPrice(latestEstimate.total)}</strong>.
  Pay a deposit to confirm — the balance is due by the event date.
  </p>
  <div className="mt-4">
  <Input label="Deposit amount (PKR)" type="number" min="0" value={deposit} onChange={(e) => setDeposit(e.target.value)} hint={`Suggested: ${formatPrice(Math.round(latestEstimate.total * 0.3))}`} />
  </div>
  <div className="mt-5 flex justify-end gap-2">
  <Button variant="outline" onClick={() => setAcceptOpen(false)}>Not yet</Button>
  <Button
  loading={acceptMutation.isPending}
  disabled={!Number(deposit) || Number(deposit) > latestEstimate.total}
  onClick={() => acceptMutation.mutate()}
  >
  Confirm booking
  </Button>
  </div>
  {Number(deposit) > latestEstimate.total && (
  <p className="mt-2 text-micro text-error">Deposit cannot exceed the estimate total.</p>
  )}
  </div>
  </div>
  )}
  </div>
  );
}

function Info({ label, value, capitalize = false }) {
  return (
  <div>
  <p className="text-micro text-text-tertiary">{label}</p>
  <p className={`text-body-sm font-medium text-text-primary ${capitalize ? 'capitalize' : ''}`}>{value}</p>
  </div>
  );
}
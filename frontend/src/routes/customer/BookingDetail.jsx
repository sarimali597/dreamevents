import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarDays, MessageSquare, Send, Star } from 'lucide-react';
import { api, apiErrorMessage, unwrap } from '../../lib/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { Card, CardBody } from '../../components/ui/Card.jsx';
import { StatusBadge } from '../../components/ui/Badge.jsx';
import { EmptyState, Skeleton } from '../../components/ui/Feedback.jsx';
import { Stars } from '../../components/ui/Stars.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Select, Textarea } from '../../components/ui/Field.jsx';
import { formatDate, formatPrice, formatDateTime } from '../../lib/utils.js';

const reviewSchema = z.object({
  overallRating: z.coerce.number().min(1).max(5),
  serviceQuality: z.coerce.number().min(1).max(5),
  priceFairness: z.coerce.number().min(1).max(5),
  communication: z.coerce.number().min(1).max(5),
  timeliness: z.coerce.number().min(1).max(5),
  text: z.string().min(10, 'Review must be at least 10 characters').max(2000),
});

export default function BookingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();
  const [reviewOpen, setReviewOpen] = useState(false);

  const { data: booking, isLoading } = useQuery({
  queryKey: ['booking', id],
  queryFn: async () => unwrap(await api.get(`/bookings/${id}`)),
  });

  const { data: ledger } = useQuery({
  queryKey: ['ledger', id],
  enabled: !!booking?.bookingRequestId,
  queryFn: async () => unwrap(await api.get(`/bookings/${booking.bookingRequestId}/ledger`)),
  });

  const { data: myReviews } = useQuery({
  queryKey: ['reviews-mine'],
  queryFn: async () => unwrap(await api.get('/reviews/mine')),
  });

  const hasReviewed = (myReviews || []).some((r) => String(r.bookingId) === String(id));

  const {
  register,
  handleSubmit,
  formState: { errors },
  } = useForm({ resolver: zodResolver(reviewSchema), defaultValues: { overallRating: 5, serviceQuality: 5, priceFairness: 5, communication: 5, timeliness: 5 } });

  const reviewMutation = useMutation({
  mutationFn: async (values) => unwrap(await api.post('/reviews', { bookingId: id, ...values })),
  onSuccess: () => {
  toast.success('Review submitted — thank you!');
  setReviewOpen(false);
  qc.invalidateQueries({ queryKey: ['reviews-mine'] });
  qc.invalidateQueries({ queryKey: ['reviews'] });
  },
  onError: (e) => toast.error(apiErrorMessage(e)),
  });

  if (isLoading) {
  return (
  <div className="space-y-4">
  <Skeleton className="h-40" />
  <Skeleton className="h-40" />
  </div>
  );
  }

  if (!booking) {
  return <EmptyState icon={CalendarDays} title="Booking not found" />;
  }

  const estimate = booking.estimateId;
  const isSeller = user?.role === 'seller';

  return (
  <div className="space-y-6">
  <div className="flex flex-wrap items-center justify-between gap-3">
  <div>
  <h2 className="font-fraunces text-h2 text-text-primary">{booking.sellerId?.businessName}</h2>
  <p className="text-body-sm text-text-tertiary">
  Booking #{String(booking._id).slice(-6).toUpperCase()} · {formatDate(booking.eventDate)}
  </p>
  </div>
  <StatusBadge status={booking.status} />
  </div>

  <div className="grid gap-6 lg:grid-cols-3">
  <Card className="lg:col-span-2">
  <CardBody className="space-y-5">
  <div className="grid gap-4 sm:grid-cols-2">
  <Info label="Event type" value={booking.eventType} capitalize />
  <Info label="Event date" value={formatDate(booking.eventDate)} />
  <Info label="Guests" value={`${booking.guestCount} guests`} />
  <Info label="Confirmed on" value={formatDateTime(booking.createdAt)} />
  <Info label="Total amount" value={formatPrice(booking.totalAmount)} highlight />
  <Info label="Deposit paid" value={formatPrice(booking.depositAmount)} />
  <Info label="Balance due" value={formatPrice(booking.balanceAmount)} highlight />
  </div>

  <div>
  <h3 className="font-geist text-h4 font-semibold text-text-primary">Timeline</h3>
  <ol className="mt-3 space-y-3">
  {[
  { label: 'Request sent', date: booking.createdAt, done: true },
  { label: 'Estimate accepted', date: booking.createdAt, done: true },
  { label: 'Deposit received', date: booking.depositConfirmedAt, done: !!booking.depositConfirmedAt },
  { label: 'Event day', date: booking.eventDate, done: false, future: true },
  { label: 'Completed', date: booking.completedAt, done: booking.status === 'completed' },
  ].map((step) => (
  <li key={step.label} className="flex items-center gap-3">
  <span className={`h-3 w-3 rounded-full ${step.done ? 'bg-success' : step.future ? 'bg-primary-400' : 'bg-slate-300 dark:bg-ink-600'}`} />
  <span className="flex-1 text-body-sm text-text-secondary">{step.label}</span>
  <span className="text-micro text-text-tertiary">{step.date ? formatDate(step.date) : ''}</span>
  </li>
  ))}
  </ol>
  </div>

  {estimate && (
  <div>
  <h3 className="font-geist text-h4 font-semibold text-text-primary">Estimate #{estimate.version}</h3>
  <div className="mt-2 overflow-hidden rounded-lg border border-border-default">
  <table className="w-full text-body-sm">
  <thead className="bg-slate-50 text-left text-micro uppercase tracking-wide text-text-tertiary dark:bg-ink-800">
  <tr>
  <th className="px-4 py-2.5">Item</th>
  <th className="px-4 py-2.5 text-right">Qty</th>
  <th className="px-4 py-2.5 text-right">Unit price</th>
  <th className="px-4 py-2.5 text-right">Amount</th>
  </tr>
  </thead>
  <tbody className="divide-y divide-border-subtle">
  {estimate.lineItems?.map((li, i) => (
  <tr key={i}>
  <td className="px-4 py-2.5 text-text-primary">
  {li.name}
  {li.description && <span className="block text-micro text-text-tertiary">{li.description}</span>}
  </td>
  <td className="px-4 py-2.5 text-right text-text-secondary">{li.quantity}</td>
  <td className="px-4 py-2.5 text-right text-text-secondary">{formatPrice(li.unitPrice)}</td>
  <td className="px-4 py-2.5 text-right font-medium text-text-primary">{formatPrice(li.quantity * li.unitPrice)}</td>
  </tr>
  ))}
  </tbody>
  <tfoot className="border-t border-border-default text-body-sm">
  <tr><td colSpan="3" className="px-4 py-2 text-right text-text-tertiary">Subtotal</td><td className="px-4 py-2 text-right font-medium">{formatPrice(estimate.subtotal)}</td></tr>
  {estimate.discountPercent > 0 && (
  <tr><td colSpan="3" className="px-4 py-2 text-right text-text-tertiary">Discount ({estimate.discountPercent}%)</td><td className="px-4 py-2 text-right font-medium text-error">−{formatPrice(estimate.discountAmount)}</td></tr>
  )}
  {estimate.serviceChargePercent > 0 && (
  <tr><td colSpan="3" className="px-4 py-2 text-right text-text-tertiary">Service charge ({estimate.serviceChargePercent}%)</td><td className="px-4 py-2 text-right font-medium">{formatPrice(estimate.serviceChargeAmount)}</td></tr>
  )}
  {estimate.taxPercent > 0 && (
  <tr><td colSpan="3" className="px-4 py-2 text-right text-text-tertiary">Tax ({estimate.taxPercent}%)</td><td className="px-4 py-2 text-right font-medium">{formatPrice(estimate.taxAmount)}</td></tr>
  )}
  <tr className="bg-primary-50 dark:bg-primary-900/30">
  <td colSpan="3" className="px-4 py-2.5 text-right font-semibold text-text-primary">Total</td>
  <td className="px-4 py-2.5 text-right font-geist font-semibold text-primary-700 dark:text-primary-400">{formatPrice(estimate.total)}</td>
  </tr>
  </tfoot>
  </table>
  </div>
  </div>
  )}

  {ledger && ledger.length > 0 && (
  <div>
  <h3 className="font-geist text-h4 font-semibold text-text-primary">Payment ledger</h3>
  <div className="mt-2 space-y-2">
  {ledger.map((entry) => (
  <div key={entry._id} className="flex items-center justify-between rounded-lg border border-border-subtle px-4 py-3">
  <div>
  <StatusBadge status={entry.type} />
  <p className="mt-1 text-micro text-text-tertiary">{formatDateTime(entry.createdAt)}{entry.reference ? ` · ${entry.reference}` : ''}</p>
  </div>
  <span className="font-geist text-body-sm font-semibold text-text-primary">{formatPrice(entry.amount)}</span>
  </div>
  ))}
  </div>
  </div>
  )}
  </CardBody>
  </Card>

  <div className="space-y-5">
  <Card>
  <CardBody className="space-y-3">
  <h3 className="font-geist text-h4 font-semibold text-text-primary">Vendor</h3>
  <Link to={`/seller/${booking.sellerId?.slug}`} className="flex items-center gap-3">
  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900">
  {booking.sellerId?.coverImage ? (
  <img src={booking.sellerId.coverImage} alt="" className="h-full w-full object-cover" />
  ) : (
  booking.sellerId?.businessName?.charAt(0)
  )}
  </div>
  <div>
  <p className="font-geist text-body-sm font-semibold text-text-primary">{booking.sellerId?.businessName}</p>
  <p className="text-micro text-text-tertiary">{booking.sellerId?.city}</p>
  </div>
  </Link>
  {booking.sellerId?.contactPhone && (
  <p className="text-micro text-text-tertiary">Phone: {booking.sellerId.contactPhone}</p>
  )}
  </CardBody>
  </Card>

  <Card>
  <CardBody className="space-y-3">
  <h3 className="font-geist text-h4 font-semibold text-text-primary">Actions</h3>
  <Link to="/customer/messages" className="block">
  <Button variant="outline" className="w-full">
  <MessageSquare className="h-4 w-4" />
  Open conversation
  </Button>
  </Link>
  {!isSeller && booking.status === 'completed' && !hasReviewed && (
  <Button className="w-full" onClick={() => setReviewOpen(true)}>
  <Star className="h-4 w-4" />
  Leave a review
  </Button>
  )}
  {!isSeller && booking.status === 'completed' && hasReviewed && (
  <p className="text-center text-micro text-success">You reviewed this booking. Thank you!</p>
  )}
  </CardBody>
  </Card>
  </div>
  </div>

  <Modal open={reviewOpen} onClose={() => setReviewOpen(false)} title="Review your experience" size="lg">
  <form onSubmit={handleSubmit((v) => reviewMutation.mutate(v))} className="space-y-4">
  <div className="grid gap-4 sm:grid-cols-2">
  {[
  { name: 'overallRating', label: 'Overall rating' },
  { name: 'serviceQuality', label: 'Service quality' },
  { name: 'priceFairness', label: 'Price fairness' },
  { name: 'communication', label: 'Communication' },
  { name: 'timeliness', label: 'Timeliness' },
  ].map((f) => (
  <Select key={f.name} label={f.label} error={errors[f.name]?.message} {...register(f.name)}>
  {[5, 4, 3, 2, 1].map((n) => (
  <option key={n} value={n}>{n} {n === 1 ? 'star' : 'stars'}</option>
  ))}
  </Select>
  ))}
  </div>
  <Textarea label="Your review" placeholder="How was the vendor? Share details to help other couples…" error={errors.text?.message} {...register('text')} />
  <div className="flex justify-end gap-2">
  <Button type="button" variant="outline" onClick={() => setReviewOpen(false)}>Cancel</Button>
  <Button type="submit" loading={reviewMutation.isPending}><Send className="h-4 w-4" /> Submit review</Button>
  </div>
  </form>
  </Modal>
  </div>
  );
}

function Info({ label, value, capitalize = false, highlight = false }) {
  return (
  <div className="rounded-lg bg-slate-50 px-4 py-3 dark:bg-ink-800">
  <p className="text-micro text-text-tertiary">{label}</p>
  <p className={`mt-0.5 text-body-sm font-medium ${highlight ? 'text-primary-700 dark:text-primary-400' : 'text-text-primary'} ${capitalize ? 'capitalize' : ''}`}>{value}</p>
  </div>
  );
}
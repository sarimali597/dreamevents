import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PartyPopper } from 'lucide-react';
import { api, unwrap } from '../../lib/api.js';
import { Button } from '../../components/ui/Button.jsx';
import { formatPrice, formatDateTime } from '../../lib/utils.js';

export default function SupportSuccess() {
  const [params] = useSearchParams();
  const reference = params.get('reference') || '';

  const { data: payments } = useQuery({
    queryKey: ['support-payments'],
    queryFn: async () => unwrap(await api.get('/support/mine')),
  });

  const payment = (payments || []).find((p) => p.reference === reference);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success-light text-success dark:bg-success/15">
        <PartyPopper className="h-8 w-8" />
      </span>
      <h1 className="mt-5 font-fraunces text-h1 text-text-primary">Thank you!</h1>
      <p className="mt-3 text-body text-text-secondary">
        Your coffee order was {payment?.status === 'completed' ? 'confirmed' : 'received'}. You made
        the DreamEvents team's day — and every celebration after it.
      </p>

      {payment && (
        <div className="mt-8 w-full rounded-xl border border-border-default bg-surface-raised p-5 text-left shadow-sm">
          <div className="flex justify-between text-body-sm">
            <span className="text-text-tertiary">Reference</span>
            <span className="font-mono font-medium text-text-primary">{payment.reference}</span>
          </div>
          <div className="mt-2 flex justify-between text-body-sm">
            <span className="text-text-tertiary">Coffee</span>
            <span className="font-medium text-text-primary">{payment.coffeeName}</span>
          </div>
          <div className="mt-2 flex justify-between text-body-sm">
            <span className="text-text-tertiary">Amount</span>
            <span className="font-semibold text-primary-700 dark:text-primary-400">{formatPrice(payment.amount)}</span>
          </div>
          <div className="mt-2 flex justify-between text-body-sm">
            <span className="text-text-tertiary">Date</span>
            <span className="font-medium text-text-primary">{formatDateTime(payment.createdAt)}</span>
          </div>
        </div>
      )}

      <div className="mt-8 flex gap-3">
        <Link to="/"><Button variant="outline">Back home</Button></Link>
        <Link to="/search"><Button>Browse vendors</Button></Link>
      </div>
    </div>
  );
}
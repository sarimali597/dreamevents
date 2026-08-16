import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Coffee, Heart } from 'lucide-react';
import { api, apiErrorMessage, unwrap } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input, Select } from '../../components/ui/Field.jsx';
import { FadeIn } from '../../components/effects/FadeIn.jsx';

const schema = z.object({
  coffeeName: z.string().min(2, 'Give your coffee a name'),
  amount: z.coerce.number().min(100, 'Minimum is 100 PKR').max(50000, 'Maximum is 50,000 PKR'),
});

export default function Support() {
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { coffeeName: 'A coffee for DreamEvents', amount: 500 } });

  const amount = watch('amount');

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      const data = unwrap(await api.post('/support/checkout', values));
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        toast.error('Could not start checkout');
        setSubmitting(false);
      }
    } catch (e) {
      toast.error(apiErrorMessage(e, 'Could not start checkout'));
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <FadeIn className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-celebrate text-ink-950 shadow-glow">
          <Coffee className="h-7 w-7" />
        </span>
        <h1 className="mt-5 font-fraunces text-h1 text-text-primary">Buy us a coffee</h1>
        <p className="mx-auto mt-3 max-w-xl text-body text-text-secondary">
          DreamEvents is free for couples — every cup keeps the platform running, helps us support
          local vendors, and fuels more celebrations across Pakistan.
        </p>
      </FadeIn>

      <FadeIn delay={0.1} className="mt-10">
        <div className="overflow-hidden rounded-2xl border border-border-default bg-surface-raised shadow-sm">
          <div className="border-b border-border-default bg-accent-50 p-5 dark:bg-accent-900/40">
            <h2 className="font-fraunces text-h3 text-text-primary">Your coffee order</h2>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-6">
            <Input label="Name your coffee" placeholder="e.g. A coffee for our wedding" error={errors.coffeeName?.message} {...register('coffeeName')} />

            <div>
              <span className="mb-2 block text-body-sm font-medium text-text-secondary">Pick an amount</span>
              <div className="grid grid-cols-4 gap-2">
                {[250, 500, 1000, 2500].map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('amount-input');
                      if (el) {
                        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
                        setter.call(el, String(a));
                        el.dispatchEvent(new Event('input', { bubbles: true }));
                      }
                    }}
                    className={
                      Number(amount) === a
                        ? 'rounded-lg border-2 border-accent-500 bg-accent-50 py-2.5 text-body-sm font-semibold text-accent-700 dark:bg-accent-900/40 dark:text-accent-400'
                        : 'rounded-lg border border-border-default py-2.5 text-body-sm font-medium text-text-secondary transition-colors hover:border-accent-400'
                    }
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <Input id="amount-input" label="Custom amount (PKR)" type="number" min="100" max="50000" error={errors.amount?.message} {...register('amount')} />

            <div className="flex items-center justify-between rounded-xl bg-gradient-celebrate p-5">
              <div>
                <p className="text-micro font-semibold uppercase tracking-wide text-ink-900/70">Your total</p>
                <p className="font-geist text-price font-bold text-ink-950">
                  PKR {Number(amount || 0).toLocaleString('en-PK')}
                </p>
              </div>
              <Button type="submit" variant="secondary" size="lg" loading={submitting}>
                <Heart className="h-4 w-4 text-accent-600" />
                Pay with Safepay
              </Button>
            </div>
            <p className="text-center text-micro text-text-tertiary">
              Payments are processed securely by Safepay. In demo mode, checkout is simulated.
            </p>
          </form>
        </div>
      </FadeIn>
    </div>
  );
}
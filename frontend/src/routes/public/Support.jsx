import { useState, useEffect, useRef } from 'react';
import { Banknote, Copy, Check, Coffee, Heart } from 'lucide-react';
import { FadeIn } from '../../components/effects/FadeIn.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { cn } from '../../lib/utils.js';

const IBAN = '5590490271961631';
const BANK = 'Bank Alfalah';
const ACCOUNT_HOLDER = 'DreamEvents';
const BRANCH_CODE = '0306';

export default function Support() {
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.select();
    }
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(IBAN);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select the hidden input
      if (inputRef.current) {
        inputRef.current.select();
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const formatIBAN = (iban) => {
    // Show in readable groups: 5590 4902 7196 1631
    const groups = [];
    for (let i = 0; i < iban.length; i += 4) {
      groups.push(iban.slice(i, i + 4));
    }
    return groups.join(' ');
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

      <FadeIn delay={0.1} className="mt-10 space-y-6">
        {/* Bank card-style IBAN display */}
        <div className="overflow-hidden rounded-2xl border border-border-default bg-surface-raised shadow-md dark:border-ink-700">
          {/* Card header */}
          <div className="border-b border-border-default bg-gradient-celebrate px-6 py-4 dark:bg-accent-900/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Banknote className="h-5 w-5 text-ink-950" />
                <span className="font-fraunces text-h3 text-ink-950">Bank Transfer</span>
              </div>
              <span className="rounded-full bg-ink-950/10 px-3 py-1 text-micro font-medium uppercase tracking-wide text-ink-800 dark:text-ink-300">
                PKR Account
              </span>
            </div>
          </div>

          {/* Card body - IBAN display */}
          <div className="p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-micro font-semibold uppercase tracking-widest text-text-tertiary">
                  Account Holder
                </p>
                <p className="font-geist text-body font-semibold text-text-primary">{ACCOUNT_HOLDER}</p>
              </div>
              <div className="text-right">
                <p className="text-micro font-semibold uppercase tracking-widest text-text-tertiary">
                  Bank
                </p>
                <p className="font-geist text-body font-semibold text-text-primary">{BANK}</p>
              </div>
            </div>

            {/* Large IBAN number display */}
            <div className="mb-5">
              <p className="mb-2 text-micro font-semibold uppercase tracking-widest text-text-tertiary">
                Account Number
              </p>
              <div className="flex items-center gap-3">
                <input
                  ref={inputRef}
                  readOnly
                  value={IBAN}
                  className="h-14 w-full rounded-lg border border-border-default bg-surface-sunken px-4 text-h2 font-geist-mono font-bold text-text-primary tracking-wider select-all cursor-default"
                />
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleCopy}
                  className={cn(
                    'shrink-0 transition-all duration-200',
                    copied && 'bg-success-light text-success border-success'
                  )}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Formatted IBAN for readability */}
            <div className="rounded-xl bg-ink-50 px-4 py-3 dark:bg-ink-800/50 dark:border dark:border-ink-700">
              <p className="text-micro text-text-tertiary">Formatted</p>
              <p className="font-geist-mono text-body font-medium text-text-primary">
                {formatIBAN(IBAN)}
              </p>
            </div>

            {/* Branch code */}
            <div className="mt-4 flex items-center justify-between rounded-xl bg-surface-sunken px-4 py-3 dark:bg-ink-800/30">
              <span className="text-body-sm text-text-secondary">Branch Code</span>
              <span className="font-geist-mono font-semibold text-text-primary">{BRANCH_CODE}</span>
            </div>

            {/* Instructions */}
            <div className="mt-5 rounded-xl bg-accent-50 p-4 dark:bg-accent-900/20">
              <div className="flex gap-3">
                <Heart className="mt-0.5 h-5 w-5 shrink-0 text-accent-600" />
                <div>
                  <p className="font-geist text-body font-semibold text-text-primary">
                    How to send support
                  </p>
                  <p className="mt-1 text-body-sm text-text-secondary">
                    Use any mobile banking app, bank transfer, or visit a branch. Send
                    PKR to the account above and mention "DreamEvents Coffee" in the
                    reference/memo field so we know it's from you.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card footer */}
          <div className="border-t border-border-default bg-slate-50 px-6 py-3 dark:border-ink-700 dark:bg-ink-900/30">
            <p className="text-micro text-text-tertiary text-center">
              No platform fees — your support goes directly to keeping DreamEvents running.
            </p>
          </div>
        </div>

        {/* Thank you note */}
        <FadeIn delay={0.15} className="text-center">
          <div className="rounded-2xl border border-border-default bg-surface-raised p-6 shadow-sm dark:border-ink-700">
            <p className="text-body text-text-secondary">
              Whether it's PKR 100 or PKR 5,000 — every contribution helps us build a better
              marketplace for Sukkur's couples.{' '}
              <span className="font-medium text-primary-700 dark:text-primary-400">Thank you for believing in us.</span>
            </p>
          </div>
        </FadeIn>
      </FadeIn>
    </div>
  );
}

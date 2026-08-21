import { Link } from 'react-router-dom';
import { PartyPopper, Heart } from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { FadeIn } from '../../components/effects/FadeIn.jsx';

export default function SupportSuccess() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center">
      <FadeIn>
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-celebrate text-ink-950 shadow-glow">
          <PartyPopper className="h-8 w-8" />
        </span>
        <h1 className="mt-5 font-fraunces text-h1 text-text-primary">Thank you!</h1>
        <p className="mt-3 text-body text-text-secondary">
          Your support means the world to us. Every cup helps DreamEvents keep running and bring
          more celebrations to Sukkur.
        </p>

        <div className="mt-8 w-full rounded-xl border border-border-default bg-surface-raised p-5 text-left shadow-sm">
          <div className="flex items-center gap-3 rounded-xl bg-accent-50 p-4 dark:bg-accent-900/20">
            <Heart className="h-5 w-5 shrink-0 text-accent-600" />
            <div>
              <p className="font-geist text-body font-semibold text-text-primary">Transfer Details</p>
              <p className="mt-1 text-body-sm text-text-secondary">
                Account: <span className="font-mono font-medium">5590490271961631</span>
              </p>
              <p className="mt-0.5 text-body-sm text-text-secondary">
                Bank: <span className="font-medium">Bank Alfalah</span>
              </p>
              <p className="mt-0.5 text-body-sm text-text-secondary">
                Reference: <span className="font-medium">DreamEvents Coffee</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <Link to="/">
            <Button variant="outline">Back home</Button>
          </Link>
          <Link to="/search">
            <Button>Browse vendors</Button>
          </Link>
        </div>
      </FadeIn>
    </div>
  );
}

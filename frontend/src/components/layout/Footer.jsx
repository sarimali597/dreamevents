import { Link } from 'react-router-dom';
import { Heart, Mail, MapPin, Phone, Sparkles, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-ink-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent-400 to-primary-600 text-white">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="font-fraunces text-lg font-semibold text-white">
              Dream<span className="text-accent-400">Events</span>
            </span>
          </div>
          <p className="mt-4 max-w-sm text-body-sm leading-relaxed text-slate-400">
            Sukkur's trusted marketplace for wedding & event vendors. Find the perfect venue, caterer,
            photographer and decor for the most important day of your life.
          </p>
          <a
            href="https://sarimfolio.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-1.5 text-body-sm font-medium text-accent-400 transition-colors hover:text-accent-300"
          >
            Built by Sarim <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        <div>
          <h4 className="font-geist text-sm font-semibold text-white">Explore</h4>
          <ul className="mt-4 space-y-2.5 text-body-sm">
            <li><Link to="/search" className="text-slate-400 transition-colors hover:text-accent-400">Browse vendors</Link></li>
            <li><Link to="/feed" className="text-slate-400 transition-colors hover:text-accent-400">Inspiration</Link></li>
            <li><Link to="/#about" className="text-slate-400 transition-colors hover:text-accent-400">About us</Link></li>
            <li><Link to="/support" className="text-slate-400 transition-colors hover:text-accent-400">Support us</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-geist text-sm font-semibold text-white">Contact</h4>
          <ul className="mt-4 space-y-2.5 text-body-sm text-slate-400">
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0 text-accent-500" /> Sukkur, Sindh, Pakistan</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 shrink-0 text-accent-500" /> hello@dreamevents.pk</li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 shrink-0 text-accent-500" /> +92 300 000 0000</li>
            <li className="flex items-center gap-2"><Heart className="h-4 w-4 shrink-0 text-accent-500" /> Made with love for Pakistani weddings</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-800 py-5 text-center text-micro text-slate-500">
        © {new Date().getFullYear()} DreamEvents. All rights reserved.
      </div>
    </footer>
  );
}

import { cn } from '../../lib/utils.js';

/**
 * MarqueeBand — lightweight infinite-scroll strip (CSS-driven, reduced-motion
 * safe). Duplicates its children once so the -50% translate loops seamlessly.
 */
export function MarqueeBand({ children, className, speed = 28 }) {
  return (
  <div className={cn('marquee overflow-hidden', className)} aria-hidden="false">
  <div className="marquee-track" style={{ animationDuration: `${speed}s` }}>
  <div className="flex items-center gap-10 px-5">{children}</div>
  <div className="flex items-center gap-10 px-5" aria-hidden="true">
  {children}
  </div>
  </div>
  </div>
  );
}

export default MarqueeBand;

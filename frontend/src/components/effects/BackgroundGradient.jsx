import { motion } from 'framer-motion';
import { cn } from '../../lib/utils.js';

export function BackgroundGradient({ className, children }) {
  return (
  <div className={cn('relative overflow-hidden bg-ink-950', className)}>
  <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-ink-950 to-ink-950" />

  <motion.div
  className="absolute rounded-full blur-[120px]"
  style={{
  width: 'min(50vw, 50vh)',
  height: 'min(50vw, 50vh)',
  background: 'radial-gradient(circle, rgba(48, 105, 152, 0.45) 0%, transparent 70%)',
  }}
  animate={{ x: ['0%', '30%', '10%', '0%'], y: ['0%', '20%', '40%', '0%'] }}
  transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
  initial={{ x: '10%', y: '10%' }}
  />

  <motion.div
  className="absolute rounded-full blur-[120px]"
  style={{
  width: 'min(55vw, 55vh)',
  height: 'min(55vw, 55vh)',
  background: 'radial-gradient(circle, rgba(255, 212, 59, 0.18) 0%, transparent 70%)',
  }}
  animate={{ x: ['60%', '40%', '70%', '60%'], y: ['10%', '30%', '5%', '10%'] }}
  transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
  initial={{ x: '60%', y: '10%' }}
  />

  <motion.div
  className="absolute rounded-full blur-[110px]"
  style={{
  width: 'min(45vw, 45vh)',
  height: 'min(45vw, 45vh)',
  background: 'radial-gradient(circle, rgba(107, 163, 208, 0.3) 0%, transparent 70%)',
  }}
  animate={{ x: ['20%', '50%', '30%', '20%'], y: ['60%', '40%', '70%', '60%'] }}
  transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
  initial={{ x: '20%', y: '60%' }}
  />

  <motion.div
  className="absolute rounded-full blur-[100px]"
  style={{
  width: 'min(40vw, 40vh)',
  height: 'min(40vw, 40vh)',
  background: 'radial-gradient(circle, rgba(58, 58, 104, 0.4) 0%, transparent 70%)',
  }}
  animate={{ x: ['40%', '60%', '30%', '40%'], y: ['30%', '50%', '20%', '30%'] }}
  transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
  initial={{ x: '40%', y: '30%' }}
  />

  <div
  className="absolute inset-0 opacity-15"
  style={{
  backgroundImage:
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
  }}
  />

  {children && <div className="relative z-10 h-full w-full">{children}</div>}
  </div>
  );
}
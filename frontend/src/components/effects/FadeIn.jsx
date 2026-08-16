import { motion } from 'framer-motion';

export function FadeIn({ children, delay = 0, y = 16, className, ...props }) {
  return (
  <motion.div
  initial={{ opacity: 0, y }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: '-60px' }}
  transition={{ duration: 0.5, delay, ease: 'easeOut' }}
  className={className}
  {...props}
  >
  {children}
  </motion.div>
  );
}

export function FadeInStagger({ children, className }) {
  return (
  <motion.div
  initial="hidden"
  whileInView="show"
  viewport={{ once: true, margin: '-60px' }}
  variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
  className={className}
  >
  {children}
  </motion.div>
  );
}

export function StaggerItem({ children, className }) {
  return (
  <motion.div
  variants={{
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
  }}
  className={className}
  >
  {children}
  </motion.div>
  );
}
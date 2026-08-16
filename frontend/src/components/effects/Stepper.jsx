import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { cn } from '../../lib/utils.js';

export function Stepper({
  steps = [],
  initialStep = 0,
  onStepChange,
  onComplete,
  backButtonText = 'Back',
  nextButtonText = 'Continue',
  completeButtonText = 'Finish',
  disableStepIndicators = false,
  className,
}) {
  const [currentStep, setCurrentStep] = useState(Math.min(initialStep, steps.length - 1));
  const [completed, setCompleted] = useState(false);

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  const goTo = (i) => {
  const next = Math.max(0, Math.min(i, steps.length - 1));
  setCurrentStep(next);
  onStepChange?.(next);
  };

  const next = () => {
  if (isLast) {
  setCompleted(true);
  onComplete?.();
  } else {
  goTo(currentStep + 1);
  }
  };

  if (completed) {
  return (
  <motion.div
  initial={{ opacity: 0, scale: 0.96 }}
  animate={{ opacity: 1, scale: 1 }}
  className="flex flex-col items-center gap-4 rounded-lg border border-accent-200 bg-accent-50 px-6 py-14 text-center dark:border-accent-800 dark:bg-accent-900/40"
  >
  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-500 text-ink-950">
  <Check className="h-7 w-7" />
  </div>
  <h3 className="font-fraunces text-h2 text-text-primary">All set — congratulations!</h3>
  <p className="max-w-md text-body-sm text-text-secondary">
  You have completed every step. Your changes are saved and live on DreamEvents.
  </p>
  </motion.div>
  );
  }

  return (
  <div className={cn('flex flex-col gap-6', className)}>
  {!disableStepIndicators && (
  <ol className="flex items-center gap-2">
  {steps.map((s, i) => {
  const isActive = i === currentStep;
  const isDone = i < currentStep;
  return (
  <li key={s.title} className="flex flex-1 items-center gap-2">
  <button
  type="button"
  onClick={() => isDone && goTo(i)}
  className={cn(
  'flex items-center gap-2 rounded-full px-3 py-1.5 text-micro font-medium transition-colors',
  isActive && 'bg-primary-600 text-white dark:bg-primary-500',
  isDone && 'bg-success-light text-success hover:bg-success/20 dark:bg-success/15',
  !isActive && !isDone && 'bg-slate-100 text-text-tertiary dark:bg-ink-800'
  )}
  >
  {isDone ? <Check className="h-3 w-3" /> : <span>{i + 1}</span>}
  <span className="hidden sm:inline">{s.title}</span>
  </button>
  {i < steps.length - 1 && (
  <span className="h-px flex-1 bg-border-default dark:bg-ink-700" />
  )}
  </li>
  );
  })}
  </ol>
  )}

  <AnimatePresence mode="wait">
  <motion.div
  key={currentStep}
  initial={{ opacity: 0, x: 24 }}
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: -24 }}
  transition={{ duration: 0.22 }}
  className="flex-1"
  >
  {step?.content}
  </motion.div>
  </AnimatePresence>

  <div className="flex items-center justify-between gap-3">
  <button
  type="button"
  onClick={() => goTo(currentStep - 1)}
  disabled={currentStep === 0}
  className="inline-flex h-10 items-center gap-2 rounded-lg border border-border-default px-4 text-sm font-medium text-text-secondary transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-ink-800"
  >
  <ArrowLeft className="h-4 w-4" />
  {backButtonText}
  </button>
  <button
  type="button"
  onClick={next}
  className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary-600 px-5 text-sm font-medium text-white transition-colors hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
  >
  {isLast ? completeButtonText : nextButtonText}
  <ArrowRight className="h-4 w-4" />
  </button>
  </div>
  </div>
  );
}

export function StepList({ steps = [], className }) {
  return (
  <div className={cn('grid gap-4 sm:grid-cols-2', className)}>
  {steps.map((s) => (
  <div
  key={s.title}
  className="flex items-start gap-4 rounded-lg border border-border-default bg-surface-raised p-4"
  >
  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 font-geist text-sm font-semibold text-primary-700 dark:bg-primary-900 dark:text-primary-400">
  {s.icon || <Check className="h-4 w-4" />}
  </span>
  <div>
  <h4 className="font-geist text-sm font-semibold text-text-primary">{s.title}</h4>
  {s.description && (
  <p className="mt-1 text-body-sm text-text-secondary">{s.description}</p>
  )}
  </div>
  </div>
  ))}
  </div>
  );
}
import { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils.js';

export function TypeText({
  texts = ['DreamEvents'],
  typingSpeed = 70,
  deletingSpeed = 40,
  pauseDuration = 1800,
  showCursor = true,
  cursorCharacter = '|',
  className,
  cursorClassName,
}) {
  const [display, setDisplay] = useState('');
  const [phase, setPhase] = useState('typing');
  const [index, setIndex] = useState(0);
  const timeouts = useRef([]);

  useEffect(() => {
  const word = texts[index % texts.length];
  let t;

  if (phase === 'typing') {
  if (display.length < word.length) {
  t = setTimeout(() => setDisplay(word.slice(0, display.length + 1)), typingSpeed);
  } else {
  t = setTimeout(() => setPhase('pause'), pauseDuration);
  }
  } else if (phase === 'pause') {
  t = setTimeout(() => setPhase('deleting'), pauseDuration / 2);
  } else {
  if (display.length > 0) {
  t = setTimeout(() => setDisplay(display.slice(0, -1)), deletingSpeed);
  } else {
  setIndex((i) => (i + 1) % texts.length);
  setPhase('typing');
  }
  }
  timeouts.current.push(t);
  return () => timeouts.current.forEach(clearTimeout);
  }, [display, phase, index, texts, typingSpeed, deletingSpeed, pauseDuration]);

  return (
  <span className={cn('inline-block', className)}>
  {display}
  {showCursor && (
  <span
  className={cn(
  'ml-0.5 inline-block w-[0.08em] animate-pulse font-normal text-accent-500',
  cursorClassName
  )}
  >
  {cursorCharacter}
  </span>
  )}
  </span>
  );
}
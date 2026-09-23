import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

function AnimatedNumber({ value, prefix = '' }) {
  const spring = useSpring(0, { stiffness: 90, damping: 20 });
  const display = useTransform(spring, (v) => `${prefix}${Math.round(v).toLocaleString()}`);
  const [text, setText] = useState(`${prefix}0`);

  useEffect(() => {
    spring.set(value || 0);
  }, [value]);

  useEffect(() => {
    const unsub = display.on('change', (v) => setText(v));
    return unsub;
  }, [display]);

  return <>{text}</>;
}

export default function StatCard({ icon: Icon, label, value, prefix = '', accent, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: 'easeOut' }}
      className="card p-5 flex items-start justify-between"
    >
      <div>
        <p className="text-xs font-medium text-ink/50 dark:text-paper/50 mb-2">{label}</p>
        <p className="font-display text-2xl md:text-3xl font-bold tracking-tight">
          <AnimatedNumber value={value} prefix={prefix} />
        </p>
      </div>
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${accent}1A`, color: accent }}
      >
        <Icon size={18} />
      </div>
    </motion.div>
  );
}

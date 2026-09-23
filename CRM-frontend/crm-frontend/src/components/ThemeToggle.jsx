import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggle}
      aria-label="Toggle black and white mode"
      className="relative w-14 h-8 rounded-full border border-black/10 dark:border-white/15 bg-paper-dim dark:bg-ink-soft transition-colors flex items-center px-1"
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        className="w-6 h-6 rounded-full bg-ink dark:bg-amber-400 flex items-center justify-center text-paper dark:text-ink shadow-sm"
        style={{ marginLeft: isDark ? '1.5rem' : 0 }}
      >
        {isDark ? <Moon size={13} /> : <Sun size={13} />}
      </motion.div>
    </button>
  );
}

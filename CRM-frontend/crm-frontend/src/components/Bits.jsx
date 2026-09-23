import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="card flex flex-col items-center justify-center text-center py-16 px-6"
    >
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
          <Icon size={20} />
        </div>
      )}
      <p className="font-display font-semibold text-base mb-1">{title}</p>
      {subtitle && (
        <p className="text-sm text-ink/50 dark:text-paper/50 max-w-xs mb-4">{subtitle}</p>
      )}
      {action}
    </motion.div>
  );
}

export function Pagination({ page, pages, onChange }) {
  if (!pages || pages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 pt-6">
      <button
        className="btn-secondary !px-3 !py-2"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        <ChevronLeft size={15} />
      </button>
      <span className="text-sm text-ink/60 dark:text-paper/60 px-2">
        Page {page} of {pages}
      </span>
      <button
        className="btn-secondary !px-3 !py-2"
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
      >
        <ChevronRight size={15} />
      </button>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-ink/50 dark:text-paper/50 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Spinner({ size = 16, className = '' }) {
  return (
    <span
      className={`inline-block border-2 border-current border-t-transparent rounded-full animate-spin ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

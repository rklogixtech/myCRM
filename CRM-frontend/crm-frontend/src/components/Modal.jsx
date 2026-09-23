import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({ title, onClose, children, wide = false }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 14 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className={`card w-full ${wide ? 'max-w-xl' : 'max-w-md'} max-h-[88vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 dark:border-white/5 sticky top-0 bg-white dark:bg-ink-soft z-10">
          <h3 className="font-display font-semibold text-lg">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </motion.div>
  );
}

import { motion } from "framer-motion";

export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-paper dark:bg-ink transition-colors">
      <motion.div
        className="flex flex-col items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="relative w-10 h-10">
          <motion.span className="absolute inset-0 rounded-full border-2 border-ink/10 dark:border-paper/10" />
          <motion.span
            className="absolute inset-0 rounded-full border-2 border-t-amber-500 border-transparent"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
          />
        </div>
        <span className="text-sm text-ink/50 dark:text-paper/50 font-body">
          Loading Rklogix…
        </span>
      </motion.div>
    </div>
  );
}

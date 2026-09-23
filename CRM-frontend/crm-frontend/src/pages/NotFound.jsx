import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-paper dark:bg-ink transition-colors text-center px-6">
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-7xl font-bold text-amber-500 mb-2"
      >
        404
      </motion.p>
      <p className="font-display text-xl font-semibold mb-2">Page not found</p>
      <p className="text-sm text-ink/50 dark:text-paper/50 mb-6">
        This entry doesn't exist in the Rklogix.
      </p>
      <Link to="/" className="btn-primary">
        Back to dashboard
      </Link>
    </div>
  );
}

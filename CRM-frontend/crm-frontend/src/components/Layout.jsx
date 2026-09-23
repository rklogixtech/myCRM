import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Handshake,
  CalendarClock,
  ScrollText,
  UserRound,
  LogOut,
  BookOpen,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";
import Avatar from "./Avatar";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/leads", label: "Leads", icon: Users },
  { to: "/deals", label: "Deals", icon: Handshake },
  { to: "/followups", label: "Follow-ups", icon: CalendarClock },
  { to: "/audit-logs", label: "Audit Log", icon: ScrollText, roles: ["admin"] },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-paper dark:bg-ink transition-colors">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-black/5 dark:border-white/5 bg-white dark:bg-ink-soft">
        <div className="h-16 flex items-center gap-2.5 px-6 border-b border-black/5 dark:border-white/5">
          <div className="w-8 h-8 rounded-lg bg-ink dark:bg-amber-400 flex items-center justify-center">
            <BookOpen size={16} className="text-amber-300 dark:text-ink" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight">
            Rklogix
          </span>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1">
          {NAV.filter(
            (item) => !item.roles || item.roles.includes(user?.role),
          ).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "text-ink dark:text-paper"
                    : "text-ink/50 dark:text-paper/50 hover:text-ink dark:hover:text-paper hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 bg-amber-100 dark:bg-amber-400/10 rounded-lg"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 32,
                      }}
                    />
                  )}
                  <item.icon size={17} className="relative z-10" />
                  <span className="relative z-10">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-black/5 dark:border-white/5 space-y-1">
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-amber-100 dark:bg-amber-400/10 text-ink dark:text-paper"
                  : "text-ink/50 dark:text-paper/50 hover:text-ink dark:hover:text-paper hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
              }`
            }
          >
            <UserRound size={17} />
            Profile
          </NavLink>
          <button
            onClick={() => setConfirmOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-ink/50 dark:text-paper/50 hover:text-stage-lost hover:bg-stage-lost/5 transition-colors"
          >
            <LogOut size={17} />
            Log out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-black/5 dark:border-white/5 bg-white/70 dark:bg-ink-soft/70 backdrop-blur sticky top-0 z-20">
          <MobileNav user={user} />
          <div className="hidden md:block" />
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2.5 pl-1 pr-1 py-1 rounded-full hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-colors"
            >
              <Avatar name={user?.name} src={user?.avatar} size={32} />
              <span className="hidden sm:block text-sm font-medium pr-2">
                {user?.name}
              </span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {confirmOpen && (
          <ConfirmLogout
            onCancel={() => setConfirmOpen(false)}
            onConfirm={handleLogout}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function MobileNav({ user }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2"
      >
        <div className="w-7 h-7 rounded-lg bg-ink dark:bg-amber-400 flex items-center justify-center">
          <BookOpen size={14} className="text-amber-300 dark:text-ink" />
        </div>
        <span className="font-display font-bold">Rklogix</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute left-0 right-0 top-16 bg-white dark:bg-ink-soft border-b border-black/5 dark:border-white/5 p-3 space-y-1 z-30"
          >
            {NAV.filter(
              (item) => !item.roles || item.roles.includes(user?.role),
            ).map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
              >
                <item.icon size={17} />
                {item.label}
              </NavLink>
            ))}
            <NavLink
              to="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
            >
              <UserRound size={17} />
              Profile
            </NavLink>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ConfirmLogout({ onCancel, onConfirm }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="card w-full max-w-sm p-6"
      >
        <h3 className="font-display font-semibold text-lg mb-1.5">Log out?</h3>
        <p className="text-sm text-ink/60 dark:text-paper/60 mb-5">
          You'll need to sign in again to access the CRM.
        </p>
        <div className="flex justify-end gap-2">
          <button className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn-danger" onClick={onConfirm}>
            Log out
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

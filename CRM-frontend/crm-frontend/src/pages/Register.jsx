import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  BookOpen,
  Eye,
  EyeOff,
  ArrowRight,
  Mail,
  Lock,
  User,
  Shield,
  Zap,
  Users,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/ThemeToggle";
import { Spinner } from "../components/Bits";

const EASE = [0.22, 1, 0.36, 1];

/* ============================================================
   SPLIT TEXT REVEAL
   ============================================================ */
function SplitText({ text, delay = 0, className = "" }) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((word, wi) => (
        <span key={wi} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: "110%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            transition={{ duration: 0.9, delay: delay + wi * 0.06, ease: EASE }}
          >
            {word}
            {wi < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/* ============================================================
   MAGNETIC BUTTON
   ============================================================ */
function MagneticButton({ children, className, disabled, ...props }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15 });
  const sy = useSpring(y, { stiffness: 200, damping: 15 });

  const handleMove = (e) => {
    if (disabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const relX = e.clientX - rect.left - rect.width / 2;
    const relY = e.clientY - rect.top - rect.height / 2;
    x.set(relX * 0.15);
    y.set(relY * 0.25);
  };
  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ x: sx, y: sy }}
      {...props}
      className={className}
    >
      {children}
    </motion.button>
  );
}

/* ============================================================
   AMBIENT BACKGROUND — cursor-parallax mesh + beams + grain
   ============================================================ */
function AmbientBackground() {
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const sx = useSpring(mx, { stiffness: 60, damping: 20 });
  const sy = useSpring(my, { stiffness: 60, damping: 20 });
  const bgX = useTransform(sx, [0, 1], ["-8%", "8%"]);
  const bgY = useTransform(sy, [0, 1], ["-8%", "8%"]);

  useEffect(() => {
    const handler = (e) => {
      mx.set(e.clientX / window.innerWidth);
      my.set(e.clientY / window.innerHeight);
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [mx, my]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div className="absolute -inset-[20%]" style={{ x: bgX, y: bgY }}>
        <motion.div
          className="absolute top-[10%] left-[15%] h-[42rem] w-[42rem] rounded-full blur-[130px]"
          style={{
            background:
              "radial-gradient(circle, rgba(251,191,36,0.32), transparent 60%)",
          }}
          animate={{
            x: [0, 80, -40, 0],
            y: [0, -60, 60, 0],
            scale: [1, 1.15, 0.95, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[5%] right-[10%] h-[38rem] w-[38rem] rounded-full blur-[140px]"
          style={{
            background:
              "radial-gradient(circle, rgba(99,102,241,0.28), transparent 60%)",
          }}
          animate={{
            x: [0, -70, 50, 0],
            y: [0, 50, -50, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-[45%] left-[40%] h-[30rem] w-[30rem] rounded-full blur-[120px]"
          style={{
            background:
              "radial-gradient(circle, rgba(236,72,153,0.18), transparent 60%)",
          }}
          animate={{ x: [0, 60, -60, 0], y: [0, -40, 40, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute top-0 h-[140%] w-[1px] origin-top"
          style={{
            left: `${20 + i * 30}%`,
            background:
              "linear-gradient(to bottom, transparent, rgba(255,255,255,0.06), transparent)",
          }}
          animate={{ rotate: [-8, 8, -8], opacity: [0.3, 0.7, 0.3] }}
          transition={{
            duration: 10 + i * 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      <div
        className="absolute inset-0 opacity-[0.15] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
}

/* ============================================================
   FEATURE ROW
   ============================================================ */
function FeatureRow({ icon: Icon, text, delay }) {
  return (
    <motion.li
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay, ease: EASE }}
      whileHover={{ x: 4 }}
      className="flex items-center gap-3 text-[13.5px] text-white/70 group cursor-default"
    >
      <motion.span
        whileHover={{ scale: 1.15, rotate: 8 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
        className="w-6 h-6 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center group-hover:border-amber-400/40 transition-colors"
      >
        <Icon size={12} className="text-amber-400" />
      </motion.span>
      {text}
    </motion.li>
  );
}

/* ============================================================
   STAT COUNTER
   ============================================================ */
function Counter({ to, delay = 0, suffix = "" }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      const start = performance.now();
      const dur = 1400;
      const tick = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setN(Math.floor(eased * to));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(t);
  }, [to, delay]);
  return (
    <>
      {n.toLocaleString()}
      {suffix}
    </>
  );
}

/* ============================================================
   ROLE SELECT — custom animated dropdown
   ============================================================ */
const ROLES = [
  {
    value: "sales",
    label: "Sales",
    desc: "Manage leads & pipeline",
    icon: Zap,
  },
  {
    value: "admin",
    label: "Admin",
    desc: "Full workspace control",
    icon: Shield,
  },
];

function RoleSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = ROLES.find((r) => r.value === value) || ROLES[0];

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className={`relative w-full flex items-center justify-between rounded-xl border bg-white dark:bg-white/[0.03]
                    border-black/[0.08] dark:border-white/[0.08]
                    py-3.5 pl-11 pr-4 text-sm text-left
                    transition-all duration-300
                    ${open ? "border-amber-500/60 ring-4 ring-amber-500/10" : ""}`}
      >
        <span className="absolute left-4 text-black/55 dark:text-white/55">
          <selected.icon size={16} />
        </span>
        <span className="flex flex-col leading-tight">
          <span className="text-[13.5px] font-medium text-ink dark:text-paper">
            {selected.label}
          </span>
          <span className="text-[11px] text-black/40 dark:text-white/40 mt-0.5">
            {selected.desc}
          </span>
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: EASE }}
          className="text-black/40 dark:text-white/40"
        >
          <ChevronDown size={16} />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="absolute z-30 mt-2 w-full rounded-xl border border-black/[0.08] dark:border-white/[0.08]
                       bg-white dark:bg-[#141418] shadow-xl shadow-black/10 dark:shadow-black/40
                       p-1.5 origin-top"
          >
            {ROLES.map((r, i) => {
              const Icon = r.icon;
              const active = r.value === value;
              return (
                <motion.button
                  key={r.value}
                  type="button"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.25 }}
                  onClick={() => {
                    onChange(r.value);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left
                              transition-colors
                              ${
                                active
                                  ? "bg-amber-500/10 dark:bg-amber-500/15"
                                  : "hover:bg-black/[0.04] dark:hover:bg-white/[0.05]"
                              }`}
                >
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center
                                ${
                                  active
                                    ? "bg-gradient-to-br from-amber-400 to-orange-500 text-[#0b0b0f]"
                                    : "bg-black/[0.04] dark:bg-white/[0.06] text-black/60 dark:text-white/60"
                                }`}
                  >
                    <Icon size={13} />
                  </span>
                  <span className="flex flex-col leading-tight">
                    <span className="text-[13px] font-medium text-ink dark:text-paper">
                      {r.label}
                    </span>
                    <span className="text-[11px] text-black/40 dark:text-white/40">
                      {r.desc}
                    </span>
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============================================================
   PASSWORD STRENGTH
   ============================================================ */
function strength(pw) {
  let s = 0;
  if (pw.length >= 6) s++;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 4);
}
const STRENGTH_META = [
  { label: "", color: "bg-black/10 dark:bg-white/10", w: "0%" },
  { label: "Weak", color: "bg-red-500", w: "25%" },
  { label: "Fair", color: "bg-orange-500", w: "50%" },
  { label: "Good", color: "bg-amber-500", w: "75%" },
  { label: "Strong", color: "bg-emerald-500", w: "100%" },
];

/* ============================================================
   MAIN REGISTER
   ============================================================ */
export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "sales",
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focused, setFocused] = useState(null);

  const pwScore = strength(form.password);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      toast.success("Account created");
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Could not create account");
    } finally {
      setLoading(false);
    }
  };

  const inputWrap = (field) =>
    `relative flex items-center rounded-xl border bg-white dark:bg-white/[0.03] transition-all duration-300 ${
      focused === field
        ? "border-amber-500/60 ring-4 ring-amber-500/10"
        : "border-black/[0.08] dark:border-white/[0.08]"
    }`;

  const input =
    "w-full bg-transparent py-3.5 pl-11 pr-11 text-sm outline-none " +
    "text-ink dark:text-paper placeholder:text-black/30 dark:placeholder:text-white/30";

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.05fr_1fr] bg-white dark:bg-[#0a0a0a]">
      {/* ════════════════ LEFT — brand panel ════════════════ */}
      <div className="hidden lg:flex relative overflow-hidden bg-[#0b0b0f]">
        <AmbientBackground />

        <div className="relative z-10 flex flex-col justify-between w-full p-14 text-white">
          {/* logo */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="flex items-center gap-2.5"
          >
            <motion.div
              whileHover={{ rotate: 12, scale: 1.08 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25"
            >
              <BookOpen size={17} className="text-[#0b0b0f]" />
            </motion.div>
            <span className="font-display font-semibold text-[15px] tracking-tight">
              Rklogix CRM
            </span>
          </motion.div>

          {/* hero copy */}
          <div className="max-w-lg">
            <h1 className="font-display text-[46px] leading-[1.06] font-semibold tracking-[-0.025em] mb-6">
              <SplitText text="Start closing" delay={0.15} />
              <br />
              <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
                <SplitText text="more deals," delay={0.4} />
              </span>
              <br />
              <SplitText text="starting today." delay={0.7} />
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.1, ease: EASE }}
              className="text-white/55 text-[15px] leading-relaxed max-w-md"
            >
              Set up your workspace in under a minute. No credit card, no
              onboarding calls — just a clean pipeline that works from day one.
            </motion.p>

            {/* feature list */}
            <ul className="mt-10 space-y-3.5">
              <FeatureRow
                icon={Sparkles}
                text="Unlimited leads & pipeline stages"
                delay={1.3}
              />
              <FeatureRow
                icon={Users}
                text="Invite your whole sales team"
                delay={1.45}
              />
              <FeatureRow
                icon={Shield}
                text="SSO-ready, secure by default"
                delay={1.6}
              />
            </ul>

            {/* animated stat strip */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.9, ease: EASE }}
              className="mt-12 flex items-center gap-8"
            >
              <div>
                <div className="text-[22px] font-semibold text-white tabular-nums">
                  <Counter to={60} delay={2000} suffix="s" />
                </div>
                <div className="text-[11px] text-white/40 uppercase tracking-wider mt-0.5">
                  Setup time
                </div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <div className="text-[22px] font-semibold text-white tabular-nums">
                  <Counter to={0} delay={2100} suffix="$0" />
                </div>
                <div className="text-[11px] text-white/40 uppercase tracking-wider mt-0.5">
                  To start
                </div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <div className="text-[22px] font-semibold text-white tabular-nums">
                  <Counter to={14} delay={2200} suffix="-day" />
                </div>
                <div className="text-[11px] text-white/40 uppercase tracking-wider mt-0.5">
                  Free trial
                </div>
              </div>
            </motion.div>
          </div>

          {/* footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 2.3 }}
            className="flex items-center gap-3 text-[12.5px] text-white/35"
          >
            <span>© {new Date().getFullYear()} Rklogix</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>Built for modern revenue teams</span>
          </motion.div>
        </div>
      </div>

      {/* ════════════════ RIGHT — form ════════════════ */}
      <div className="relative flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute top-6 right-6 z-20"
        >
          <ThemeToggle />
        </motion.div>

        {/* mobile logo */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="lg:hidden flex items-center gap-2.5 mb-10 justify-center"
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <BookOpen size={17} className="text-[#0b0b0f]" />
          </div>
          <span className="font-display font-semibold text-[15px] tracking-tight">
            Rklogix CRM
          </span>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: { staggerChildren: 0.07, delayChildren: 0.15 },
            },
          }}
          className="w-full max-w-[400px] mx-auto"
        >
          {/* heading */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 14 },
              show: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.6, ease: EASE },
              },
            }}
            className="mb-8"
          >
            <h2 className="font-display text-[26px] font-semibold tracking-[-0.01em] mb-2">
              Create your account
            </h2>
            <p className="text-[14px] text-black/50 dark:text-white/50">
              Join the team pipeline in under a minute.
            </p>
          </motion.div>

          <form onSubmit={submit} className="space-y-5">
            {/* NAME */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 14 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.55, ease: EASE },
                },
              }}
              className="space-y-2"
            >
              <label className="block text-[13px] font-medium text-black/70 dark:text-white/70">
                Full name
              </label>
              <div className={inputWrap("name")}>
                <motion.span
                  animate={{
                    color:
                      focused === "name" ? "#f59e0b" : "rgba(120,120,120,0.55)",
                    scale: focused === "name" ? 1.1 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  className="absolute left-4"
                >
                  <User size={16} />
                </motion.span>
                <input
                  required
                  autoFocus
                  onFocus={() => setFocused("name")}
                  onBlur={() => setFocused(null)}
                  className={input}
                  placeholder="Raj kumawat"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
            </motion.div>

            {/* EMAIL */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 14 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.55, ease: EASE },
                },
              }}
              className="space-y-2"
            >
              <label className="block text-[13px] font-medium text-black/70 dark:text-white/70">
                Email
              </label>
              <div className={inputWrap("email")}>
                <motion.span
                  animate={{
                    color:
                      focused === "email"
                        ? "#f59e0b"
                        : "rgba(120,120,120,0.55)",
                    scale: focused === "email" ? 1.1 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  className="absolute left-4"
                >
                  <Mail size={16} />
                </motion.span>
                <input
                  type="email"
                  required
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                  className={input}
                  placeholder="Rklogix@gmail.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </motion.div>

            {/* PASSWORD */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 14 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.55, ease: EASE },
                },
              }}
              className="space-y-2"
            >
              <label className="block text-[13px] font-medium text-black/70 dark:text-white/70">
                Password
              </label>
              <div className={inputWrap("password")}>
                <motion.span
                  animate={{
                    color:
                      focused === "password"
                        ? "#f59e0b"
                        : "rgba(120,120,120,0.55)",
                    scale: focused === "password" ? 1.1 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  className="absolute left-4"
                >
                  <Lock size={16} />
                </motion.span>
                <input
                  type={showPw ? "text" : "password"}
                  required
                  minLength={6}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  className={input}
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.85 }}
                  whileHover={{ scale: 1.1 }}
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3.5 text-black/40 dark:text-white/40 hover:text-amber-500 transition-colors"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={showPw ? "off" : "on"}
                      initial={{ opacity: 0, rotate: -45, scale: 0.6 }}
                      animate={{ opacity: 1, rotate: 0, scale: 1 }}
                      exit={{ opacity: 0, rotate: 45, scale: 0.6 }}
                      transition={{ duration: 0.18 }}
                      className="block"
                    >
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </motion.span>
                  </AnimatePresence>
                </motion.button>
              </div>

              {/* strength meter */}
              <AnimatePresence>
                {form.password && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: EASE }}
                    className="overflow-hidden pt-1"
                  >
                    <div className="flex items-center gap-2">
                      <div className="relative h-1 flex-1 rounded-full bg-black/[0.06] dark:bg-white/[0.06] overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${STRENGTH_META[pwScore].color}`}
                          initial={false}
                          animate={{ width: STRENGTH_META[pwScore].w }}
                          transition={{ duration: 0.35, ease: EASE }}
                        />
                      </div>
                      <span className="text-[11px] font-medium text-black/50 dark:text-white/50 w-12 text-right tabular-nums">
                        {STRENGTH_META[pwScore].label}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* ROLE */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 14 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.55, ease: EASE },
                },
              }}
              className="space-y-2"
            >
              <label className="block text-[13px] font-medium text-black/70 dark:text-white/70">
                Role
              </label>
              <RoleSelect
                value={form.role}
                onChange={(role) => setForm({ ...form, role })}
              />
            </motion.div>

            {/* ERROR */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 4 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="overflow-hidden"
                >
                  <motion.div
                    initial={{ x: -8 }}
                    animate={{ x: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="text-[13px] text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200/60 dark:border-red-500/20 rounded-lg px-3.5 py-2.5"
                  >
                    {error}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* SUBMIT */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 14 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.55, ease: EASE },
                },
              }}
              className="pt-1"
            >
              <MagneticButton
                type="submit"
                disabled={loading}
                whileTap={!loading ? { scale: 0.97 } : {}}
                className="relative w-full flex items-center justify-center gap-2 rounded-xl
                           bg-[#0b0b0f] dark:bg-white text-white dark:text-[#0b0b0f]
                           text-[14px] font-medium py-3.5
                           shadow-[0_1px_0_rgba(255,255,255,0.1)_inset,0_10px_30px_-12px_rgba(0,0,0,0.5)]
                           hover:bg-black dark:hover:bg-white/95
                           transition-colors
                           disabled:opacity-60 disabled:cursor-not-allowed
                           overflow-hidden group"
              >
                <motion.span
                  className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                  initial={{ x: "-150%" }}
                  animate={{ x: "450%" }}
                  transition={{
                    duration: 2.8,
                    repeat: Infinity,
                    repeatDelay: 2.2,
                    ease: "easeInOut",
                  }}
                />
                <span className="relative flex items-center gap-2">
                  {loading ? (
                    <Spinner />
                  ) : (
                    <>
                      Create account
                      <motion.span
                        animate={{ x: [0, 4, 0] }}
                        transition={{
                          duration: 1.6,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <ArrowRight size={15} />
                      </motion.span>
                    </>
                  )}
                </span>
              </MagneticButton>
            </motion.div>
          </form>

          {/* DIVIDER */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 14 },
              show: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.55, ease: EASE },
              },
            }}
            className="flex items-center gap-3 my-7"
          >
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1.1, duration: 0.7, ease: EASE }}
              style={{ transformOrigin: "right" }}
              className="h-px flex-1 bg-black/[0.08] dark:bg-white/[0.08]"
            />
            <span className="text-[11.5px] uppercase tracking-wider text-black/35 dark:text-white/35">
              or
            </span>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1.1, duration: 0.7, ease: EASE }}
              style={{ transformOrigin: "left" }}
              className="h-px flex-1 bg-black/[0.08] dark:bg-white/[0.08]"
            />
          </motion.div>

          {/* LOGIN LINK */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 14 },
              show: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.55, ease: EASE },
              },
            }}
          >
            <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.985 }}>
              <Link
                to="/login"
                className="relative w-full flex items-center justify-center rounded-xl
                           border border-black/[0.08] dark:border-white/[0.08]
                           bg-white dark:bg-white/[0.03]
                           hover:bg-black/[0.02] dark:hover:bg-white/[0.06]
                           hover:border-amber-500/40
                           py-3.5 text-[14px] font-medium
                           text-ink dark:text-paper
                           transition-colors overflow-hidden group"
              >
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-amber-400/[0.08] to-transparent" />
                <span className="relative">Sign in to existing account</span>
              </Link>
            </motion.div>
          </motion.div>

          {/* TERMS */}
          <motion.p
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { duration: 0.6, delay: 0.3 } },
            }}
            className="text-center text-[12px] text-black/40 dark:text-white/40 mt-8"
          >
            By continuing, you agree to our{" "}
            <Link
              to="/terms"
              className="underline underline-offset-2 hover:text-black/70 dark:hover:text-white/70 transition-colors"
            >
              Terms
            </Link>{" "}
            and{" "}
            <Link
              to="/privacy"
              className="underline underline-offset-2 hover:text-black/70 dark:hover:text-white/70 transition-colors"
            >
              Privacy Policy
            </Link>
            .
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}

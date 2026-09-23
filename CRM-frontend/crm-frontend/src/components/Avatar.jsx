export default function Avatar({ name, src, size = 36, className = '' }) {
  const initials = (name || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{ width: size, height: size }}
        className={`rounded-full object-cover border border-black/10 dark:border-white/10 ${className}`}
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      className={`rounded-full bg-ink text-amber-300 dark:bg-amber-400 dark:text-ink flex items-center justify-center font-display font-semibold shrink-0 ${className}`}
    >
      {initials || 'U'}
    </div>
  );
}

import { useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'

export const cx = (...a) => a.filter(Boolean).join(' ')

// ── Badge / Pill ──
export function Badge({ tint, fg, children }) {
  return (
    <span style={{ background: tint, color: fg }}
      className="text-[11px] font-semibold px-2 py-[3px] rounded-lg whitespace-nowrap">
      {children}
    </span>
  )
}

// ── Input base styles ──
export const inputCls =
  'w-full bg-[var(--subtle)] border border-[var(--line)] rounded-[12px] px-4 py-3 text-[14px] ' +
  'text-[var(--ink)] outline-none transition-colors focus:border-[var(--blue)] focus:bg-white ' +
  'placeholder:text-[var(--ink-4)]'

export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-[12px] font-medium text-[var(--ink-3)] mb-1.5 block">{label}</span>
      {children}
    </label>
  )
}

// ── Primary button ──
export function Button({ children, onClick, loading, variant = 'primary', className, ...rest }) {
  const base = 'pressable w-full rounded-[14px] py-3.5 text-[14px] font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60'
  const styles = {
    primary: { background: 'var(--blue)', color: '#fff', boxShadow: 'var(--sh-blue)' },
    ghost:   { background: 'var(--subtle)', color: 'var(--ink-2)', border: '1px solid var(--line)' },
    danger:  { background: 'var(--red)', color: '#fff' },
  }
  return (
    <button onClick={onClick} disabled={loading} style={styles[variant]} className={cx(base, className)} {...rest}>
      {loading && <Loader2 className="w-4 h-4 spin" />}
      {children}
    </button>
  )
}

// ── Bottom sheet / modal ──
export function Sheet({ open, onClose, title, children }) {
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
  }, [open])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center"
      style={{ animation: 'fadeIn .2s ease' }}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className="relative w-full sm:max-w-md bg-white rounded-t-[26px] sm:rounded-[26px] max-h-[92vh] overflow-y-auto no-scrollbar"
        style={{ animation: 'slideUp .34s cubic-bezier(0.32,0.72,0,1)', boxShadow: 'var(--sh-lg)' }}>
        <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 flex items-center justify-between px-5 py-4 border-b border-[var(--line)]">
          <h3 className="text-[17px] font-bold">{title}</h3>
          <button onClick={onClose} className="pressable w-8 h-8 rounded-full bg-[var(--subtle)] flex items-center justify-center">
            <X className="w-4 h-4 text-[var(--ink-3)]" />
          </button>
        </div>
        <div className="p-5 space-y-4">{children}</div>
      </div>
    </div>
  )
}

// ── Toast ──
export function Toast({ toast }) {
  if (!toast) return null
  const bg = toast.type === 'error' ? 'var(--red)' : toast.type === 'del' ? 'var(--ink)' : 'var(--ink)'
  return (
    <div className="fixed left-1/2 -translate-x-1/2 z-[120] px-5 py-3 rounded-[14px] text-[13px] font-semibold text-white whitespace-nowrap"
      style={{ bottom: 'calc(env(safe-area-inset-bottom) + 92px)', background: bg, boxShadow: 'var(--sh-lg)', animation: 'riseIn .3s var(--ease-out)' }}>
      {toast.msg}
    </div>
  )
}

// ── Loading splash ──
export function Splash() {
  return (
    <div className="h-full flex items-center justify-center bg-[var(--subtle)]">
      <div className="w-12 h-12 rounded-[16px] flex items-center justify-center" style={{ background: 'var(--blue)', boxShadow: 'var(--sh-blue)' }}>
        <Loader2 className="w-6 h-6 text-white spin" />
      </div>
    </div>
  )
}

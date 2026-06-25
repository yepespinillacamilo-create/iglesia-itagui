import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { inputCls, Button } from '../components/ui'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const login = async () => {
    if (!email.trim() || !password) return
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error) setError('Correo o contraseña incorrectos')
    setLoading(false)
  }

  return (
    <div className="h-full flex items-center justify-center px-6 bg-[var(--subtle)]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8 rise r1">
          <div className="w-16 h-16 rounded-[20px] mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'var(--blue)', boxShadow: 'var(--sh-blue)' }}>
            <div className="w-7 h-7 rounded-full border-[3px] border-white flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
          </div>
          <h1 className="text-[24px] font-extrabold tracking-tight">Iglesia Itagüí</h1>
          <p className="text-[14px] text-[var(--ink-3)] mt-1">Panel pastoral</p>
        </div>

        <div className="bg-white border border-[var(--line)] rounded-[20px] p-6 space-y-3 rise r2" style={{ boxShadow: 'var(--sh-md)' }}>
          {error && (
            <div className="rounded-[12px] px-4 py-3 text-[13px] font-medium text-center"
              style={{ background: 'var(--red-tint)', color: 'var(--red)' }}>{error}</div>
          )}
          <input className={inputCls} type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Correo electrónico" autoCapitalize="none" onKeyDown={e => e.key === 'Enter' && login()} />
          <input className={inputCls} type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Contraseña" onKeyDown={e => e.key === 'Enter' && login()} />
          <Button onClick={login} loading={loading}>{loading ? 'Ingresando…' : 'Ingresar'}</Button>
        </div>
      </div>
    </div>
  )
}

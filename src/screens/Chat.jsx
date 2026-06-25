import { useState, useRef, useEffect } from 'react'
import { ArrowUp, Sparkles, AlertTriangle, ClipboardList } from 'lucide-react'
import { isUrgente, isProxima, HOY, fechaLarga } from '../lib/constants'
import { areaIcon } from '../lib/icons'
import ProposalCard from '../components/ProposalCard'

const SUGERENCIAS = [
  'Dar la predicación este domingo sobre el Salmo 23',
  'Reunión de pastorado el miércoles 6pm en la oficina',
  '¿Qué tengo urgente esta semana?',
  'Llevar las sillas para el servicio el sábado',
]

function ConsultaChip({ t, area }) {
  const Icon = area ? areaIcon(area) : ClipboardList
  return (
    <div className="flex gap-2.5 items-center mt-2 p-2.5 rounded-[12px]" style={{ background: 'var(--red-tint)' }}>
      <AlertTriangle className="w-[18px] h-[18px] flex-shrink-0" style={{ color: 'var(--red)' }} />
      <div className="min-w-0">
        <p className="text-[13px] font-bold text-[var(--ink)] truncate">{t.titulo}</p>
        <p className="text-[11.5px] text-[var(--ink-3)]">{area?.nombre}{t.fecha ? ` · ${fechaLarga(t.fecha)}` : ''}</p>
      </div>
    </div>
  )
}

export default function Chat({ data, user }) {
  const { areas, tareas, saveTarea, saveReunion, reload } = data
  const getArea = id => areas.find(a => a.id === id)
  const nombre = (user?.email || '').includes('karen') ? 'Karen' : 'Camilo'

  const [messages, setMessages] = useState([
    { role: 'bot', text: `¡Hola, ${nombre}! 👋 Cuéntame una tarea, agenda una reunión, o pregúntame qué tienes pendiente. Siempre te mostraré una propuesta para que la revises antes de guardar.` },
  ])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const scrollRef = useRef(null)
  const taRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, busy])

  const ejecutarConsulta = (filtro, areaId) => {
    let items = []
    if (filtro === 'urgentes') items = tareas.filter(isUrgente)
    else if (filtro === 'hoy') items = tareas.filter(t => t.fecha === HOY && t.estado !== 'completada')
    else if (filtro === 'semana') items = tareas.filter(isProxima)
    else items = tareas.filter(t => t.estado !== 'completada')
    if (areaId) items = items.filter(t => t.area_id === areaId)
    return items.slice(0, 8)
  }

  const confirmProposal = async (kind, form) => {
    if (kind === 'reunion') {
      await saveReunion({
        titulo: form.titulo, area_id: form.area_id, fecha: form.fecha, hora: form.hora,
        duracion: 60, lugar: form.lugar || '', descripcion: form.notas || '',
        responsable: form.responsable, estado: 'programada',
      })
    } else {
      await saveTarea({
        titulo: form.titulo, area_id: form.area_id, estado: 'pendiente',
        prioridad: form.prioridad || 'media', responsable: form.responsable,
        fecha: form.fecha, notas: form.notas || '',
      })
    }
    await reload()
  }

  const send = async (texto) => {
    const msg = (texto ?? input).trim()
    if (!msg || busy) return
    setInput(''); if (taRef.current) taRef.current.style.height = 'auto'

    const history = messages.filter(m => m.role === 'bot' || m.role === 'me')
      .map(m => ({ role: m.role === 'me' ? 'user' : 'assistant', content: m.text || '' }))
    history.push({ role: 'user', content: msg })

    setMessages(m => [...m, { role: 'me', text: msg }])
    setBusy(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, areas }),
      })
      if (!res.ok) throw new Error('fail')
      const data = await res.json()

      const acciones = data.acciones || []
      const propuestas = []
      let consultaItems = null

      for (const a of acciones) {
        if (a.tipo === 'proponer_tarea' || a.tipo === 'proponer_reunion') {
          propuestas.push(a)
        } else if (a.tipo === 'consultar') {
          consultaItems = ejecutarConsulta(a.filtro, a.area_id)
        }
      }

      setMessages(m => [...m, { role: 'bot', text: data.mensaje || 'Listo.', propuestas, consultaItems }])
    } catch (e) {
      setMessages(m => [...m, { role: 'bot', text: '😕 No pude procesar eso. Revisa tu conexión e intenta de nuevo.', error: true }])
    }
    setBusy(false)
  }

  const autoGrow = () => {
    const ta = taRef.current
    if (ta) { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 100) + 'px' }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-6 pb-3 border-b border-[var(--line)] flex items-center gap-3">
        <div className="w-10 h-10 rounded-[12px] flex items-center justify-center" style={{ background: 'var(--blue)', boxShadow: 'var(--sh-blue)' }}>
          <Sparkles className="w-[22px] h-[22px] text-white" />
        </div>
        <div>
          <h1 className="text-[17px] font-extrabold tracking-tight">Asistente</h1>
          <p className="text-[12px] font-medium flex items-center gap-1.5" style={{ color: 'var(--green)' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--green)' }} /> Siempre disponible
          </p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 space-y-2.5" style={{ background: 'var(--subtle)' }}>
        {messages.map((m, i) => (
          <div key={i} className={`${m.role === 'me' ? 'ml-auto max-w-[85%]' : 'max-w-[90%]'}`} style={{ animation: 'msgIn .42s var(--ease-out) both' }}>
            <div className="px-3.5 py-2.5 text-[13.5px] leading-relaxed"
              style={m.role === 'me'
                ? { background: 'var(--blue)', color: '#fff', borderRadius: '18px 18px 5px 18px', boxShadow: 'var(--sh-blue)' }
                : { background: '#fff', border: '1px solid var(--line)', borderRadius: '18px 18px 18px 5px', boxShadow: 'var(--sh-sm)' }}>
              <p>{m.text}</p>
              {m.propuestas?.map((p, j) => (
                <ProposalCard key={j} proposal={p} areas={areas} nombre={nombre} onConfirm={confirmProposal} />
              ))}
              {m.consultaItems && (
                m.consultaItems.length === 0
                  ? <p className="text-[12px] text-[var(--ink-3)] mt-2 italic">No encontré tareas con ese criterio.</p>
                  : m.consultaItems.map(t => <ConsultaChip key={t.id} t={t} area={getArea(t.area_id)} />)
              )}
            </div>
          </div>
        ))}
        {busy && (
          <div className="max-w-[85%]">
            <div className="inline-flex gap-1 px-4 py-3.5 bg-white border border-[var(--line)]" style={{ borderRadius: '18px 18px 18px 5px' }}>
              {[0, 1, 2].map(i => (
                <span key={i} className="w-[7px] h-[7px] rounded-full" style={{ background: 'var(--ink-4)', animation: `bounce 1.2s ${i * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}

        {messages.length === 1 && !busy && (
          <div className="pt-2 space-y-2">
            <p className="text-[11px] font-semibold text-[var(--ink-4)] uppercase tracking-wide px-1">Prueba con</p>
            {SUGERENCIAS.map((s, i) => (
              <button key={i} onClick={() => send(s)}
                className="pressable block w-full text-left bg-white border border-[var(--line)] rounded-[14px] px-3.5 py-3 text-[13px] text-[var(--ink-2)]"
                style={{ boxShadow: 'var(--sh-sm)', animation: `riseIn .4s ${i * 0.05}s var(--ease-out) both` }}>
                "{s}"
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 py-3 border-t border-[var(--line)] bg-white flex items-end gap-2"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}>
        <textarea ref={taRef} value={input} rows={1}
          onChange={e => { setInput(e.target.value); autoGrow() }}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          placeholder="Escribe o dicta tu mensaje…"
          className="flex-1 bg-[var(--subtle)] border border-[var(--line)] rounded-[20px] px-4 py-3 text-[14px] outline-none resize-none focus:border-[var(--blue)] focus:bg-white transition-colors placeholder:text-[var(--ink-4)] no-scrollbar"
          style={{ maxHeight: 100 }} />
        <button onClick={() => send()} disabled={!input.trim() || busy}
          className="pressable w-11 h-11 rounded-[15px] flex items-center justify-center flex-shrink-0 transition-colors"
          style={{ background: input.trim() && !busy ? 'var(--blue)' : 'var(--line-2)', color: '#fff', boxShadow: input.trim() ? 'var(--sh-blue)' : 'none' }}>
          <ArrowUp className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

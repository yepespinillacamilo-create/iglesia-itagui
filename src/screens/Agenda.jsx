import { useState } from 'react'
import { Plus, Search, Sparkles } from 'lucide-react'
import { MeetingCard } from '../components/cards'
import { inputCls } from '../components/ui'

export default function Agenda({ data, onNew, onEdit }) {
  const { reuniones, areas, deleteReunion, setReunionEstado } = data
  const getArea = id => areas.find(a => a.id === id)

  const [q, setQ] = useState('')
  const [estados, setEstados] = useState(new Set())
  const [filtAreas, setFiltAreas] = useState(new Set())
  const toggle = (set, setter, v) => { const s = new Set(set); s.has(v) ? s.delete(v) : s.add(v); setter(s) }

  const filtered = [...reuniones].filter(r =>
    (estados.size === 0 || estados.has(r.estado))
    && (filtAreas.size === 0 || filtAreas.has(r.area_id))
    && r.titulo.toLowerCase().includes(q.toLowerCase())
  ).sort((a, b) => `${a.fecha}${a.hora}` > `${b.fecha}${b.hora}` ? 1 : -1)

  return (
    <div className="overflow-y-auto h-full no-scrollbar">
      <div className="flex items-center justify-between px-5 pt-6 pb-1">
        <h1 className="text-[23px] font-extrabold tracking-tight">Agenda</h1>
        <button onClick={onNew} className="pressable flex items-center gap-1.5 text-[13px] font-semibold text-white px-3.5 py-2 rounded-[12px]"
          style={{ background: 'var(--blue)', boxShadow: 'var(--sh-blue)' }}>
          <Plus className="w-4 h-4" /> Nueva
        </button>
      </div>
      <p className="text-[13px] text-[var(--ink-3)] px-5 mb-3">{filtered.length} reunión{filtered.length !== 1 ? 'es' : ''}</p>

      <div className="px-5 mb-3">
        <div className="rounded-[12px] p-3 flex items-start gap-2 mb-3" style={{ background: 'var(--violet-tint)' }}>
          <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--violet)' }} />
          <p className="text-[11.5px]" style={{ color: 'var(--violet)' }}>Cada reunión tiene un enlace para agendarla en <b>Google Calendar</b>.</p>
        </div>
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-[var(--ink-4)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input className={inputCls + ' pl-10'} value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar reuniones…" />
        </div>
        <div className="flex gap-1.5 flex-wrap mb-2">
          {[['programada', 'Programada'], ['realizada', 'Realizada'], ['cancelada', 'Cancelada']].map(([v, l]) => (
            <button key={v} onClick={() => toggle(estados, setEstados, v)}
              className="pressable text-[12px] px-3 py-1.5 rounded-[10px] border font-medium transition-colors"
              style={estados.has(v) ? { background: 'var(--ink)', color: '#fff', borderColor: 'var(--ink)' } : { borderColor: 'var(--line)', color: 'var(--ink-3)', background: '#fff' }}>
              {l}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {areas.map(a => (
            <button key={a.id} onClick={() => toggle(filtAreas, setFiltAreas, a.id)}
              className="pressable flex-shrink-0 text-[12px] px-3 py-1.5 rounded-[10px] border font-medium transition-colors"
              style={filtAreas.has(a.id) ? { background: 'var(--ink)', color: '#fff', borderColor: 'var(--ink)' } : { borderColor: 'var(--line)', color: 'var(--ink-3)', background: '#fff' }}>
              {a.emoji} {a.nombre}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 space-y-2 pb-4">
        {filtered.length === 0 ? (
          <div className="rounded-[14px] py-12 text-center" style={{ background: 'var(--subtle)' }}>
            <p className="text-[13px] text-[var(--ink-3)]">Sin reuniones</p>
          </div>
        ) : filtered.map(r => (
          <MeetingCard key={r.id} r={r} area={getArea(r.area_id)} showArea
            onEdit={onEdit} onDelete={deleteReunion} onStatus={setReunionEstado} />
        ))}
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Plus, Search, X } from 'lucide-react'
import { TaskCard } from '../components/cards'
import { isUrgente, isProxima } from '../lib/constants'
import { inputCls } from '../components/ui'

function Chips({ label, options, selected, onToggle, scroll }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-[var(--ink-4)] mb-1.5 uppercase tracking-wide">{label}</p>
      <div className={`flex gap-1.5 ${scroll ? 'overflow-x-auto no-scrollbar pb-1' : 'flex-wrap'}`}>
        {options.map(([v, l]) => (
          <button key={v} onClick={() => onToggle(v)}
            className="pressable flex-shrink-0 text-[12px] px-3 py-1.5 rounded-[10px] border font-medium transition-colors"
            style={selected.has(v)
              ? { background: 'var(--ink)', color: '#fff', borderColor: 'var(--ink)' }
              : { borderColor: 'var(--line)', color: 'var(--ink-3)', background: '#fff' }}>
            {l}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function Tasks({ data, onNew, onEdit }) {
  const { tareas, areas, deleteTarea, setTareaEstado } = data
  const getArea = id => areas.find(a => a.id === id)

  const [q, setQ] = useState('')
  const [estados, setEstados] = useState(new Set())
  const [prios, setPrios] = useState(new Set())
  const [filtAreas, setFiltAreas] = useState(new Set())
  const [rapido, setRapido] = useState('')
  const [orden, setOrden] = useState('creado')

  const toggle = (set, setter, v) => { const s = new Set(set); s.has(v) ? s.delete(v) : s.add(v); setter(s) }
  const clear = () => { setEstados(new Set()); setPrios(new Set()); setFiltAreas(new Set()); setQ(''); setRapido('') }
  const hasFilters = estados.size || prios.size || filtAreas.size || q

  const filtered = tareas.filter(t => {
    if (rapido === 'urgentes') return isUrgente(t)
    if (rapido === 'proximas') return isProxima(t)
    return (estados.size === 0 || estados.has(t.estado))
      && (prios.size === 0 || prios.has(t.prioridad))
      && (filtAreas.size === 0 || filtAreas.has(t.area_id))
      && t.titulo.toLowerCase().includes(q.toLowerCase())
  }).sort((a, b) => {
    if (orden === 'fecha') {
      if (!a.fecha && !b.fecha) return 0
      if (!a.fecha) return 1; if (!b.fecha) return -1
      return a.fecha > b.fecha ? 1 : -1
    }
    return 0
  })

  return (
    <div className="overflow-y-auto h-full no-scrollbar">
      <div className="flex items-center justify-between px-5 pt-6 pb-1">
        <h1 className="text-[23px] font-extrabold tracking-tight">Tareas</h1>
        <button onClick={onNew} className="pressable flex items-center gap-1.5 text-[13px] font-semibold text-white px-3.5 py-2 rounded-[12px]"
          style={{ background: 'var(--blue)', boxShadow: 'var(--sh-blue)' }}>
          <Plus className="w-4 h-4" /> Nueva
        </button>
      </div>
      <p className="text-[13px] text-[var(--ink-3)] px-5 mb-3">{filtered.length} tarea{filtered.length !== 1 ? 's' : ''}</p>

      <div className="px-5 space-y-3 mb-3">
        {/* Quick */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {[['', 'Todas'], ['urgentes', 'Urgentes'], ['proximas', 'Próximas']].map(([v, l]) => (
            <button key={v} onClick={() => { setRapido(v); if (!v) clear() }}
              className="pressable flex-shrink-0 text-[12px] px-3 py-1.5 rounded-[10px] border font-semibold transition-colors"
              style={rapido === v && v === '' ? { background: 'var(--ink)', color: '#fff', borderColor: 'var(--ink)' }
                : rapido === v ? { background: 'var(--red)', color: '#fff', borderColor: 'var(--red)' }
                : { borderColor: 'var(--line)', color: 'var(--ink-3)', background: '#fff' }}>
              {l}
            </button>
          ))}
        </div>
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-[var(--ink-4)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input className={inputCls + ' pl-10'} value={q} onChange={e => { setQ(e.target.value); setRapido('') }} placeholder="Buscar tareas…" />
        </div>
        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[var(--ink-4)] font-semibold uppercase tracking-wide">Ordenar</span>
          {[['creado', 'Recientes'], ['fecha', 'Por fecha']].map(([v, l]) => (
            <button key={v} onClick={() => setOrden(v)}
              className="pressable text-[12px] px-3 py-1.5 rounded-[10px] border font-medium transition-colors"
              style={orden === v ? { background: 'var(--ink)', color: '#fff', borderColor: 'var(--ink)' } : { borderColor: 'var(--line)', color: 'var(--ink-3)', background: '#fff' }}>
              {l}
            </button>
          ))}
        </div>
        <Chips label="Estado" options={[['pendiente', 'Pendiente'], ['en_progreso', 'En progreso'], ['completada', 'Completada']]} selected={estados} onToggle={v => { toggle(estados, setEstados, v); setRapido('') }} />
        <Chips label="Prioridad" options={[['alta', 'Alta'], ['media', 'Media'], ['baja', 'Baja']]} selected={prios} onToggle={v => { toggle(prios, setPrios, v); setRapido('') }} />
        <Chips label="Área" scroll options={areas.map(a => [a.id, `${a.emoji} ${a.nombre}`])} selected={filtAreas} onToggle={v => { toggle(filtAreas, setFiltAreas, v); setRapido('') }} />
        {hasFilters ? (
          <button onClick={clear} className="flex items-center gap-1 text-[12px] font-semibold" style={{ color: 'var(--red)' }}>
            <X className="w-3.5 h-3.5" /> Limpiar filtros
          </button>
        ) : null}
      </div>

      <div className="px-5 space-y-2 pb-4">
        {filtered.length === 0 ? (
          <div className="rounded-[14px] py-12 text-center" style={{ background: 'var(--subtle)' }}>
            <p className="text-[13px] text-[var(--ink-3)]">Sin tareas con estos filtros</p>
            {hasFilters ? <button onClick={clear} className="mt-2 text-[12px] font-semibold" style={{ color: 'var(--blue)' }}>Limpiar</button> : null}
          </div>
        ) : filtered.map(t => (
          <TaskCard key={t.id} t={t} area={getArea(t.area_id)} showArea
            onEdit={onEdit} onDelete={deleteTarea} onStatus={setTareaEstado} />
        ))}
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Settings, ChevronRight, ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react'
import { TaskCard, MeetingCard } from '../components/cards'
import { areaIcon, areaAccent } from '../lib/icons'
import { TIPO_BITACORA, fechaLarga } from '../lib/constants'
import { Sheet } from '../components/ui'
import { ClipboardList, CalendarDays, CheckCircle2, AlertTriangle } from 'lucide-react'

const TIPO_ICON = { ClipboardList, CalendarDays, CheckCircle2, AlertTriangle }

export function Areas({ data, openArea, onManage }) {
  const { areas, tareas, reuniones } = data
  return (
    <div className="overflow-y-auto h-full no-scrollbar">
      <div className="flex items-center justify-between px-5 pt-6 pb-1">
        <h1 className="text-[23px] font-extrabold tracking-tight">Áreas</h1>
        <button onClick={onManage} className="pressable flex items-center gap-1.5 text-[13px] font-semibold px-3 py-2 rounded-[12px] border border-[var(--line)] bg-white text-[var(--ink-2)]">
          <Settings className="w-4 h-4" /> Gestionar
        </button>
      </div>
      <p className="text-[13px] text-[var(--ink-3)] px-5 mb-3">{areas.length} áreas activas</p>

      <div className="px-5 grid grid-cols-2 gap-2.5 pb-4">
        {areas.map(area => {
          const Icon = areaIcon(area); const accent = areaAccent(area)
          const pend = tareas.filter(t => t.area_id === area.id && t.estado === 'pendiente').length
          const done = tareas.filter(t => t.area_id === area.id && t.estado === 'completada').length
          const reus = reuniones.filter(r => r.area_id === area.id && r.estado === 'programada').length
          return (
            <button key={area.id} onClick={() => openArea(area)}
              className="pressable bg-white border border-[var(--line)] rounded-[16px] p-4 text-left" style={{ boxShadow: 'var(--sh-sm)' }}>
              <div className="flex items-start justify-between mb-2.5">
                <div className="w-10 h-10 rounded-[12px] flex items-center justify-center" style={{ background: accent.tint }}>
                  <Icon className="w-5 h-5" style={{ color: accent.fg }} />
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--ink-4)] mt-1" />
              </div>
              <p className="text-[14px] font-bold leading-tight">{area.nombre}</p>
              <p className="text-[11px] text-[var(--ink-3)] mt-1 line-clamp-2 leading-snug">{area.descripcion}</p>
              <div className="flex gap-2.5 mt-2.5 text-[11px] text-[var(--ink-3)]">
                <span><b style={{ color: 'var(--amber)' }}>{pend}</b> pend.</span>
                <span><b style={{ color: 'var(--green)' }}>{done}</b> listas</span>
                {reus > 0 && <span><b style={{ color: 'var(--violet)' }}>{reus}</b> reun.</span>}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function AreaDetail({ data, area, onBack, onNewTask, onEditTask, onNewMeeting, onEditMeeting, onNewBitacora }) {
  const { tareas, reuniones, bitacora, deleteTarea, setTareaEstado, deleteReunion, setReunionEstado, deleteBitacora } = data
  const Icon = areaIcon(area); const accent = areaAccent(area)

  const [estados, setEstados] = useState(new Set())
  const [prios, setPrios] = useState(new Set())
  const toggle = (set, setter, v) => { const s = new Set(set); s.has(v) ? s.delete(v) : s.add(v); setter(s) }

  const allTareas = tareas.filter(t => t.area_id === area.id)
  const areaTareas = allTareas.filter(t =>
    (estados.size === 0 || estados.has(t.estado)) && (prios.size === 0 || prios.has(t.prioridad)))
  const areaReus = [...reuniones.filter(r => r.area_id === area.id)].sort((a, b) => a.fecha > b.fecha ? 1 : -1)
  const areaBit = bitacora.filter(b => b.area_id === area.id)

  const FilterChip = ({ v, l, set, setter }) => (
    <button onClick={() => toggle(set, setter, v)}
      className="pressable text-[11.5px] px-2.5 py-1 rounded-[9px] border font-medium transition-colors"
      style={set.has(v) ? { background: 'var(--ink)', color: '#fff', borderColor: 'var(--ink)' } : { borderColor: 'var(--line)', color: 'var(--ink-3)', background: '#fff' }}>
      {l}
    </button>
  )

  return (
    <div className="overflow-y-auto h-full no-scrollbar pb-4">
      <div className="px-5 pt-6">
        <button onClick={onBack} className="pressable flex items-center gap-1 text-[13px] text-[var(--ink-3)] mb-4">
          <ArrowLeft className="w-4 h-4" /> Áreas
        </button>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-[14px] flex items-center justify-center" style={{ background: accent.tint }}>
            <Icon className="w-6 h-6" style={{ color: accent.fg }} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[19px] font-extrabold tracking-tight leading-tight">{area.nombre}</h1>
            <p className="text-[12px] text-[var(--ink-3)] leading-snug">{area.descripcion}</p>
          </div>
        </div>
      </div>

      {/* Tareas */}
      <section className="px-5 mb-6">
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-[14px] font-bold">Tareas ({areaTareas.length}{areaTareas.length !== allTareas.length ? ` de ${allTareas.length}` : ''})</h2>
          <button onClick={onNewTask} className="pressable flex items-center gap-1 text-[12px] font-semibold text-white px-2.5 py-1.5 rounded-[10px]" style={{ background: 'var(--blue)' }}>
            <Plus className="w-3.5 h-3.5" /> Nueva
          </button>
        </div>
        <div className="flex gap-1.5 flex-wrap mb-3">
          {[['pendiente', 'Pendiente'], ['en_progreso', 'En progreso'], ['completada', 'Completada']].map(([v, l]) => <FilterChip key={v} v={v} l={l} set={estados} setter={setEstados} />)}
          {[['alta', 'Alta'], ['media', 'Media'], ['baja', 'Baja']].map(([v, l]) => <FilterChip key={v} v={v} l={l} set={prios} setter={setPrios} />)}
        </div>
        {areaTareas.length === 0 ? (
          <Empty text={allTareas.length === 0 ? 'Sin tareas aún' : 'Sin tareas con estos filtros'} />
        ) : (
          <div className="space-y-2">
            {areaTareas.map(t => <TaskCard key={t.id} t={t} area={area} onEdit={onEditTask} onDelete={deleteTarea} onStatus={setTareaEstado} />)}
          </div>
        )}
      </section>

      {/* Reuniones */}
      <section className="px-5 mb-6">
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-[14px] font-bold">Reuniones ({areaReus.length})</h2>
          <button onClick={onNewMeeting} className="pressable flex items-center gap-1 text-[12px] font-semibold px-2.5 py-1.5 rounded-[10px] border border-[var(--line)] text-[var(--ink-2)]">
            <Plus className="w-3.5 h-3.5" /> Nueva
          </button>
        </div>
        {areaReus.length === 0 ? <Empty text="Sin reuniones" /> : (
          <div className="space-y-2">
            {areaReus.map(r => <MeetingCard key={r.id} r={r} area={area} onEdit={onEditMeeting} onDelete={deleteReunion} onStatus={setReunionEstado} />)}
          </div>
        )}
      </section>

      {/* Bitácora */}
      <section className="px-5">
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-[14px] font-bold">Bitácora ({areaBit.length})</h2>
          <button onClick={onNewBitacora} className="pressable flex items-center gap-1 text-[12px] font-semibold px-2.5 py-1.5 rounded-[10px] border border-[var(--line)] text-[var(--ink-2)]">
            <Plus className="w-3.5 h-3.5" /> Registrar
          </button>
        </div>
        {areaBit.length === 0 ? <Empty text="Sin registros" /> : (
          <div className="space-y-2">
            {areaBit.map(e => {
              const TIcon = TIPO_ICON[TIPO_BITACORA[e.tipo]?.icon] || ClipboardList
              return (
                <div key={e.id} className="bg-white border border-[var(--line)] rounded-[14px] p-3.5" style={{ boxShadow: 'var(--sh-sm)' }}>
                  <div className="flex gap-2.5">
                    <div className="w-8 h-8 rounded-[9px] flex items-center justify-center flex-shrink-0" style={{ background: 'var(--subtle)' }}>
                      <TIcon className="w-4 h-4 text-[var(--ink-3)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      {e.titulo && <p className="text-[12px] font-bold mb-0.5">{e.titulo}</p>}
                      <p className="text-[13px] leading-snug text-[var(--ink-2)]">{e.descripcion}</p>
                      <p className="text-[11px] text-[var(--ink-4)] mt-1">{fechaLarga(e.fecha)} · {e.autor}</p>
                    </div>
                    <button onClick={() => deleteBitacora(e.id)} className="pressable p-1 h-fit text-[var(--ink-4)] hover:text-[var(--red)]">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

function Empty({ text }) {
  return <div className="rounded-[14px] py-6 text-center" style={{ background: 'var(--subtle)' }}><p className="text-[12.5px] text-[var(--ink-3)]">{text}</p></div>
}

// ── Modal: gestionar áreas ──
export function ManageAreasSheet({ open, onClose, areas, onEdit, onAdd, onDelete }) {
  const [confirmId, setConfirmId] = useState(null)
  return (
    <Sheet open={open} onClose={onClose} title="Gestionar áreas">
      <button onClick={onAdd} className="pressable w-full flex items-center justify-center gap-2 border-2 border-dashed border-[var(--line-2)] rounded-[14px] py-3 text-[13px] font-semibold text-[var(--ink-3)]">
        <Plus className="w-4 h-4" /> Agregar nueva área
      </button>
      <div className="space-y-2">
        {areas.map(area => {
          const Icon = areaIcon(area); const accent = areaAccent(area)
          return (
            <div key={area.id} className="rounded-[14px] p-3" style={{ background: 'var(--subtle)' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background: accent.tint }}>
                  <Icon className="w-[18px] h-[18px]" style={{ color: accent.fg }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] font-semibold">{area.nombre}</p>
                  <p className="text-[11.5px] text-[var(--ink-4)]">{area.responsable}</p>
                </div>
                <button onClick={() => onEdit(area)} className="pressable p-1.5 rounded-lg text-[var(--ink-4)] hover:text-[var(--ink-2)] hover:bg-white"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => setConfirmId(confirmId === area.id ? null : area.id)} className="pressable p-1.5 rounded-lg text-[var(--ink-4)] hover:text-[var(--red)] hover:bg-[var(--red-tint)]"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
              {confirmId === area.id && (
                <div className="mt-2 p-3 rounded-[12px]" style={{ background: 'var(--red-tint)' }}>
                  <p className="text-[11.5px] font-semibold mb-2" style={{ color: 'var(--red)' }}>¿Eliminar "{area.nombre}"? Se borran sus tareas, reuniones y bitácora.</p>
                  <div className="flex gap-2">
                    <button onClick={() => { onDelete(area.id); setConfirmId(null) }} className="pressable flex-1 text-white text-[12px] py-1.5 rounded-[10px] font-semibold" style={{ background: 'var(--red)' }}>Sí, eliminar</button>
                    <button onClick={() => setConfirmId(null)} className="pressable flex-1 text-[12px] py-1.5 rounded-[10px] font-semibold border border-[var(--line-2)] text-[var(--ink-2)] bg-white">Cancelar</button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Sheet>
  )
}

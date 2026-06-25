import { Pencil, Trash2, Clock, MapPin, CalendarPlus, AlertTriangle } from 'lucide-react'
import { Badge } from './ui'
import { T_EST, PRIO, R_EST, HOY, gcalUrl, fechaLarga } from '../lib/constants'
import { areaIcon, areaAccent } from '../lib/icons'

const STATUS_DOTS = {
  pendiente: '⏳', en_progreso: '🔵', completada: '✓',
}

export function TaskCard({ t, area, showArea, onEdit, onDelete, onStatus }) {
  const vencida = t.estado !== 'completada' && t.fecha && t.fecha < HOY
  const est = T_EST[t.estado]
  const prio = PRIO[t.prioridad]
  const Icon = areaIcon(area)
  const accent = areaAccent(area)

  return (
    <div className="bg-white border rounded-[14px] p-3.5"
      style={{ borderColor: vencida ? 'var(--red-tint)' : 'var(--line)', boxShadow: 'var(--sh-sm)' }}>
      <div className="flex gap-3 items-start">
        <div className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0"
          style={{ background: accent.tint }}>
          <Icon className="w-[18px] h-[18px]" style={{ color: accent.fg }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[13.5px] font-semibold leading-snug">{t.titulo}</p>
            <div className="flex gap-0.5 flex-shrink-0 -mt-1 -mr-1">
              <button onClick={() => onEdit(t)} className="pressable p-1.5 rounded-lg text-[var(--ink-4)] hover:text-[var(--ink-2)] hover:bg-[var(--hover)]">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => onDelete(t.id)} className="pressable p-1.5 rounded-lg text-[var(--ink-4)] hover:text-[var(--red)] hover:bg-[var(--red-tint)]">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <p className="text-[11.5px] text-[var(--ink-3)] mt-0.5">
            {showArea && area ? `${area.nombre} · ` : ''}{t.responsable}
          </p>
          {t.notas ? <p className="text-[11.5px] text-[var(--ink-3)] italic mt-1 line-clamp-2">{t.notas}</p> : null}

          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <Badge tint={est.tint} fg={est.fg}>{est.label}</Badge>
            <Badge tint={prio.tint} fg={prio.color}>{prio.label}</Badge>
            {t.fecha && (
              <span className="text-[11px] flex items-center gap-1 font-medium"
                style={{ color: vencida ? 'var(--red)' : 'var(--ink-3)' }}>
                {vencida && <AlertTriangle className="w-3 h-3" />}
                <Clock className="w-3 h-3" />{fechaLarga(t.fecha)}
              </span>
            )}
          </div>

          <div className="flex gap-1 mt-2.5">
            {['pendiente', 'en_progreso', 'completada'].map(e => (
              <button key={e} onClick={() => onStatus(t.id, e)}
                className="pressable text-[11px] px-2.5 py-1 rounded-lg border transition-colors font-medium"
                style={t.estado === e
                  ? { background: 'var(--ink)', color: '#fff', borderColor: 'var(--ink)' }
                  : { borderColor: 'var(--line)', color: 'var(--ink-3)' }}>
                {STATUS_DOTS[e]} {T_EST[e].label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function MeetingCard({ r, area, showArea, onEdit, onDelete, onStatus }) {
  const pasada = r.fecha < HOY && r.estado === 'programada'
  const hora = r.hora ? r.hora.slice(0, 5) : ''
  const est = R_EST[r.estado]
  const Icon = areaIcon(area)
  const accent = areaAccent(area)

  return (
    <div className="bg-white border rounded-[14px] p-3.5"
      style={{ borderColor: pasada ? 'var(--amber-tint)' : 'var(--line)', boxShadow: 'var(--sh-sm)' }}>
      <div className="flex gap-3 items-start">
        <div className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0"
          style={{ background: accent.tint }}>
          <Icon className="w-[18px] h-[18px]" style={{ color: accent.fg }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[13.5px] font-semibold leading-snug">{r.titulo}</p>
            <div className="flex gap-0.5 flex-shrink-0 -mt-1 -mr-1">
              <button onClick={() => onEdit(r)} className="pressable p-1.5 rounded-lg text-[var(--ink-4)] hover:text-[var(--ink-2)] hover:bg-[var(--hover)]">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => onDelete(r.id)} className="pressable p-1.5 rounded-lg text-[var(--ink-4)] hover:text-[var(--red)] hover:bg-[var(--red-tint)]">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          {showArea && area && <p className="text-[11.5px] text-[var(--ink-3)] mt-0.5">{area.nombre}</p>}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[11.5px] text-[var(--ink-3)]">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{fechaLarga(r.fecha)}{hora ? ` · ${hora}` : ''}</span>
            {r.lugar && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{r.lugar}</span>}
            {r.duracion ? <span>{r.duracion} min</span> : null}
          </div>
          {r.descripcion ? <p className="text-[11.5px] text-[var(--ink-3)] italic mt-1">{r.descripcion}</p> : null}

          <div className="flex items-center justify-between gap-2 mt-2.5">
            <div className="flex gap-1">
              {['programada', 'realizada', 'cancelada'].map(e => (
                <button key={e} onClick={() => onStatus(r.id, e)}
                  className="pressable text-[11px] px-2 py-1 rounded-lg border transition-colors font-medium"
                  style={r.estado === e
                    ? { background: 'var(--ink)', color: '#fff', borderColor: 'var(--ink)' }
                    : { borderColor: 'var(--line)', color: 'var(--ink-3)' }}>
                  {R_EST[e].label}
                </button>
              ))}
            </div>
            {r.estado === 'programada' && (
              <a href={gcalUrl(r)} target="_blank" rel="noopener noreferrer"
                className="pressable flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg flex-shrink-0"
                style={{ background: 'var(--violet-tint)', color: 'var(--violet)' }}>
                <CalendarPlus className="w-3.5 h-3.5" /> Calendar
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

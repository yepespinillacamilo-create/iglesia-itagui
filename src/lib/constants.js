export const RESPONSABLES = ['Camilo', 'Karen', 'Camilo y Karen', 'Por definir']

export const HOY = new Date().toISOString().split('T')[0]

export const addDays = (n, base = new Date()) => {
  const d = new Date(base); d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

export const isUrgente = t => t.prioridad === 'alta' && t.estado !== 'completada'
export const isProxima = t => t.estado !== 'completada' && t.fecha >= HOY && t.fecha <= addDays(4)

export const T_EST = {
  pendiente:   { label: 'Pendiente',   tint: 'var(--amber-tint)', fg: 'var(--amber)' },
  en_progreso: { label: 'En progreso', tint: 'var(--blue-tint)',  fg: 'var(--blue)'  },
  completada:  { label: 'Completada',  tint: 'var(--green-tint)', fg: 'var(--green)' },
}

export const PRIO = {
  alta:  { label: 'Alta',  color: 'var(--red)',   tint: 'var(--red-tint)'   },
  media: { label: 'Media', color: 'var(--amber)', tint: 'var(--amber-tint)' },
  baja:  { label: 'Baja',  color: 'var(--ink-4)', tint: 'var(--hover)'      },
}

export const R_EST = {
  programada: { label: 'Programada', tint: 'var(--violet-tint)', fg: 'var(--violet)' },
  realizada:  { label: 'Realizada',  tint: 'var(--green-tint)',  fg: 'var(--green)'  },
  cancelada:  { label: 'Cancelada',  tint: 'var(--hover)',       fg: 'var(--ink-3)'  },
}

export const TIPO_BITACORA = {
  gestion:    { label: 'Gestión',    icon: 'ClipboardList' },
  reunion:    { label: 'Reunión',    icon: 'CalendarDays'  },
  completado: { label: 'Completado', icon: 'CheckCircle2'  },
  incidencia: { label: 'Incidencia', icon: 'AlertTriangle' },
}

export const gcalUrl = r => {
  if (!r.fecha || !r.hora) return '#'
  const base = r.fecha.replace(/-/g, '')
  const hora = r.hora.slice(0, 5)
  const [h, m] = hora.split(':').map(Number)
  const end = h * 60 + m + (r.duracion || 60)
  const eH = String(Math.floor(end / 60) % 24).padStart(2, '0')
  const eM = String(end % 60).padStart(2, '0')
  const p = new URLSearchParams({
    action: 'TEMPLATE', text: r.titulo,
    dates: `${base}T${hora.replace(':', '')}00/${base}T${eH}${eM}00`,
    details: r.descripcion || '', location: r.lugar || '',
  })
  return `https://calendar.google.com/calendar/render?${p}`
}

export const fechaLarga = (iso) => {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
  return `${d} ${meses[m-1]}`
}

import { ArrowRight, ChevronRight, AlertTriangle, CalendarPlus } from 'lucide-react'
import { isUrgente, T_EST, PRIO, HOY, gcalUrl, fechaLarga } from '../lib/constants'
import { areaIcon, areaAccent } from '../lib/icons'
import { Badge } from '../components/ui'

export default function Home({ data, user, setVista, openArea }) {
  const { areas, tareas, reuniones } = data
  const getArea = id => areas.find(a => a.id === id)

  const nombre = (user?.email || '').includes('karen') ? 'Karen' : 'Camilo'
  const hora = new Date().getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'
  const fechaHoy = new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })

  const urgentes = tareas.filter(isUrgente)
  const proxReus = [...reuniones].filter(r => r.estado === 'programada' && r.fecha >= HOY)
    .sort((a, b) => `${a.fecha}${a.hora}` > `${b.fecha}${b.hora}` ? 1 : -1)
  const semana = tareas.filter(t => t.estado !== 'completada')
  const stats = {
    pendientes: tareas.filter(t => t.estado === 'pendiente').length,
    progreso: tareas.filter(t => t.estado === 'en_progreso').length,
    reuniones: reuniones.filter(r => r.estado === 'programada').length,
  }

  return (
    <div className="overflow-y-auto h-full no-scrollbar pb-2">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-2.5">
        <div>
          <p className="text-[13px] text-[var(--ink-3)] font-medium capitalize rise r1">{fechaHoy}</p>
          <h1 className="text-[23px] font-extrabold tracking-tight mt-0.5 rise r2">{saludo}, {nombre}</h1>
        </div>
        <div className="w-10 h-10 rounded-[12px] bg-[var(--ink)] text-white flex items-center justify-center font-semibold rise r1">
          {nombre[0]}
        </div>
      </div>

      {/* Hero */}
      <button onClick={() => setVista('tareas')}
        className="pressable block w-full text-left mx-5 rise r2" style={{ width: 'calc(100% - 40px)' }}>
        <div className="relative overflow-hidden rounded-[18px] p-4 text-white" style={{ background: 'var(--ink)' }}>
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(37,99,235,.45), transparent 70%)' }} />
          <p className="text-[12.5px] font-medium relative" style={{ color: 'rgba(255,255,255,.6)' }}>Lo más importante de hoy</p>
          <p className="text-[32px] font-extrabold tracking-tight mt-1 relative">{urgentes.length} urgente{urgentes.length !== 1 ? 's' : ''}</p>
          <p className="text-[13px] relative" style={{ color: 'rgba(255,255,255,.7)' }}>
            {stats.reuniones} reunion{stats.reuniones !== 1 ? 'es' : ''} · {stats.pendientes} pendientes
          </p>
          <div className="absolute right-4 bottom-4 w-9 h-9 rounded-[12px] flex items-center justify-center"
            style={{ background: 'var(--blue)', boxShadow: 'var(--sh-blue)' }}>
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>
      </button>

      {/* Stat chips */}
      <div className="flex gap-2 px-5 pt-3">
        {[
          { n: stats.pendientes, l: 'Pendientes', c: 'var(--amber)' },
          { n: stats.progreso, l: 'En progreso', c: 'var(--blue)' },
          { n: stats.reuniones, l: 'Reuniones', c: 'var(--violet)' },
        ].map((s, i) => (
          <div key={s.l} className={`flex-1 bg-white border border-[var(--line)] rounded-[10px] px-3 py-2.5 rise r${i + 3}`} style={{ boxShadow: 'var(--sh-sm)' }}>
            <p className="text-[19px] font-bold tracking-tight leading-none" style={{ color: s.c }}>{s.n}</p>
            <p className="text-[11px] text-[var(--ink-3)] mt-1 font-medium">{s.l}</p>
          </div>
        ))}
      </div>

      {/* Esta semana */}
      <section className="px-5 pt-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[15.5px] font-bold">Esta semana</h2>
          <button onClick={() => setVista('tareas')} className="text-[13px] font-semibold flex items-center" style={{ color: 'var(--blue)' }}>
            Ver todo <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        {semana.length === 0 ? (
          <EmptyMini text="Sin tareas pendientes" />
        ) : (
          <div className="space-y-px">
            {semana.slice(0, 4).map((t, i) => {
              const area = getArea(t.area_id)
              const Icon = areaIcon(area); const accent = areaAccent(area)
              const vencida = t.fecha && t.fecha < HOY
              return (
                <button key={t.id} onClick={() => setVista('tareas')}
                  className="pressable w-full flex gap-3 items-center py-2.5 px-2 -mx-2 rounded-[12px] text-left hover:bg-[var(--hover)] transition-colors">
                  <div className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background: accent.tint }}>
                    <Icon className="w-[18px] h-[18px]" style={{ color: accent.fg }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] font-semibold leading-tight truncate">{t.titulo}</p>
                    <p className="text-[11.5px] text-[var(--ink-3)] mt-0.5 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: PRIO[t.prioridad].color }} />
                      {area?.nombre}{t.fecha ? ` · ${vencida ? 'venció ' : ''}${fechaLarga(t.fecha)}` : ''}
                    </p>
                  </div>
                  {isUrgente(t) && <Badge tint={PRIO.alta.tint} fg={PRIO.alta.color}>Urgente</Badge>}
                </button>
              )
            })}
          </div>
        )}
      </section>

      {/* Próximas reuniones */}
      {proxReus.length > 0 && (
        <section className="px-5 pt-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[15.5px] font-bold">Próximas reuniones</h2>
            <button onClick={() => setVista('agenda')} className="text-[13px] font-semibold flex items-center" style={{ color: 'var(--blue)' }}>
              Ver todo <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            {proxReus.slice(0, 3).map(r => {
              const area = getArea(r.area_id)
              const Icon = areaIcon(area); const accent = areaAccent(area)
              return (
                <div key={r.id} className="flex gap-3 items-center bg-white border border-[var(--line)] rounded-[14px] p-3" style={{ boxShadow: 'var(--sh-sm)' }}>
                  <div className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background: accent.tint }}>
                    <Icon className="w-[18px] h-[18px]" style={{ color: accent.fg }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] font-semibold leading-tight truncate">{r.titulo}</p>
                    <p className="text-[11.5px] text-[var(--ink-3)] mt-0.5">{fechaLarga(r.fecha)}{r.hora ? ` · ${r.hora.slice(0, 5)}` : ''}{r.lugar ? ` · ${r.lugar}` : ''}</p>
                  </div>
                  <a href={gcalUrl(r)} target="_blank" rel="noopener noreferrer"
                    className="pressable w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background: 'var(--violet-tint)' }}>
                    <CalendarPlus className="w-4 h-4" style={{ color: 'var(--violet)' }} />
                  </a>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Áreas */}
      <section className="px-5 pt-5 pb-2">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[15.5px] font-bold">Áreas</h2>
          <button onClick={() => setVista('areas')} className="text-[13px] font-semibold" style={{ color: 'var(--blue)' }}>Ver todo</button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {areas.slice(0, 8).map(area => {
            const Icon = areaIcon(area); const accent = areaAccent(area)
            const cnt = tareas.filter(t => t.area_id === area.id && t.estado !== 'completada').length
            return (
              <button key={area.id} onClick={() => openArea(area)}
                className="pressable relative bg-white border border-[var(--line)] rounded-[10px] py-2.5 px-1 flex flex-col items-center gap-1.5"
                style={{ boxShadow: 'var(--sh-sm)' }}>
                {cnt > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[15px] h-[15px] px-1 rounded-full text-white text-[9px] font-bold flex items-center justify-center" style={{ background: 'var(--red)' }}>{cnt}</span>
                )}
                <div className="w-8 h-8 rounded-[9px] flex items-center justify-center" style={{ background: accent.tint }}>
                  <Icon className="w-[17px] h-[17px]" style={{ color: accent.fg }} />
                </div>
                <span className="text-[10px] font-semibold text-[var(--ink-2)] text-center leading-tight truncate w-full">{area.nombre}</span>
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function EmptyMini({ text }) {
  return (
    <div className="rounded-[14px] py-6 text-center" style={{ background: 'var(--green-tint)' }}>
      <p className="text-[13px] font-semibold" style={{ color: 'var(--green)' }}>✓ {text}</p>
    </div>
  )
}

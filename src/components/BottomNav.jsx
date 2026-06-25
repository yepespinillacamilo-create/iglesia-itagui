import { Home, CheckSquare, CalendarDays, LayoutGrid, Sparkles } from 'lucide-react'

const ITEMS = [
  { id: 'inicio',    label: 'Inicio',  icon: Home },
  { id: 'tareas',    label: 'Tareas',  icon: CheckSquare },
  { id: 'chat',      label: null,      icon: Sparkles, center: true },
  { id: 'agenda',    label: 'Agenda',  icon: CalendarDays },
  { id: 'areas',     label: 'Áreas',   icon: LayoutGrid },
]

export default function BottomNav({ vista, setVista, urgentes, reuniones }) {
  const isActive = id => vista === id || (id === 'areas' && vista === 'area_detalle')

  return (
    <nav className="absolute bottom-0 inset-x-0 z-[50] border-t border-[var(--line)]"
      style={{ background: 'rgba(255,255,255,.82)', backdropFilter: 'blur(20px) saturate(180%)',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)', paddingTop: 8 }}>
      <div className="flex items-center justify-around px-3">
        {ITEMS.map(({ id, label, icon: Icon, center }) => {
          if (center) {
            return (
              <button key={id} onClick={() => setVista('chat')}
                className="pressable flex items-center justify-center flex-shrink-0"
                style={{ width: 52, height: 52, borderRadius: 16, marginTop: -28,
                  background: vista === 'chat' ? 'var(--blue-700)' : 'var(--blue)',
                  color: '#fff', boxShadow: 'var(--sh-blue)', border: '4px solid #fff' }}>
                <Icon className="w-[25px] h-[25px]" />
              </button>
            )
          }
          const active = isActive(id)
          const badge = id === 'tareas' ? urgentes : id === 'agenda' ? reuniones : 0
          return (
            <button key={id} onClick={() => setVista(id)}
              className="pressable relative flex flex-col items-center gap-0.5 py-1 px-3"
              style={{ color: active ? 'var(--blue)' : 'var(--ink-4)' }}>
              <Icon className="w-[21px] h-[21px]" />
              <span className="text-[10.5px] font-medium">{label}</span>
              {badge > 0 && (
                <span className="absolute top-0 right-1 w-[7px] h-[7px] rounded-full"
                  style={{ background: id === 'tareas' ? 'var(--red)' : 'var(--violet)' }} />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

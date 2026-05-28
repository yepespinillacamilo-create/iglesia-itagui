import { useState, useEffect, useCallback } from "react"
import { supabase } from "./supabase"
import {
  LayoutDashboard, Layers, CheckSquare, Calendar, Plus, Search,
  X, ChevronRight, Clock, AlertCircle, Edit3, Trash2, ArrowLeft,
  Settings, ExternalLink, MapPin, LogOut, Loader2
} from "lucide-react"

// ── CONSTANTS ─────────────────────────────────────────────────────────────────

const RESPONSABLES   = ['Camilo', 'Karen', 'Camilo y Karen', 'Por definir']
const T_ESTADO_CLS   = { pendiente:'bg-amber-50 text-amber-700', en_progreso:'bg-blue-50 text-blue-700', completada:'bg-emerald-50 text-emerald-700' }
const T_ESTADO_LBL   = { pendiente:'Pendiente', en_progreso:'En progreso', completada:'Completada' }
const PRIO_CLS       = { alta:'bg-red-50 text-red-600', media:'bg-orange-50 text-orange-600', baja:'bg-gray-100 text-gray-500' }
const R_ESTADO_CLS   = { programada:'bg-violet-50 text-violet-700', realizada:'bg-emerald-50 text-emerald-700', cancelada:'bg-gray-100 text-gray-500' }
const R_ESTADO_LBL   = { programada:'Programada', realizada:'Realizada', cancelada:'Cancelada' }
const TIPO_EMOJI     = { reunion:'🗓️', completado:'✅', incidencia:'⚠️', gestion:'📋' }

const HOY = new Date().toISOString().split('T')[0]
const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r.toISOString().split('T')[0] }
const isUrgente = t => t.prioridad === 'alta' && t.estado !== 'completada'
const isProxima = t => t.estado !== 'completada' && t.fecha >= HOY && t.fecha <= addDays(HOY, 4)

const gcalUrl = r => {
  if (!r.fecha || !r.hora) return '#'
  const base = r.fecha.replace(/-/g, '')
  const hora = r.hora.slice(0, 5)
  const [h, m] = hora.split(':').map(Number)
  const em = h * 60 + m + (r.duracion || 60)
  const eH = String(Math.floor(em / 60) % 24).padStart(2, '0')
  const eM = String(em % 60).padStart(2, '0')
  const p = new URLSearchParams({ action: 'TEMPLATE', text: r.titulo, dates: `${base}T${hora.replace(':', '')}00/${base}T${eH}${eM}00`, details: r.descripcion || '', location: r.lugar || '' })
  return `https://calendar.google.com/calendar/render?${p}`
}

// ── SHARED UI ─────────────────────────────────────────────────────────────────

const Chip = ({ cls, children }) => <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${cls}`}>{children}</span>
const Field = ({ label, children }) => <div><label className="text-xs font-medium text-gray-500 block mb-1">{label}</label>{children}</div>
const ic = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400 bg-white"

const Spinner = () => <Loader2 className="w-4 h-4 animate-spin" />

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ background: '#F8F7F4' }}>
    <div className="text-center">
      <span className="text-5xl block mb-4">🏛️</span>
      <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto" />
    </div>
  </div>
)

// ── LOGIN ─────────────────────────────────────────────────────────────────────

function Login() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const handleLogin = async () => {
    if (!email || !password) return
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('Correo o contraseña incorrectos')
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#F8F7F4' }}>
      <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-sm border border-gray-100">
        <div className="text-center mb-8">
          <span className="text-5xl">🏛️</span>
          <h1 className="text-xl font-bold text-gray-900 mt-3">Iglesia Itagüí</h1>
          <p className="text-sm text-gray-400 mt-1">Panel pastoral</p>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-xl mb-4 text-center">{error}</div>
        )}
        <div className="space-y-3">
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Correo electrónico" className={ic}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Contraseña" className={ic}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
          <button
            onClick={handleLogin} disabled={loading}
            className="w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-semibold hover:bg-gray-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {loading && <Spinner />}
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────

function MainApp({ user }) {
  const [vista,      setVista]      = useState('dashboard')
  const [areaActual, setAreaActual] = useState(null)

  // Data
  const [areas,     setAreas]     = useState([])
  const [tareas,    setTareas]    = useState([])
  const [reuniones, setReuniones] = useState([])
  const [bitacora,  setBitacora]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)

  // Filters – tasks
  const [tBusqueda,  setTBusqueda]  = useState('')
  const [tEstado,    setTEstado]    = useState('todos')
  const [tPrioridad, setTPrioridad] = useState('todas')
  const [tArea,      setTArea]      = useState('todas')
  const [tRapido,    setTRapido]    = useState('')

  // Filters – meetings
  const [rBusqueda, setRBusqueda] = useState('')
  const [rEstado,   setREstado]   = useState('todos')
  const [rArea,     setRArea]     = useState('todas')

  // Modals
  const [mTarea,     setMTarea]     = useState(false)
  const [mReunion,   setMReunion]   = useState(false)
  const [mBitacora,  setMBitacora]  = useState(false)
  const [mArea,      setMArea]      = useState(false)
  const [mGestAreas, setMGestAreas] = useState(false)
  const [confirmDelAreaId, setConfirmDelAreaId] = useState(null)

  // Editing IDs
  const [eTareaId,   setETareaId]   = useState(null)
  const [eReunionId, setEReunionId] = useState(null)
  const [eAreaId,    setEAreaId]    = useState(null)

  // Forms
  const E_T = { titulo:'', area_id:'', estado:'pendiente', prioridad:'media', responsable:'Camilo', fecha:'', notas:'' }
  const E_R = { titulo:'', area_id:'', fecha:'', hora:'10:00', duracion:60, lugar:'', descripcion:'', responsable:'Camilo', estado:'programada' }
  const E_B = { descripcion:'', autor:'Camilo', tipo:'gestion' }
  const E_A = { nombre:'', emoji:'📌', responsable:'Por definir', descripcion:'' }

  const [formT, setFormT] = useState(E_T)
  const [formR, setFormR] = useState(E_R)
  const [formB, setFormB] = useState(E_B)
  const [formA, setFormA] = useState(E_A)

  // Toast
  const [toast, setToast] = useState(null)
  const showToast = (msg, type = 'ok') => { setToast({ msg, type }); setTimeout(() => setToast(null), 2600) }

  // ── LOAD DATA ────────────────────────────────────────────
  const loadAreas     = useCallback(async () => { const { data } = await supabase.from('areas').select('*').order('id');           setAreas(data || []) }, [])
  const loadTareas    = useCallback(async () => { const { data } = await supabase.from('tareas').select('*').order('created_at', { ascending: false }); setTareas(data || []) }, [])
  const loadReuniones = useCallback(async () => { const { data } = await supabase.from('reuniones').select('*').order('fecha');    setReuniones(data || []) }, [])
  const loadBitacora  = useCallback(async () => { const { data } = await supabase.from('bitacora').select('*').order('created_at', { ascending: false }); setBitacora(data || []) }, [])

  const loadAll = useCallback(async () => {
    setLoading(true)
    await Promise.all([loadAreas(), loadTareas(), loadReuniones(), loadBitacora()])
    setLoading(false)
  }, [loadAreas, loadTareas, loadReuniones, loadBitacora])

  useEffect(() => { loadAll() }, [loadAll])

  const getArea = id => areas.find(a => a.id === id)

  // ── STATS ────────────────────────────────────────────────
  const urgCnt   = tareas.filter(isUrgente).length
  const rProgCnt = reuniones.filter(r => r.estado === 'programada').length
  const stats = {
    pendiente:   tareas.filter(t => t.estado === 'pendiente').length,
    en_progreso: tareas.filter(t => t.estado === 'en_progreso').length,
    completada:  tareas.filter(t => t.estado === 'completada').length,
  }

  // ── CRUD TASKS ───────────────────────────────────────────
  const saveTask = async () => {
    if (!formT.titulo.trim() || !formT.area_id) return
    setSaving(true)
    const payload = { titulo: formT.titulo, area_id: +formT.area_id, estado: formT.estado, prioridad: formT.prioridad, responsable: formT.responsable, fecha: formT.fecha || null, notas: formT.notas }
    if (eTareaId) {
      await supabase.from('tareas').update(payload).eq('id', eTareaId)
      showToast('Tarea actualizada')
    } else {
      await supabase.from('tareas').insert(payload)
      showToast('Tarea creada ✓')
    }
    await loadTareas(); setMTarea(false); setETareaId(null); setFormT(E_T); setSaving(false)
  }
  const editTask   = t  => { setETareaId(t.id); setFormT({ ...t, area_id: String(t.area_id), fecha: t.fecha || '' }); setMTarea(true) }
  const deleteTask = async id => { await supabase.from('tareas').delete().eq('id', id); await loadTareas(); showToast('Eliminada', 'del') }
  const setStatus  = async (id, estado) => {
    setTareas(ts => ts.map(t => t.id === id ? { ...t, estado } : t))  // optimistic
    await supabase.from('tareas').update({ estado }).eq('id', id)
  }

  // ── CRUD MEETINGS ────────────────────────────────────────
  const saveReunion = async () => {
    if (!formR.titulo.trim() || !formR.area_id || !formR.fecha) return
    setSaving(true)
    const payload = { titulo: formR.titulo, area_id: +formR.area_id, fecha: formR.fecha, hora: formR.hora, duracion: +formR.duracion, lugar: formR.lugar, descripcion: formR.descripcion, responsable: formR.responsable, estado: formR.estado }
    if (eReunionId) {
      await supabase.from('reuniones').update(payload).eq('id', eReunionId)
      showToast('Reunión actualizada')
    } else {
      await supabase.from('reuniones').insert(payload)
      showToast('Reunión creada ✓')
    }
    await loadReuniones(); setMReunion(false); setEReunionId(null); setFormR(E_R); setSaving(false)
  }
  const editReunion   = r  => { setEReunionId(r.id); setFormR({ ...r, area_id: String(r.area_id), hora: r.hora ? r.hora.slice(0, 5) : '10:00' }); setMReunion(true) }
  const deleteReunion = async id => { await supabase.from('reuniones').delete().eq('id', id); await loadReuniones(); showToast('Eliminada', 'del') }
  const setRStatus    = async (id, estado) => {
    setReuniones(rs => rs.map(r => r.id === id ? { ...r, estado } : r))
    await supabase.from('reuniones').update({ estado }).eq('id', id)
  }

  // ── CRUD AREAS ───────────────────────────────────────────
  const saveArea = async () => {
    if (!formA.nombre.trim()) return
    setSaving(true)
    if (eAreaId) {
      await supabase.from('areas').update(formA).eq('id', eAreaId)
      showToast('Área actualizada')
    } else {
      await supabase.from('areas').insert(formA)
      showToast('Área creada ✓')
    }
    await loadAreas(); setMArea(false); setEAreaId(null); setFormA(E_A); setSaving(false)
  }
  const editArea = a => { setEAreaId(a.id); setFormA({ nombre: a.nombre, emoji: a.emoji, responsable: a.responsable, descripcion: a.descripcion || '' }); setMArea(true); setMGestAreas(false) }
  const deleteArea = async id => {
    await supabase.from('areas').delete().eq('id', id)
    await loadAll(); setConfirmDelAreaId(null); showToast('Área eliminada', 'del')
  }

  // ── BITACORA ─────────────────────────────────────────────
  const saveBit = async () => {
    if (!formB.descripcion.trim() || !areaActual) return
    setSaving(true)
    await supabase.from('bitacora').insert({ area_id: areaActual.id, descripcion: formB.descripcion, autor: formB.autor, tipo: formB.tipo, fecha: HOY })
    await loadBitacora(); setMBitacora(false); setFormB(E_B); setSaving(false); showToast('Registro guardado ✓')
  }

  const handleLogout = async () => { await supabase.auth.signOut() }

  // ── FILTERED DATA ────────────────────────────────────────
  const tareasFiltradas = tareas.filter(t => {
    if (tRapido === 'urgentes') return isUrgente(t)
    if (tRapido === 'proximas') return isProxima(t)
    return (tEstado === 'todos' || t.estado === tEstado)
      && (tPrioridad === 'todas' || t.prioridad === tPrioridad)
      && (tArea === 'todas' || t.area_id === +tArea)
      && t.titulo.toLowerCase().includes(tBusqueda.toLowerCase())
  })

  const reunionesFiltradas = [...reuniones].filter(r =>
    (rEstado === 'todos' || r.estado === rEstado)
    && (rArea === 'todas' || r.area_id === +rArea)
    && r.titulo.toLowerCase().includes(rBusqueda.toLowerCase())
  ).sort((a, b) => (`${a.fecha}${a.hora}` > `${b.fecha}${b.hora}`) ? 1 : -1)

  const isAct = id => vista === id || (id === 'areas' && vista === 'area_detalle')
  const nav4 = [
    { id: 'dashboard', label: 'Inicio',    icon: LayoutDashboard },
    { id: 'areas',     label: 'Áreas',     icon: Layers },
    { id: 'tareas',    label: 'Tareas',    icon: CheckSquare },
    { id: 'reuniones', label: 'Reuniones', icon: Calendar },
  ]

  // ── CARDS ────────────────────────────────────────────────

  const TaskCard = ({ t, showArea = false }) => {
    const area   = getArea(t.area_id)
    const vencida = t.estado !== 'completada' && t.fecha && t.fecha < HOY
    return (
      <div className={`bg-white rounded-2xl p-4 border ${vencida ? 'border-red-200 bg-red-50/30' : 'border-gray-100'}`}>
        <div className="flex gap-2">
          {showArea && <span className="text-lg mt-0.5 flex-shrink-0">{area?.emoji}</span>}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-gray-800 flex-1 leading-snug">{t.titulo}</p>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => editTask(t)}     className="p-1.5 text-gray-300 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><Edit3  className="w-3.5 h-3.5" /></button>
                <button onClick={() => deleteTask(t.id)} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            {showArea && <p className="text-xs text-gray-400 mt-0.5">{area?.nombre} · 👤 {t.responsable}</p>}
            {!showArea && t.responsable && <p className="text-xs text-gray-400 mt-0.5">👤 {t.responsable}</p>}
            {t.notas && <p className="text-xs text-gray-500 italic mt-0.5">{t.notas}</p>}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Chip cls={T_ESTADO_CLS[t.estado]}>{T_ESTADO_LBL[t.estado]}</Chip>
              <Chip cls={PRIO_CLS[t.prioridad]}>{t.prioridad}</Chip>
              {t.fecha && <span className={`text-xs flex items-center gap-1 ${vencida ? 'text-red-500 font-semibold' : 'text-gray-400'}`}><Clock className="w-3 h-3" />{vencida && '⚠️ '}{t.fecha}</span>}
            </div>
            <div className="flex gap-1.5 mt-2.5">
              {['pendiente', 'en_progreso', 'completada'].map(e => (
                <button key={e} onClick={() => setStatus(t.id, e)}
                  className={`text-xs px-2 py-0.5 rounded-lg border transition-all ${t.estado === e ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-400 hover:border-gray-400'}`}>
                  {e === 'pendiente' ? '⏳' : e === 'en_progreso' ? '🔵' : '✅'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const MeetingCard = ({ r, showArea = false }) => {
    const area  = getArea(r.area_id)
    const pasada = r.fecha < HOY && r.estado === 'programada'
    const hora   = r.hora ? r.hora.slice(0, 5) : ''
    return (
      <div className={`bg-white rounded-2xl p-4 border ${pasada ? 'border-amber-200' : 'border-gray-100'}`}>
        <div className="flex gap-2">
          {showArea && <span className="text-lg mt-0.5 flex-shrink-0">{area?.emoji}</span>}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-gray-800 flex-1 leading-snug">{r.titulo}</p>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => editReunion(r)}     className="p-1.5 text-gray-300 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><Edit3  className="w-3.5 h-3.5" /></button>
                <button onClick={() => deleteReunion(r.id)} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            {showArea && <p className="text-xs text-gray-400 mt-0.5">{area?.nombre}</p>}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-gray-500">
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{r.fecha}{hora ? ` · ${hora}` : ''}</span>
              {r.lugar    && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{r.lugar}</span>}
              {r.duracion && <span className="flex items-center gap-1"><Clock  className="w-3 h-3" />{r.duracion} min</span>}
            </div>
            {r.descripcion && <p className="text-xs text-gray-400 italic mt-1">{r.descripcion}</p>}
            {r.responsable && <p className="text-xs text-gray-400 mt-1">👤 {r.responsable}</p>}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Chip cls={R_ESTADO_CLS[r.estado]}>{R_ESTADO_LBL[r.estado]}</Chip>
              {pasada && <Chip cls="bg-amber-50 text-amber-600">⚠️ Fecha pasada</Chip>}
            </div>
            <div className="flex items-center justify-between mt-2.5">
              <div className="flex gap-1.5">
                {['programada', 'realizada', 'cancelada'].map(e => (
                  <button key={e} onClick={() => setRStatus(r.id, e)}
                    className={`text-xs px-2 py-0.5 rounded-lg border transition-all ${r.estado === e ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-400 hover:border-gray-400'}`}>
                    {e === 'programada' ? '📅' : e === 'realizada' ? '✅' : '❌'}
                  </button>
                ))}
              </div>
              {r.estado === 'programada' && (
                <a href={gcalUrl(r)} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-violet-600 bg-violet-50 hover:bg-violet-100 px-2.5 py-1 rounded-xl transition-colors">
                  <ExternalLink className="w-3 h-3" /> Agendar en Calendar
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── VIEWS ─────────────────────────────────────────────────

  const ViewDashboard = () => {
    const proxReus = reunionesFiltradas.filter(r => r.estado === 'programada' && r.fecha >= HOY).slice(0, 3)
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hola 👋</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Iglesia Itagüí · {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { l: 'Pendientes', v: stats.pendiente,   fg: 'text-amber-700',  bg: '#FFFBEB' },
            { l: 'En progreso',v: stats.en_progreso,  fg: 'text-blue-700',   bg: '#EFF6FF' },
            { l: 'Urgentes',   v: urgCnt,             fg: 'text-red-700',    bg: '#FEF2F2' },
            { l: 'Reuniones',  v: rProgCnt,           fg: 'text-violet-700', bg: '#F5F3FF' },
          ].map(s => (
            <div key={s.l} style={{ background: s.bg }} className="rounded-2xl p-4 text-center">
              <p className={`text-2xl font-bold ${s.fg}`}>{s.v}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.l}</p>
            </div>
          ))}
        </div>
        {urgCnt > 0 && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl p-4">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-700">{urgCnt} tarea{urgCnt > 1 ? 's' : ''} urgente{urgCnt > 1 ? 's' : ''}</p>
              <p className="text-xs text-red-400 mt-0.5">Alta prioridad · sin completar</p>
            </div>
            <button onClick={() => { setTRapido('urgentes'); setVista('tareas') }}
              className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-xl hover:bg-red-700 flex-shrink-0">Ver</button>
          </div>
        )}
        {proxReus.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-700">Próximas reuniones</p>
              <button onClick={() => setVista('reuniones')} className="text-xs text-violet-500">Ver todas →</button>
            </div>
            <div className="space-y-2">
              {proxReus.map(r => {
                const area = getArea(r.area_id)
                return (
                  <div key={r.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">{area?.emoji}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{r.titulo}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{r.fecha}{r.hora ? ` · ${r.hora.slice(0,5)}` : ''}{r.lugar ? ` · ${r.lugar}` : ''}</p>
                    </div>
                    <a href={gcalUrl(r)} target="_blank" rel="noopener noreferrer"
                      className="p-2 text-violet-400 hover:text-violet-600 hover:bg-violet-50 rounded-xl flex-shrink-0">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )
              })}
            </div>
          </div>
        )}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-700">Tareas urgentes</p>
            <button onClick={() => setVista('tareas')} className="text-xs text-blue-500">Ver todas →</button>
          </div>
          {tareas.filter(isUrgente).length === 0
            ? <div className="bg-emerald-50 rounded-2xl p-5 text-center"><p className="text-sm text-emerald-600 font-medium">✅ Sin tareas urgentes</p></div>
            : <div className="space-y-2">{tareas.filter(isUrgente).slice(0, 4).map(t => {
                const area = getArea(t.area_id)
                return (
                  <div key={t.id} className="bg-white rounded-2xl p-4 flex items-center gap-3 border border-gray-100">
                    <span className="text-xl flex-shrink-0">{area?.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{t.titulo}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{area?.nombre}{t.fecha ? ` · ${t.fecha}` : ''}</p>
                    </div>
                    <Chip cls={T_ESTADO_CLS[t.estado]}>{T_ESTADO_LBL[t.estado]}</Chip>
                  </div>
                )
              })}</div>
          }
        </div>
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-700">Áreas</p>
            <button onClick={() => setVista('areas')} className="text-xs text-blue-500">Ver todas →</button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {areas.map(area => {
              const cnt = tareas.filter(t => t.area_id === area.id && t.estado !== 'completada').length
              return (
                <button key={area.id} onClick={() => { setAreaActual(area); setVista('area_detalle') }}
                  className="bg-white border border-gray-100 rounded-2xl p-3 text-center hover:border-gray-300 transition-all">
                  <span className="text-2xl">{area.emoji}</span>
                  <p className="text-xs text-gray-600 mt-1 leading-tight font-medium">{area.nombre}</p>
                  {cnt > 0 && <span className="inline-block mt-1 bg-red-100 text-red-600 text-xs px-1.5 rounded-full">{cnt}</span>}
                </button>
              )
            })}
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">Actividad reciente</p>
          <div className="space-y-2">
            {bitacora.slice(0, 3).map(e => {
              const area = getArea(e.area_id)
              return (
                <div key={e.id} className="bg-white border border-gray-100 rounded-2xl p-4">
                  <div className="flex gap-2">
                    <span className="flex-shrink-0">{TIPO_EMOJI[e.tipo]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 leading-snug">{e.descripcion}</p>
                      <p className="text-xs text-gray-400 mt-1">{area?.nombre} · {e.fecha} · {e.autor}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  const ViewAreas = () => (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-bold text-gray-900">Áreas</h1>
        <button onClick={() => setMGestAreas(true)}
          className="flex items-center gap-1.5 text-sm border border-gray-200 px-3 py-2 rounded-xl hover:bg-gray-50 text-gray-600">
          <Settings className="w-4 h-4" /> Gestionar
        </button>
      </div>
      <p className="text-sm text-gray-400 mb-5">{areas.length} áreas activas</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {areas.map(area => {
          const pend = tareas.filter(t => t.area_id === area.id && t.estado === 'pendiente').length
          const done = tareas.filter(t => t.area_id === area.id && t.estado === 'completada').length
          const reus = reuniones.filter(r => r.area_id === area.id && r.estado === 'programada').length
          return (
            <button key={area.id} onClick={() => { setAreaActual(area); setVista('area_detalle') }}
              className="bg-white border border-gray-100 rounded-2xl p-5 text-left hover:border-gray-300 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{area.emoji}</span>
                <ChevronRight className="w-4 h-4 text-gray-300 mt-1" />
              </div>
              <p className="font-semibold text-gray-800 mb-1">{area.nombre}</p>
              <p className="text-xs text-gray-400 mb-3 leading-relaxed">{area.descripcion}</p>
              <div className="flex flex-wrap gap-3 text-xs">
                <span className="text-gray-400"><span className="text-amber-500 font-bold">{pend}</span> pendientes</span>
                <span className="text-gray-400"><span className="text-emerald-500 font-bold">{done}</span> listas</span>
                {reus > 0 && <span className="text-gray-400"><span className="text-violet-500 font-bold">{reus}</span> reuniones</span>}
              </div>
              <p className="text-xs text-gray-400 mt-2">👤 {area.responsable}</p>
            </button>
          )
        })}
      </div>
    </div>
  )

  const ViewAreaDetalle = () => {
    if (!areaActual) return null
    const area      = areas.find(a => a.id === areaActual.id) || areaActual
    const areaTareas = tareas.filter(t => t.area_id === area.id)
    const areaReus   = [...reuniones.filter(r => r.area_id === area.id)].sort((a, b) => a.fecha > b.fecha ? 1 : -1)
    const areaBit    = bitacora.filter(b => b.area_id === area.id)
    return (
      <div>
        <button onClick={() => setVista('areas')} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-5">
          <ArrowLeft className="w-4 h-4" /> Áreas
        </button>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-4xl">{area.emoji}</span>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{area.nombre}</h1>
            <p className="text-sm text-gray-400">{area.descripcion}</p>
            <p className="text-xs text-gray-400 mt-0.5">👤 {area.responsable}</p>
          </div>
        </div>
        <section className="mb-7">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-700">Tareas ({areaTareas.length})</p>
            <button onClick={() => { setFormT({ ...E_T, area_id: String(area.id) }); setETareaId(null); setMTarea(true) }}
              className="flex items-center gap-1 text-xs bg-gray-900 text-white px-3 py-1.5 rounded-xl hover:bg-gray-700">
              <Plus className="w-3 h-3" /> Nueva tarea
            </button>
          </div>
          {areaTareas.length === 0
            ? <div className="bg-gray-50 rounded-2xl p-6 text-center"><p className="text-sm text-gray-400">Sin tareas aún</p></div>
            : <div className="space-y-2">{areaTareas.map(t => <TaskCard key={t.id} t={t} />)}</div>}
        </section>
        <section className="mb-7">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-700">Reuniones ({areaReus.length})</p>
            <button onClick={() => { setFormR({ ...E_R, area_id: String(area.id) }); setEReunionId(null); setMReunion(true) }}
              className="flex items-center gap-1 text-xs border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-50 text-gray-600">
              <Plus className="w-3 h-3" /> Nueva reunión
            </button>
          </div>
          {areaReus.length === 0
            ? <div className="bg-gray-50 rounded-2xl p-6 text-center"><p className="text-sm text-gray-400">Sin reuniones</p></div>
            : <div className="space-y-2">{areaReus.map(r => <MeetingCard key={r.id} r={r} />)}</div>}
        </section>
        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-700">Bitácora ({areaBit.length})</p>
            <button onClick={() => setMBitacora(true)}
              className="flex items-center gap-1 text-xs border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-50 text-gray-600">
              <Plus className="w-3 h-3" /> Registrar
            </button>
          </div>
          {areaBit.length === 0
            ? <div className="bg-gray-50 rounded-2xl p-6 text-center"><p className="text-sm text-gray-400">Sin registros</p></div>
            : <div className="space-y-2">{areaBit.map(e => (
                <div key={e.id} className="bg-white border border-gray-100 rounded-2xl p-4">
                  <div className="flex gap-2">
                    <span>{TIPO_EMOJI[e.tipo]}</span>
                    <div className="flex-1"><p className="text-sm text-gray-700 leading-snug">{e.descripcion}</p><p className="text-xs text-gray-400 mt-1">{e.fecha} · {e.autor}</p></div>
                  </div>
                </div>
              ))}</div>}
        </section>
      </div>
    )
  }

  const ViewTareas = () => (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-bold text-gray-900">Tareas</h1>
        <button onClick={() => { setFormT(E_T); setETareaId(null); setMTarea(true) }}
          className="flex items-center gap-1 text-sm bg-gray-900 text-white px-3 py-2 rounded-xl hover:bg-gray-700">
          <Plus className="w-4 h-4" /> Nueva
        </button>
      </div>
      <p className="text-sm text-gray-400 mb-4">{tareasFiltradas.length} tarea{tareasFiltradas.length !== 1 ? 's' : ''}</p>
      <div className="space-y-3 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[['', 'Todas'], ['urgentes', '🔴 Urgentes'], ['proximas', '⏰ Próximas']].map(([v, l]) => (
            <button key={v} onClick={() => { setTRapido(v); if (!v) { setTEstado('todos'); setTPrioridad('todas'); setTArea('todas') } }}
              className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-xl border font-medium transition-all
                ${tRapido === v && v === '' ? 'bg-gray-900 text-white border-gray-900'
                  : tRapido === v ? 'bg-red-600 text-white border-red-600'
                  : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}>{l}</button>
          ))}
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-gray-300 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={tBusqueda} onChange={e => { setTBusqueda(e.target.value); setTRapido('') }}
            placeholder="Buscar tareas..." className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400 bg-white" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <select value={tEstado} onChange={e => { setTEstado(e.target.value); setTRapido('') }} className={ic}>
            <option value="todos">Estado: Todos</option>
            <option value="pendiente">Pendiente</option>
            <option value="en_progreso">En progreso</option>
            <option value="completada">Completada</option>
          </select>
          <select value={tPrioridad} onChange={e => { setTPrioridad(e.target.value); setTRapido('') }} className={ic}>
            <option value="todas">Prioridad: Todas</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
        </div>
        <select value={tArea} onChange={e => { setTArea(e.target.value); setTRapido('') }} className={ic}>
          <option value="todas">Área: Todas</option>
          {areas.map(a => <option key={a.id} value={a.id}>{a.emoji} {a.nombre}</option>)}
        </select>
      </div>
      <div className="space-y-2">
        {tareasFiltradas.length === 0
          ? <div className="bg-gray-50 rounded-2xl p-10 text-center">
              <p className="text-sm text-gray-400">Sin tareas con estos filtros</p>
              <button onClick={() => { setTRapido(''); setTEstado('todos'); setTPrioridad('todas'); setTArea('todas'); setTBusqueda('') }}
                className="mt-2 text-xs text-blue-500">Limpiar filtros</button>
            </div>
          : tareasFiltradas.map(t => <TaskCard key={t.id} t={t} showArea />)}
      </div>
    </div>
  )

  const ViewReuniones = () => (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-bold text-gray-900">Reuniones</h1>
        <button onClick={() => { setFormR(E_R); setEReunionId(null); setMReunion(true) }}
          className="flex items-center gap-1 text-sm bg-gray-900 text-white px-3 py-2 rounded-xl hover:bg-gray-700">
          <Plus className="w-4 h-4" /> Nueva
        </button>
      </div>
      <p className="text-sm text-gray-400 mb-4">{reunionesFiltradas.length} reunión(es)</p>
      <div className="bg-violet-50 border border-violet-100 rounded-2xl p-3 mb-4 flex items-start gap-2">
        <Calendar className="w-4 h-4 text-violet-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-violet-700">Distintas a las tareas — tienen fecha, hora y lugar. Cada reunión tiene un enlace para <strong>Google Calendar</strong>.</p>
      </div>
      <div className="space-y-3 mb-4">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-300 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={rBusqueda} onChange={e => setRBusqueda(e.target.value)} placeholder="Buscar reuniones..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400 bg-white" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <select value={rEstado} onChange={e => setREstado(e.target.value)} className={ic}>
            <option value="todos">Estado: Todos</option>
            <option value="programada">Programada</option>
            <option value="realizada">Realizada</option>
            <option value="cancelada">Cancelada</option>
          </select>
          <select value={rArea} onChange={e => setRArea(e.target.value)} className={ic}>
            <option value="todas">Área: Todas</option>
            {areas.map(a => <option key={a.id} value={a.id}>{a.emoji} {a.nombre}</option>)}
          </select>
        </div>
      </div>
      <div className="space-y-2">
        {reunionesFiltradas.length === 0
          ? <div className="bg-gray-50 rounded-2xl p-10 text-center"><p className="text-sm text-gray-400">Sin reuniones</p></div>
          : reunionesFiltradas.map(r => <MeetingCard key={r.id} r={r} showArea />)}
      </div>
    </div>
  )

  // ── MODALS ────────────────────────────────────────────────

  const mWrap = (title, onClose, children) => (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[93vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl z-10">
          <p className="font-semibold text-gray-900">{title}</p>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-xl"><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <div className="p-5 space-y-4">{children}</div>
      </div>
    </div>
  )

  const SaveBtn = ({ label, onClick }) => (
    <button onClick={onClick} disabled={saving}
      className="w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-semibold hover:bg-gray-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
      {saving && <Spinner />}{label}
    </button>
  )

  const ModalTarea = () => (
    mWrap(eTareaId ? 'Editar tarea' : 'Nueva tarea', () => { setMTarea(false); setETareaId(null); setFormT(E_T) }, <>
      <Field label="Título *"><input value={formT.titulo} onChange={e => setFormT({ ...formT, titulo: e.target.value })} className={ic} placeholder="¿Qué hay que hacer?" /></Field>
      <Field label="Área *">
        <select value={formT.area_id} onChange={e => setFormT({ ...formT, area_id: e.target.value })} className={ic}>
          <option value="">Seleccionar área...</option>
          {areas.map(a => <option key={a.id} value={a.id}>{a.emoji} {a.nombre}</option>)}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Estado">
          <select value={formT.estado} onChange={e => setFormT({ ...formT, estado: e.target.value })} className={ic}>
            <option value="pendiente">Pendiente</option><option value="en_progreso">En progreso</option><option value="completada">Completada</option>
          </select>
        </Field>
        <Field label="Prioridad">
          <select value={formT.prioridad} onChange={e => setFormT({ ...formT, prioridad: e.target.value })} className={ic}>
            <option value="alta">Alta</option><option value="media">Media</option><option value="baja">Baja</option>
          </select>
        </Field>
      </div>
      <Field label="Responsable">
        <select value={formT.responsable} onChange={e => setFormT({ ...formT, responsable: e.target.value })} className={ic}>
          {RESPONSABLES.map(r => <option key={r}>{r}</option>)}
        </select>
      </Field>
      <Field label="Fecha límite"><input type="date" value={formT.fecha} onChange={e => setFormT({ ...formT, fecha: e.target.value })} className={ic} /></Field>
      <Field label="Notas"><textarea value={formT.notas} onChange={e => setFormT({ ...formT, notas: e.target.value })} className={`${ic} resize-none`} rows={2} placeholder="Detalles adicionales..." /></Field>
      <SaveBtn label={eTareaId ? 'Guardar cambios' : 'Crear tarea'} onClick={saveTask} />
    </>
  )

  const ModalReunion = () => (
    mWrap(eReunionId ? 'Editar reunión' : 'Nueva reunión', () => { setMReunion(false); setEReunionId(null); setFormR(E_R) }, <>
      <div className="bg-violet-50 rounded-xl p-3 text-xs text-violet-700">📅 Esta reunión se podrá agendar en Google Calendar con un clic.</div>
      <Field label="Título *"><input value={formR.titulo} onChange={e => setFormR({ ...formR, titulo: e.target.value })} className={ic} placeholder="Ej: Reunión pastorado" /></Field>
      <Field label="Área *">
        <select value={formR.area_id} onChange={e => setFormR({ ...formR, area_id: e.target.value })} className={ic}>
          <option value="">Seleccionar área...</option>
          {areas.map(a => <option key={a.id} value={a.id}>{a.emoji} {a.nombre}</option>)}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Fecha *"><input type="date" value={formR.fecha} onChange={e => setFormR({ ...formR, fecha: e.target.value })} className={ic} /></Field>
        <Field label="Hora"><input type="time" value={formR.hora} onChange={e => setFormR({ ...formR, hora: e.target.value })} className={ic} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Duración">
          <select value={formR.duracion} onChange={e => setFormR({ ...formR, duracion: +e.target.value })} className={ic}>
            {[30, 45, 60, 90, 120, 180, 240].map(d => <option key={d} value={d}>{d} min</option>)}
          </select>
        </Field>
        <Field label="Estado">
          <select value={formR.estado} onChange={e => setFormR({ ...formR, estado: e.target.value })} className={ic}>
            <option value="programada">Programada</option><option value="realizada">Realizada</option><option value="cancelada">Cancelada</option>
          </select>
        </Field>
      </div>
      <Field label="Lugar"><input value={formR.lugar} onChange={e => setFormR({ ...formR, lugar: e.target.value })} className={ic} placeholder="Sala, Zoom, dirección..." /></Field>
      <Field label="Responsable">
        <select value={formR.responsable} onChange={e => setFormR({ ...formR, responsable: e.target.value })} className={ic}>
          {RESPONSABLES.map(r => <option key={r}>{r}</option>)}
        </select>
      </Field>
      <Field label="Descripción / Agenda"><textarea value={formR.descripcion} onChange={e => setFormR({ ...formR, descripcion: e.target.value })} className={`${ic} resize-none`} rows={2} placeholder="Puntos a tratar..." /></Field>
      <SaveBtn label={eReunionId ? 'Guardar cambios' : 'Crear reunión'} onClick={saveReunion} />
    </>
  )

  const ModalBitacora = () => (
    mWrap("Registro en bitácora", () => setMBitacora(false), <>
      <Field label="¿Qué ocurrió? *"><textarea value={formB.descripcion} onChange={e => setFormB({ ...formB, descripcion: e.target.value })} className={`${ic} resize-none`} rows={3} placeholder="Describe el evento, decisión o acción..." /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Tipo">
          <select value={formB.tipo} onChange={e => setFormB({ ...formB, tipo: e.target.value })} className={ic}>
            <option value="gestion">📋 Gestión</option><option value="reunion">🗓️ Reunión</option>
            <option value="completado">✅ Completado</option><option value="incidencia">⚠️ Incidencia</option>
          </select>
        </Field>
        <Field label="Registrado por">
          <select value={formB.autor} onChange={e => setFormB({ ...formB, autor: e.target.value })} className={ic}>
            <option>Camilo</option><option>Karen</option>
          </select>
        </Field>
      </div>
      <SaveBtn label="Guardar registro" onClick={saveBit} />
    </>
  )

  const ModalArea = () => (
    mWrap(eAreaId ? 'Editar área' : 'Nueva área', () => { setMArea(false); setEAreaId(null); setFormA(E_A) }, <>
      <div className="grid grid-cols-4 gap-3">
        <Field label="Emoji"><input value={formA.emoji} onChange={e => setFormA({ ...formA, emoji: e.target.value })} className={ic} maxLength={2} /></Field>
        <div className="col-span-3"><Field label="Nombre *"><input value={formA.nombre} onChange={e => setFormA({ ...formA, nombre: e.target.value })} className={ic} placeholder="Nombre del área" /></Field></div>
      </div>
      <Field label="Responsable">
        <select value={formA.responsable} onChange={e => setFormA({ ...formA, responsable: e.target.value })} className={ic}>
          {RESPONSABLES.map(r => <option key={r}>{r}</option>)}
        </select>
      </Field>
      <Field label="Descripción"><textarea value={formA.descripcion} onChange={e => setFormA({ ...formA, descripcion: e.target.value })} className={`${ic} resize-none`} rows={2} placeholder="¿De qué se encarga?" /></Field>
      <SaveBtn label={eAreaId ? 'Guardar cambios' : 'Crear área'} onClick={saveArea} />
    </>
  )

  const ModalGestAreas = () => (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl">
          <p className="font-semibold text-gray-900">Gestionar áreas</p>
          <button onClick={() => { setMGestAreas(false); setConfirmDelAreaId(null) }} className="p-1.5 hover:bg-gray-100 rounded-xl"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5">
          <button onClick={() => { setFormA(E_A); setEAreaId(null); setMArea(true); setMGestAreas(false) }}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-2xl py-3 text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700 mb-4 transition-colors">
            <Plus className="w-4 h-4" /> Agregar nueva área
          </button>
          <div className="space-y-2">
            {areas.map(area => (
              <div key={area.id} className="bg-gray-50 rounded-2xl p-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{area.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{area.nombre}</p>
                    <p className="text-xs text-gray-400">👤 {area.responsable}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => editArea(area)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-white rounded-xl"><Edit3 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setConfirmDelAreaId(confirmDelAreaId === area.id ? null : area.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                {confirmDelAreaId === area.id && (
                  <div className="mt-2 p-3 bg-red-50 rounded-xl">
                    <p className="text-xs text-red-700 font-medium mb-2">¿Eliminar "{area.nombre}"? También se borran sus tareas y reuniones.</p>
                    <div className="flex gap-2">
                      <button onClick={() => deleteArea(area.id)} className="flex-1 bg-red-600 text-white text-xs py-1.5 rounded-lg font-medium hover:bg-red-700">Sí, eliminar</button>
                      <button onClick={() => setConfirmDelAreaId(null)} className="flex-1 border border-gray-300 text-xs py-1.5 rounded-lg text-gray-600 hover:bg-gray-100">Cancelar</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  // ── RENDER ────────────────────────────────────────────────

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F8F7F4' }}>
      <div className="text-center"><span className="text-4xl block mb-4">🏛️</span><Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto" /></div>
    </div>
  )

  return (
    <div className="min-h-screen flex" style={{ background: '#F8F7F4' }}>

      {/* SIDEBAR (≥768px) */}
      <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-100 fixed inset-y-0 left-0 z-20">
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0"><span className="text-xl">🏛️</span></div>
            <div><p className="text-sm font-bold text-gray-900 leading-tight">Iglesia Itagüí</p><p className="text-xs text-gray-400">Panel pastoral</p></div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {nav4.map(({ id, label, icon: Icon }) => {
            const act = isAct(id)
            return (
              <button key={id} onClick={() => setVista(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${act ? 'bg-gray-900 text-white font-semibold' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'}`}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-left">{label}</span>
                {id === 'tareas'    && urgCnt   > 0 && <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${act ? 'bg-white text-red-600' : 'bg-red-100 text-red-600'}`}>{urgCnt}</span>}
                {id === 'reuniones' && rProgCnt > 0 && <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${act ? 'bg-white text-violet-600' : 'bg-violet-100 text-violet-600'}`}>{rProgCnt}</span>}
              </button>
            )
          })}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">C</div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-700">Camilo y Karen</p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl flex-shrink-0" title="Cerrar sesión">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 md:ml-56 pb-24 md:pb-10 min-h-screen">
        <div className="max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {vista === 'dashboard'    && <ViewDashboard />}
          {vista === 'areas'        && <ViewAreas />}
          {vista === 'area_detalle' && <ViewAreaDetalle />}
          {vista === 'tareas'       && <ViewTareas />}
          {vista === 'reuniones'    && <ViewReuniones />}
        </div>
      </main>

      {/* BOTTOM NAV (<768px) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 z-20" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex justify-around px-2 py-2">
          {nav4.map(({ id, label, icon: Icon }) => {
            const act = isAct(id)
            return (
              <button key={id} onClick={() => setVista(id)}
                className={`relative flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-all ${act ? 'text-gray-900' : 'text-gray-400'}`}>
                <Icon className="w-5 h-5" />
                <span className="text-xs leading-none">{label}</span>
                {id === 'tareas'    && urgCnt   > 0 && <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full" />}
                {id === 'reuniones' && rProgCnt > 0 && <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-violet-500 rounded-full" />}
              </button>
            )
          })}
        </div>
      </nav>

      {/* MODALS */}
      {mTarea     && ModalTarea()}
      {mReunion   && ModalReunion()}
      {mBitacora  && ModalBitacora()}
      {mArea      && ModalArea()}
      {mGestAreas && ModalGestAreas()}

      {/* TOAST */}
      {toast && (
        <div className={`fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-2xl text-sm font-medium shadow-xl whitespace-nowrap
          ${toast.type === 'del' ? 'bg-red-600 text-white' : 'bg-gray-900 text-white'}`}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}

// ── ROOT ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = checking auth

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) return <LoadingScreen />
  if (!session) return <Login />
  return <MainApp user={session.user} />
}

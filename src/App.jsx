import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { useData } from './lib/useData'
import { isUrgente } from './lib/constants'
import { Splash, Toast } from './components/ui'
import { LogOut } from 'lucide-react'
import Login from './screens/Login'
import Home from './screens/Home'
import Tasks from './screens/Tasks'
import Agenda from './screens/Agenda'
import Chat from './screens/Chat'
import { Areas, AreaDetail, ManageAreasSheet } from './screens/Areas'
import BottomNav from './components/BottomNav'
import { TaskModal, MeetingModal, AreaModal, BitacoraModal } from './components/modals'

function Shell({ user }) {
  const data = useData()
  const [vista, setVista] = useState('inicio')
  const [areaActual, setAreaActual] = useState(null)

  // Modales
  const [mTask, setMTask] = useState(false)
  const [mMeeting, setMMeeting] = useState(false)
  const [mArea, setMArea] = useState(false)
  const [mBitacora, setMBitacora] = useState(false)
  const [mManage, setMManage] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [editMeeting, setEditMeeting] = useState(null)
  const [editArea, setEditArea] = useState(null)

  const [toast, setToast] = useState(null)
  const showToast = (msg, type) => { setToast({ msg, type }); setTimeout(() => setToast(null), 2400) }

  const openArea = (area) => { setAreaActual(area); setVista('area_detalle') }

  // Wrap save handlers to show toasts
  const saveTarea = async (form, id) => { await data.saveTarea(form, id); showToast(id ? 'Tarea actualizada' : 'Tarea creada ✓') }
  const saveReunion = async (form, id) => { await data.saveReunion(form, id); showToast(id ? 'Reunión actualizada' : 'Reunión creada ✓') }
  const saveArea = async (form, id) => { await data.saveArea(form, id); showToast(id ? 'Área actualizada' : 'Área creada ✓') }
  const saveBitacora = async (form) => { await data.saveBitacora(areaActual.id, form); showToast('Registro guardado ✓') }

  // delete with toast
  const dataWithToast = {
    ...data,
    saveTarea, saveReunion, saveArea,
    deleteTarea: async id => { await data.deleteTarea(id); showToast('Eliminada', 'del') },
    deleteReunion: async id => { await data.deleteReunion(id); showToast('Eliminada', 'del') },
    deleteBitacora: async id => { await data.deleteBitacora(id); showToast('Eliminada', 'del') },
  }

  if (data.loading) return <div className="h-full"><Splash /></div>

  const urgCount = data.tareas.filter(isUrgente).length
  const reuCount = data.reuniones.filter(r => r.estado === 'programada').length

  return (
    <div className="h-full flex flex-col relative" style={{ background: 'var(--bg)' }}>
      <div className="flex-1 overflow-hidden pb-[76px]">
        {vista === 'inicio' && <Home data={data} user={user} setVista={setVista} openArea={openArea} />}
        {vista === 'tareas' && <Tasks data={dataWithToast} onNew={() => { setEditTask(null); setMTask(true) }} onEdit={t => { setEditTask(t); setMTask(true) }} />}
        {vista === 'agenda' && <Agenda data={dataWithToast} onNew={() => { setEditMeeting(null); setMMeeting(true) }} onEdit={r => { setEditMeeting(r); setMMeeting(true) }} />}
        {vista === 'chat' && <Chat data={{ ...data, saveTarea, saveReunion }} user={user} />}
        {vista === 'areas' && <Areas data={data} openArea={openArea} onManage={() => setMManage(true)} />}
        {vista === 'area_detalle' && areaActual && (
          <AreaDetail data={dataWithToast} area={data.areas.find(a => a.id === areaActual.id) || areaActual}
            onBack={() => setVista('areas')}
            onNewTask={() => { setEditTask(null); setMTask(true) }}
            onEditTask={t => { setEditTask(t); setMTask(true) }}
            onNewMeeting={() => { setEditMeeting(null); setMMeeting(true) }}
            onEditMeeting={r => { setEditMeeting(r); setMMeeting(true) }}
            onNewBitacora={() => setMBitacora(true)}
          />
        )}
      </div>

      {/* Logout flota arriba derecha solo en inicio */}
      {vista === 'inicio' && (
        <button onClick={() => supabase.auth.signOut()}
          className="pressable absolute top-6 right-[68px] w-10 h-10 rounded-[12px] bg-white border border-[var(--line)] flex items-center justify-center" style={{ boxShadow: 'var(--sh-sm)' }}>
          <LogOut className="w-4 h-4 text-[var(--ink-3)]" />
        </button>
      )}

      <BottomNav vista={vista} setVista={setVista} urgentes={urgCount} reuniones={reuCount} />

      {/* Modales */}
      <TaskModal open={mTask} onClose={() => { setMTask(false); setEditTask(null) }} areas={data.areas} editing={editTask}
        defaultAreaId={vista === 'area_detalle' ? areaActual?.id : null} onSave={saveTarea} />
      <MeetingModal open={mMeeting} onClose={() => { setMMeeting(false); setEditMeeting(null) }} areas={data.areas} editing={editMeeting}
        defaultAreaId={vista === 'area_detalle' ? areaActual?.id : null} onSave={saveReunion} />
      <AreaModal open={mArea} onClose={() => { setMArea(false); setEditArea(null) }} editing={editArea} onSave={saveArea} />
      <BitacoraModal open={mBitacora} onClose={() => setMBitacora(false)} onSave={saveBitacora} />
      <ManageAreasSheet open={mManage} onClose={() => setMManage(false)} areas={data.areas}
        onEdit={a => { setEditArea(a); setMManage(false); setMArea(true) }}
        onAdd={() => { setEditArea(null); setMManage(false); setMArea(true) }}
        onDelete={async id => { await data.deleteArea(id); showToast('Área eliminada', 'del') }} />

      <Toast toast={toast} />
    </div>
  )
}

export default function App() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) return <div className="h-full"><Splash /></div>
  if (!session) return <div className="h-full"><Login /></div>
  return <Shell user={session.user} />
}

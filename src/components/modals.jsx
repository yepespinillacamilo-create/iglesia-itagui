import { useState, useEffect } from 'react'
import { Sheet, Field, Button, inputCls } from './ui'
import { RESPONSABLES, HOY } from '../lib/constants'
import { Sparkles } from 'lucide-react'

// ── TAREA ──
export function TaskModal({ open, onClose, areas, editing, defaultAreaId, onSave }) {
  const EMPTY = { titulo: '', area_id: '', estado: 'pendiente', prioridad: 'media', responsable: 'Camilo', fecha: '', notas: '' }
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    if (!open) return
    if (editing) setForm({ ...editing, area_id: String(editing.area_id || ''), fecha: editing.fecha || '' })
    else setForm({ ...EMPTY, area_id: defaultAreaId ? String(defaultAreaId) : '' })
  }, [open])

  const submit = async () => {
    if (!form.titulo.trim() || !form.area_id) return
    setSaving(true); await onSave(form, editing?.id); setSaving(false); onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title={editing ? 'Editar tarea' : 'Nueva tarea'}>
      <Field label="¿Qué hay que hacer?">
        <input className={inputCls} value={form.titulo} onChange={e => set('titulo', e.target.value)} placeholder="Título de la tarea" autoFocus />
      </Field>
      <Field label="Área">
        <select className={inputCls} value={form.area_id} onChange={e => set('area_id', e.target.value)}>
          <option value="">Seleccionar…</option>
          {areas.map(a => <option key={a.id} value={a.id}>{a.emoji} {a.nombre}</option>)}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Estado">
          <select className={inputCls} value={form.estado} onChange={e => set('estado', e.target.value)}>
            <option value="pendiente">Pendiente</option>
            <option value="en_progreso">En progreso</option>
            <option value="completada">Completada</option>
          </select>
        </Field>
        <Field label="Prioridad">
          <select className={inputCls} value={form.prioridad} onChange={e => set('prioridad', e.target.value)}>
            <option value="alta">Alta</option><option value="media">Media</option><option value="baja">Baja</option>
          </select>
        </Field>
      </div>
      <Field label="Responsable">
        <select className={inputCls} value={form.responsable} onChange={e => set('responsable', e.target.value)}>
          {RESPONSABLES.map(r => <option key={r}>{r}</option>)}
        </select>
      </Field>
      <Field label="Fecha límite">
        <input type="date" className={inputCls} value={form.fecha} onChange={e => set('fecha', e.target.value)} />
      </Field>
      <Field label="Notas">
        <textarea className={inputCls + ' resize-none'} rows={2} value={form.notas} onChange={e => set('notas', e.target.value)} placeholder="Detalles adicionales…" />
      </Field>
      <Button onClick={submit} loading={saving}>{editing ? 'Guardar cambios' : 'Crear tarea'}</Button>
    </Sheet>
  )
}

// ── REUNIÓN ──
export function MeetingModal({ open, onClose, areas, editing, defaultAreaId, onSave }) {
  const EMPTY = { titulo: '', area_id: '', fecha: '', hora: '10:00', duracion: 60, lugar: '', descripcion: '', responsable: 'Camilo', estado: 'programada' }
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    if (!open) return
    if (editing) setForm({ ...editing, area_id: String(editing.area_id || ''), hora: editing.hora ? editing.hora.slice(0, 5) : '10:00' })
    else setForm({ ...EMPTY, area_id: defaultAreaId ? String(defaultAreaId) : '' })
  }, [open])

  const submit = async () => {
    if (!form.titulo.trim() || !form.area_id || !form.fecha) return
    setSaving(true); await onSave(form, editing?.id); setSaving(false); onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title={editing ? 'Editar reunión' : 'Nueva reunión'}>
      <div className="rounded-[12px] p-3 text-[12px] flex items-center gap-2" style={{ background: 'var(--violet-tint)', color: 'var(--violet)' }}>
        <Sparkles className="w-4 h-4 flex-shrink-0" /> Podrás agendarla en Google Calendar con un toque.
      </div>
      <Field label="Título">
        <input className={inputCls} value={form.titulo} onChange={e => set('titulo', e.target.value)} placeholder="Ej: Reunión de pastorado" autoFocus />
      </Field>
      <Field label="Área">
        <select className={inputCls} value={form.area_id} onChange={e => set('area_id', e.target.value)}>
          <option value="">Seleccionar…</option>
          {areas.map(a => <option key={a.id} value={a.id}>{a.emoji} {a.nombre}</option>)}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Fecha"><input type="date" className={inputCls} value={form.fecha} onChange={e => set('fecha', e.target.value)} /></Field>
        <Field label="Hora"><input type="time" className={inputCls} value={form.hora} onChange={e => set('hora', e.target.value)} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Duración">
          <select className={inputCls} value={form.duracion} onChange={e => set('duracion', +e.target.value)}>
            {[30, 45, 60, 90, 120, 180].map(d => <option key={d} value={d}>{d} min</option>)}
          </select>
        </Field>
        <Field label="Estado">
          <select className={inputCls} value={form.estado} onChange={e => set('estado', e.target.value)}>
            <option value="programada">Programada</option><option value="realizada">Realizada</option><option value="cancelada">Cancelada</option>
          </select>
        </Field>
      </div>
      <Field label="Lugar"><input className={inputCls} value={form.lugar} onChange={e => set('lugar', e.target.value)} placeholder="Sala, dirección, Zoom…" /></Field>
      <Field label="Responsable">
        <select className={inputCls} value={form.responsable} onChange={e => set('responsable', e.target.value)}>
          {RESPONSABLES.map(r => <option key={r}>{r}</option>)}
        </select>
      </Field>
      <Field label="Agenda / descripción">
        <textarea className={inputCls + ' resize-none'} rows={2} value={form.descripcion} onChange={e => set('descripcion', e.target.value)} placeholder="Puntos a tratar…" />
      </Field>
      <Button onClick={submit} loading={saving}>{editing ? 'Guardar cambios' : 'Crear reunión'}</Button>
    </Sheet>
  )
}

// ── ÁREA ──
export function AreaModal({ open, onClose, editing, onSave }) {
  const EMPTY = { nombre: '', emoji: '📌', responsable: 'Por definir', descripcion: '' }
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    if (!open) return
    setForm(editing ? { nombre: editing.nombre, emoji: editing.emoji, responsable: editing.responsable, descripcion: editing.descripcion || '' } : EMPTY)
  }, [open])

  const submit = async () => {
    if (!form.nombre.trim()) return
    setSaving(true); await onSave(form, editing?.id); setSaving(false); onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title={editing ? 'Editar área' : 'Nueva área'}>
      <div className="grid grid-cols-4 gap-3">
        <Field label="Emoji"><input className={inputCls + ' text-center'} value={form.emoji} onChange={e => set('emoji', e.target.value)} maxLength={2} /></Field>
        <div className="col-span-3">
          <Field label="Nombre"><input className={inputCls} value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Nombre del área" autoFocus /></Field>
        </div>
      </div>
      <Field label="Responsable">
        <select className={inputCls} value={form.responsable} onChange={e => set('responsable', e.target.value)}>
          {RESPONSABLES.map(r => <option key={r}>{r}</option>)}
        </select>
      </Field>
      <Field label="Descripción">
        <textarea className={inputCls + ' resize-none'} rows={2} value={form.descripcion} onChange={e => set('descripcion', e.target.value)} placeholder="¿De qué se encarga?" />
      </Field>
      <Button onClick={submit} loading={saving}>{editing ? 'Guardar cambios' : 'Crear área'}</Button>
    </Sheet>
  )
}

// ── BITÁCORA ──
export function BitacoraModal({ open, onClose, onSave }) {
  const EMPTY = { titulo: '', descripcion: '', autor: 'Camilo', tipo: 'gestion', fecha: HOY }
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => { if (open) setForm({ ...EMPTY, fecha: new Date().toISOString().split('T')[0] }) }, [open])

  const submit = async () => {
    if (!form.descripcion.trim()) return
    setSaving(true); await onSave(form); setSaving(false); onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title="Registro en bitácora">
      <Field label="Título (opcional)">
        <input className={inputCls} value={form.titulo} onChange={e => set('titulo', e.target.value)} placeholder="Ej: Reunión de seguimiento" autoFocus />
      </Field>
      <Field label="¿Qué ocurrió?">
        <textarea className={inputCls + ' resize-none'} rows={3} value={form.descripcion} onChange={e => set('descripcion', e.target.value)} placeholder="Describe el evento, decisión o acción…" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Tipo">
          <select className={inputCls} value={form.tipo} onChange={e => set('tipo', e.target.value)}>
            <option value="gestion">Gestión</option><option value="reunion">Reunión</option>
            <option value="completado">Completado</option><option value="incidencia">Incidencia</option>
          </select>
        </Field>
        <Field label="Fecha"><input type="date" className={inputCls} value={form.fecha} onChange={e => set('fecha', e.target.value)} /></Field>
      </div>
      <Field label="Registrado por">
        <select className={inputCls} value={form.autor} onChange={e => set('autor', e.target.value)}>
          <option>Camilo</option><option>Karen</option>
        </select>
      </Field>
      <Button onClick={submit} loading={saving}>Guardar registro</Button>
    </Sheet>
  )
}

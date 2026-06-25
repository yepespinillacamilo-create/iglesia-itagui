import { useState } from 'react'
import { Check, X, Pencil } from 'lucide-react'
import { RESPONSABLES } from '../lib/constants'

const inp = 'w-full bg-[var(--subtle)] border border-[var(--line)] rounded-[10px] px-3 py-2 text-[13px] outline-none focus:border-[var(--blue)] focus:bg-white transition-colors'
const lbl = 'text-[11px] font-semibold text-[var(--ink-4)] mb-1 block'

// Tarjeta de propuesta editable. El usuario confirma o ajusta antes de guardar.
export default function ProposalCard({ proposal, areas, nombre, onConfirm, onCancel }) {
  const esReunion = proposal.tipo === 'proponer_reunion'
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)
  const [discarded, setDiscarded] = useState(false)
  const [busy, setBusy] = useState(false)

  const [form, setForm] = useState({
    titulo: proposal.titulo || '',
    area_id: proposal.area_id ? String(proposal.area_id) : '',
    fecha: proposal.fecha || '',
    hora: proposal.hora || '10:00',
    lugar: proposal.lugar || '',
    prioridad: proposal.prioridad || 'media',
    responsable: nombre,
    notas: proposal.notas || '',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const area = areas.find(a => a.id === +form.area_id)

  const confirm = async () => {
    if (!form.titulo.trim() || !form.area_id) { setEditing(true); return }
    setBusy(true)
    await onConfirm(esReunion ? 'reunion' : 'tarea', form)
    setBusy(false); setSaved(true)
  }

  if (saved) {
    return (
      <div className="mt-2 flex items-center gap-2 p-3 rounded-[12px]" style={{ background: 'var(--green-tint)' }}>
        <Check className="w-4 h-4" style={{ color: 'var(--green)' }} />
        <p className="text-[12.5px] font-semibold" style={{ color: 'var(--green)' }}>
          {esReunion ? 'Reunión' : 'Tarea'} creada: {form.titulo}
        </p>
      </div>
    )
  }
  if (discarded) {
    return (
      <div className="mt-2 flex items-center gap-2 p-3 rounded-[12px]" style={{ background: 'var(--subtle)' }}>
        <X className="w-4 h-4 text-[var(--ink-4)]" />
        <p className="text-[12.5px] text-[var(--ink-3)]">Propuesta descartada</p>
      </div>
    )
  }

  return (
    <div className="mt-2 rounded-[14px] border bg-white overflow-hidden" style={{ borderColor: 'var(--line-2)' }}>
      <div className="px-3 py-2 flex items-center justify-between" style={{ background: esReunion ? 'var(--violet-tint)' : 'var(--blue-tint)' }}>
        <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: esReunion ? 'var(--violet)' : 'var(--blue)' }}>
          {esReunion ? '🗓️ Propuesta de reunión' : '📌 Propuesta de tarea'}
        </span>
        <button onClick={() => setEditing(e => !e)} className="pressable flex items-center gap-1 text-[11px] font-semibold" style={{ color: esReunion ? 'var(--violet)' : 'var(--blue)' }}>
          <Pencil className="w-3 h-3" /> {editing ? 'Listo' : 'Editar'}
        </button>
      </div>

      <div className="p-3 space-y-2.5">
        {editing ? (
          <>
            <div>
              <label className={lbl}>Título</label>
              <input className={inp} value={form.titulo} onChange={e => set('titulo', e.target.value)} placeholder="Título" />
            </div>
            <div>
              <label className={lbl}>Área</label>
              <select className={inp} value={form.area_id} onChange={e => set('area_id', e.target.value)}>
                <option value="">Seleccionar…</option>
                {areas.map(a => <option key={a.id} value={a.id}>{a.emoji} {a.nombre}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={lbl}>Fecha</label>
                <input type="date" className={inp} value={form.fecha} onChange={e => set('fecha', e.target.value)} />
              </div>
              {esReunion ? (
                <div>
                  <label className={lbl}>Hora</label>
                  <input type="time" className={inp} value={form.hora} onChange={e => set('hora', e.target.value)} />
                </div>
              ) : (
                <div>
                  <label className={lbl}>Prioridad</label>
                  <select className={inp} value={form.prioridad} onChange={e => set('prioridad', e.target.value)}>
                    <option value="alta">Alta</option><option value="media">Media</option><option value="baja">Baja</option>
                  </select>
                </div>
              )}
            </div>
            {esReunion && (
              <div>
                <label className={lbl}>Lugar</label>
                <input className={inp} value={form.lugar} onChange={e => set('lugar', e.target.value)} placeholder="Lugar" />
              </div>
            )}
            <div>
              <label className={lbl}>Responsable</label>
              <select className={inp} value={form.responsable} onChange={e => set('responsable', e.target.value)}>
                {RESPONSABLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </>
        ) : (
          <>
            <p className="text-[14px] font-bold leading-snug">{form.titulo || <span className="text-[var(--red)]">⚠️ Sin título — toca Editar</span>}</p>
            <div className="flex flex-wrap gap-1.5">
              <Tag label={area ? `${area.emoji} ${area.nombre}` : '⚠️ Sin área'} warn={!area} />
              {form.fecha ? <Tag label={`📅 ${form.fecha}`} /> : <Tag label="Sin fecha" muted />}
              {esReunion && form.hora ? <Tag label={`🕐 ${form.hora}`} /> : null}
              {esReunion && form.lugar ? <Tag label={`📍 ${form.lugar}`} /> : null}
              {!esReunion ? <Tag label={`Prioridad: ${form.prioridad}`} /> : null}
              <Tag label={`👤 ${form.responsable}`} />
            </div>
          </>
        )}

        <div className="flex gap-2 pt-1">
          <button onClick={confirm} disabled={busy}
            className="pressable flex-1 flex items-center justify-center gap-1.5 text-[13px] font-semibold text-white py-2.5 rounded-[11px] disabled:opacity-60"
            style={{ background: 'var(--blue)', boxShadow: 'var(--sh-blue)' }}>
            <Check className="w-4 h-4" /> {busy ? 'Creando…' : `Crear ${esReunion ? 'reunión' : 'tarea'}`}
          </button>
          <button onClick={() => { setDiscarded(true); onCancel?.() }}
            className="pressable px-4 text-[13px] font-semibold rounded-[11px] border border-[var(--line-2)] text-[var(--ink-3)]">
            Descartar
          </button>
        </div>
      </div>
    </div>
  )
}

function Tag({ label, warn, muted }) {
  return (
    <span className="text-[11px] font-semibold px-2 py-1 rounded-lg"
      style={warn ? { background: 'var(--red-tint)', color: 'var(--red)' }
        : muted ? { background: 'var(--subtle)', color: 'var(--ink-4)' }
        : { background: 'var(--subtle)', color: 'var(--ink-2)' }}>
      {label}
    </span>
  )
}

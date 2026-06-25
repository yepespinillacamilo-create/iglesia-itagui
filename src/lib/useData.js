import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'
import { HOY } from './constants'

export function useData() {
  const [areas, setAreas] = useState([])
  const [tareas, setTareas] = useState([])
  const [reuniones, setReuniones] = useState([])
  const [bitacora, setBitacora] = useState([])
  const [loading, setLoading] = useState(true)

  const loadAreas     = useCallback(async () => { const { data } = await supabase.from('areas').select('*').order('id'); setAreas(data || []) }, [])
  const loadTareas    = useCallback(async () => { const { data } = await supabase.from('tareas').select('*').order('created_at', { ascending: false }); setTareas(data || []) }, [])
  const loadReuniones = useCallback(async () => { const { data } = await supabase.from('reuniones').select('*').order('fecha'); setReuniones(data || []) }, [])
  const loadBitacora  = useCallback(async () => { const { data } = await supabase.from('bitacora').select('*').order('created_at', { ascending: false }); setBitacora(data || []) }, [])

  const loadAll = useCallback(async () => {
    setLoading(true)
    await Promise.all([loadAreas(), loadTareas(), loadReuniones(), loadBitacora()])
    setLoading(false)
  }, [loadAreas, loadTareas, loadReuniones, loadBitacora])

  useEffect(() => { loadAll() }, [loadAll])

  // ── Tareas ──
  const saveTarea = async (form, editId) => {
    const p = {
      titulo: form.titulo, area_id: form.area_id ? +form.area_id : null,
      estado: form.estado || 'pendiente', prioridad: form.prioridad || 'media',
      responsable: form.responsable || 'Camilo', fecha: form.fecha || null, notas: form.notas || '',
    }
    if (editId) await supabase.from('tareas').update(p).eq('id', editId)
    else await supabase.from('tareas').insert(p)
    await loadTareas()
  }
  const deleteTarea = async id => { await supabase.from('tareas').delete().eq('id', id); await loadTareas() }
  const setTareaEstado = async (id, estado) => {
    setTareas(ts => ts.map(t => t.id === id ? { ...t, estado } : t))
    await supabase.from('tareas').update({ estado }).eq('id', id)
  }

  // ── Reuniones ──
  const saveReunion = async (form, editId) => {
    const p = {
      titulo: form.titulo, area_id: form.area_id ? +form.area_id : null,
      fecha: form.fecha || null, hora: form.hora || null, duracion: +form.duracion || 60,
      lugar: form.lugar || '', descripcion: form.descripcion || '',
      responsable: form.responsable || 'Camilo', estado: form.estado || 'programada',
    }
    if (editId) await supabase.from('reuniones').update(p).eq('id', editId)
    else await supabase.from('reuniones').insert(p)
    await loadReuniones()
  }
  const deleteReunion = async id => { await supabase.from('reuniones').delete().eq('id', id); await loadReuniones() }
  const setReunionEstado = async (id, estado) => {
    setReuniones(rs => rs.map(r => r.id === id ? { ...r, estado } : r))
    await supabase.from('reuniones').update({ estado }).eq('id', id)
  }

  // ── Áreas ──
  const saveArea = async (form, editId) => {
    const p = { nombre: form.nombre, emoji: form.emoji || '📌', responsable: form.responsable || 'Por definir', descripcion: form.descripcion || '' }
    if (editId) await supabase.from('areas').update(p).eq('id', editId)
    else await supabase.from('areas').insert(p)
    await loadAreas()
  }
  const deleteArea = async id => { await supabase.from('areas').delete().eq('id', id); await loadAll() }

  // ── Bitácora ──
  const saveBitacora = async (areaId, form) => {
    await supabase.from('bitacora').insert({
      area_id: areaId, titulo: form.titulo || null, descripcion: form.descripcion,
      autor: form.autor || 'Camilo', tipo: form.tipo || 'gestion', fecha: form.fecha || HOY,
    })
    await loadBitacora()
  }
  const deleteBitacora = async id => { await supabase.from('bitacora').delete().eq('id', id); await loadBitacora() }

  return {
    areas, tareas, reuniones, bitacora, loading,
    reload: loadAll, reloadTareas: loadTareas, reloadReuniones: loadReuniones,
    saveTarea, deleteTarea, setTareaEstado,
    saveReunion, deleteReunion, setReunionEstado,
    saveArea, deleteArea,
    saveBitacora, deleteBitacora,
  }
}

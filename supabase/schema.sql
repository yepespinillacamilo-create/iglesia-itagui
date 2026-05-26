-- ============================================================
-- IGLESIA ITAGÜÍ - PANEL PASTORAL
-- Ejecuta este script en Supabase > SQL Editor > New query
-- ============================================================

-- 1. TABLAS ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS areas (
  id          SERIAL PRIMARY KEY,
  nombre      TEXT NOT NULL,
  emoji       TEXT NOT NULL DEFAULT '📌',
  responsable TEXT NOT NULL DEFAULT 'Por definir',
  descripcion TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tareas (
  id          SERIAL PRIMARY KEY,
  titulo      TEXT NOT NULL,
  area_id     INTEGER REFERENCES areas(id) ON DELETE CASCADE,
  estado      TEXT NOT NULL DEFAULT 'pendiente',   -- pendiente | en_progreso | completada
  prioridad   TEXT NOT NULL DEFAULT 'media',        -- alta | media | baja
  responsable TEXT,
  fecha       DATE,
  notas       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reuniones (
  id          SERIAL PRIMARY KEY,
  titulo      TEXT NOT NULL,
  area_id     INTEGER REFERENCES areas(id) ON DELETE CASCADE,
  fecha       DATE,
  hora        TEXT,                                 -- formato HH:MM
  duracion    INTEGER DEFAULT 60,                   -- minutos
  lugar       TEXT,
  descripcion TEXT,
  responsable TEXT,
  estado      TEXT NOT NULL DEFAULT 'programada',   -- programada | realizada | cancelada
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bitacora (
  id          SERIAL PRIMARY KEY,
  area_id     INTEGER REFERENCES areas(id) ON DELETE CASCADE,
  fecha       DATE DEFAULT CURRENT_DATE,
  descripcion TEXT NOT NULL,
  autor       TEXT NOT NULL,
  tipo        TEXT NOT NULL DEFAULT 'gestion',      -- gestion | reunion | completado | incidencia
  created_at  TIMESTAMPTZ DEFAULT NOW()
);


-- 2. ROW LEVEL SECURITY (RLS) ──────────────────────────────
-- Solo usuarios autenticados (Camilo y Karen) pueden acceder

ALTER TABLE areas    ENABLE ROW LEVEL SECURITY;
ALTER TABLE tareas   ENABLE ROW LEVEL SECURITY;
ALTER TABLE reuniones ENABLE ROW LEVEL SECURITY;
ALTER TABLE bitacora ENABLE ROW LEVEL SECURITY;

-- Políticas: lectura, escritura, edición y eliminación para usuarios autenticados
CREATE POLICY "auth_all_areas"     ON areas     FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_tareas"    ON tareas    FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_reuniones" ON reuniones FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_bitacora"  ON bitacora  FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- 3. DATOS INICIALES (9 Áreas) ─────────────────────────────

INSERT INTO areas (nombre, emoji, responsable, descripcion) VALUES
  ('Sonido',             '🔊', 'Camilo',         'Equipo técnico de sonido y proyección audiovisual del servicio.'),
  ('Vigilancia',         '🛡️', 'Karen',          'Equipo de puerta y seguridad durante los servicios.'),
  ('Predicación',        '📖', 'Camilo y Karen', 'Preparación de enseñanzas, estudios bíblicos y videos semanales.'),
  ('Fundación M.L.',     '🤝', 'Karen',          'Coordinaciones y lineamientos de la Fundación Internacional María Luisa de Moreno.'),
  ('Partido Mira',       '🏛️', 'Camilo',         'Comunas de Itagüí, delegados políticos y de comunicaciones.'),
  ('Libertad Religiosa', '🌍', 'Camilo',         'Mesa interreligiosa de Itagüí y temas de libertad religiosa.'),
  ('Instituto Bíblico',  '📚', 'Karen',          'Clases, programas y seguimiento del instituto bíblico.'),
  ('Pastorado',          '⛪', 'Camilo y Karen', 'Reuniones de pastorado y grupo pastoral especializado.'),
  ('Profetizadores',     '🕊️', 'Karen',          'Organización, calendario y reuniones del grupo de profetizadores.');

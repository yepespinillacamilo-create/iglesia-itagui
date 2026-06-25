import {
  Mic2, ShieldCheck, BookOpen, HeartHandshake, Landmark, Scale,
  GraduationCap, Users, Megaphone, Folder, Music, Calendar,
  Hammer, Briefcase, Globe, Star
} from 'lucide-react'

// Mapeo de áreas a íconos neutros (sin símbolos religiosos).
// Se elige por palabra clave en el nombre del área.
const ICON_BY_KEYWORD = [
  [/sonido|audio|m[uú]sica/i, Mic2],
  [/vigilan|seguri|puerta/i, ShieldCheck],
  [/predica|ense[ñn]anza|estudio|b[íi]blic/i, BookOpen],
  [/fundaci/i, HeartHandshake],
  [/mira|pol[íi]tic|comuna/i, Landmark],
  [/libertad|interreligios|religios/i, Scale],
  [/instituto/i, GraduationCap],
  [/pastorad/i, Users],
  [/profetiz/i, Megaphone],
  [/instituto|clase/i, GraduationCap],
]

export function areaIcon(area) {
  if (!area) return Folder
  const name = area.nombre || ''
  for (const [re, Icon] of ICON_BY_KEYWORD) {
    if (re.test(name)) return Icon
  }
  return Folder
}

// Color de acento rotativo por id de área (consistente)
const ACCENTS = [
  { tint: 'var(--blue-tint)',   fg: 'var(--blue)'   },
  { tint: 'var(--violet-tint)', fg: 'var(--violet)' },
  { tint: 'var(--amber-tint)',  fg: 'var(--amber)'  },
  { tint: 'var(--green-tint)',  fg: 'var(--green)'  },
  { tint: 'var(--red-tint)',    fg: 'var(--red)'    },
]
export function areaAccent(area) {
  if (!area) return ACCENTS[0]
  return ACCENTS[(area.id - 1) % ACCENTS.length]
}

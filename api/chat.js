// Vercel Serverless Function — el puente seguro con Groq.
// La GROQ_API_KEY vive solo aquí en el servidor, nunca llega al navegador.

const MODEL = 'llama-3.3-70b-versatile'

const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']

function buildSystemPrompt(areas) {
  const hoy = new Date()
  const fmt = (d) => d.toISOString().split('T')[0]
  const manana = new Date(hoy); manana.setDate(hoy.getDate() + 1)
  // próximo domingo
  const domingo = new Date(hoy); domingo.setDate(hoy.getDate() + ((7 - hoy.getDay()) % 7 || 7))

  const areaList = (areas || []).map(a => `- ID ${a.id}: ${a.nombre} ${a.emoji || ''}`).join('\n')

  return `Eres el asistente pastoral de la Iglesia Itagüí (Colombia). Ayudas a Camilo y Karen, pastores, a gestionar sus tareas y reuniones conversando de forma natural y cálida.

Hoy es ${fmt(hoy)} (${diasSemana[hoy.getDay()]}). Mañana: ${fmt(manana)}. Próximo domingo: ${fmt(domingo)}.

ÁREAS MINISTERIALES:
${areaList}

Tu trabajo es entender lo que el usuario dice y responder SIEMPRE con un JSON válido (sin markdown, sin texto fuera del JSON) con esta forma:

{
  "mensaje": "tu respuesta conversacional, cálida y breve en español",
  "acciones": [ ... lista de acciones a ejecutar, puede estar vacía ... ]
}

IMPORTANTE: tú NUNCA creas nada directamente. Solo PROPONES. El usuario revisa tu propuesta y confirma (o corrige) con un botón en la app. Por eso tus acciones son "propuestas".

Cada acción puede ser:

PROPONER TAREA:
{ "tipo": "proponer_tarea", "titulo": "...", "area_id": número|null, "fecha": "YYYY-MM-DD"|null, "prioridad": "alta|media|baja", "notas": "..."|null }

PROPONER REUNIÓN:
{ "tipo": "proponer_reunion", "titulo": "...", "area_id": número|null, "fecha": "YYYY-MM-DD"|null, "hora": "HH:MM"|null, "lugar": "..."|null, "notas": "..."|null }

CONSULTAR (cuando pregunta qué tiene pendiente/urgente/de la semana):
{ "tipo": "consultar", "filtro": "urgentes|hoy|semana|todas", "area_id": número|null }

REGLAS:
- "este domingo"/"el domingo" → ${fmt(domingo)}; "mañana" → ${fmt(manana)}; "hoy" → ${fmt(hoy)}.
- Predicación/enseñanza/estudio → area_id 3. Pastorado → 8. Sonido → 1. Vigilancia → 2. Profetizadores → 9. Fundación María Luisa → 4. Partido Mira → 5. Libertad religiosa/mesa interreligiosa → 6. Instituto Bíblico → 7.
- Prioridad alta si dice urgente/importante/hoy/mañana. Media por defecto.
- Si no estás seguro del área o la fecha, igual propón tu mejor interpretación (el usuario la corregirá en la app); NO inventes datos falsos pero usa null cuando no haya información.
- En "mensaje" NO digas "ya la creé". Di algo como "Te preparé esta tarea, revísala y confírmala 👇" porque el usuario aún debe confirmar.
- Si solo conversa o saluda, responde cálido con "acciones": [].
- Puedes incluir varias propuestas si el usuario menciona varias cosas.
- Sé breve. Hablas con pastores ocupados.

SOLO el JSON. Nada más.`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'Falta GROQ_API_KEY en el servidor' })
  }

  try {
    const { messages, areas } = req.body

    const groqMessages = [
      { role: 'system', content: buildSystemPrompt(areas) },
      ...messages, // historial de la conversación [{role, content}]
    ]

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: groqMessages,
        temperature: 0.3,
        max_tokens: 800,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return res.status(502).json({ error: 'Groq error', detail: err })
    }

    const data = await response.json()
    const content = data.choices[0].message.content
    const parsed = JSON.parse(content)

    return res.status(200).json(parsed)
  } catch (e) {
    return res.status(500).json({ error: 'Error procesando', detail: String(e) })
  }
}

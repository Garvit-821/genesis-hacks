/**
 * Source of truth for events: data/Genesis_Event_Database.xlsx, sheet "Events".
 * Run `npm run events` (also runs before every build) to regenerate src/data/events.json.
 * No dependencies: an .xlsx is a zip of XML, read here with node:zlib.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { inflateRawSync } from 'node:zlib'

const XLSX = new URL('../data/Genesis_Event_Database.xlsx', import.meta.url)
const OUT = new URL('../src/data/events.json', import.meta.url)
const SHEET = 'Events'

function unzip(buf) {
  const files = {}
  let eocd = buf.length - 22
  while (eocd >= 0 && buf.readUInt32LE(eocd) !== 0x06054b50) eocd--
  if (eocd < 0) throw new Error('Not a zip file')
  let p = buf.readUInt32LE(eocd + 16)
  for (let n = buf.readUInt16LE(eocd + 10); n > 0; n--) {
    const method = buf.readUInt16LE(p + 10)
    const size = buf.readUInt32LE(p + 20)
    const nameLen = buf.readUInt16LE(p + 28)
    const local = buf.readUInt32LE(p + 42)
    const name = buf.toString('utf8', p + 46, p + 46 + nameLen)
    const start = local + 30 + buf.readUInt16LE(local + 26) + buf.readUInt16LE(local + 28)
    const raw = buf.subarray(start, start + size)
    files[name] = () => (method === 0 ? raw : inflateRawSync(raw)).toString('utf8')
    p += 46 + nameLen + buf.readUInt16LE(p + 30) + buf.readUInt16LE(p + 32)
  }
  return files
}

const decode = (s) =>
  s.replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&')
const texts = (xml) => [...xml.matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)].map((m) => decode(m[1])).join('')

function readSheet(path, sheetName) {
  const zip = unzip(readFileSync(path))
  const shared = [...zip['xl/sharedStrings.xml']().matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) => texts(m[1]))
  const wb = zip['xl/workbook.xml']()
  const sheet = [...wb.matchAll(/<sheet\b[^>]*>/g)].map((m) => m[0]).find((t) => decode(/name="([^"]*)"/.exec(t)[1]) === sheetName)
  if (!sheet) throw new Error(`Sheet "${sheetName}" not found`)
  const rid = /r:id="([^"]*)"/.exec(sheet)[1]
  const rel = [...zip['xl/_rels/workbook.xml.rels']().matchAll(/<Relationship\b[^>]*>/g)].map((m) => m[0]).find((t) => t.includes(`Id="${rid}"`))
  const xml = zip['xl/' + /Target="([^"]*)"/.exec(rel)[1].replace(/^\/?xl\//, '')]()
  return [...xml.matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)].map((row) => {
    const cells = {}
    for (const c of row[1].matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const col = /r="([A-Z]+)\d+"/.exec(c[1])?.[1]
      const type = /t="(\w+)"/.exec(c[1])?.[1]
      const v = /<v>([\s\S]*?)<\/v>/.exec(c[2] || '')?.[1]
      const value = type === 's' ? shared[+v] : type === 'inlineStr' ? texts(c[2] || '') : v != null ? decode(v) : ''
      if (col && value !== '' && value != null) cells[col] = String(value).trim()
    }
    return cells
  })
}

const MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 }
/** "22–23 Aug 2026" | "31 Jan – 01 Feb 2026" | "Apr 2026 (approx.)" → ISO date of the first day. */
function isoOf(date) {
  const year = /(20\d{2})/.exec(date)?.[1]
  if (!year) return null
  const first = /(\d{1,2})?\s*(?:[–-]\s*\d{1,2}\s*)?([A-Za-z]{3})/.exec(date)
  const month = first && MONTHS[first[2].toLowerCase()]
  if (!month) return null
  const y = /[A-Za-z]{3}\s*[–-].*[A-Za-z]{3}\s+20\d{2}/.test(date) && month > MONTHS[/([A-Za-z]{3})\s+20\d{2}/.exec(date)[1].toLowerCase()] ? +year - 1 : +year
  return `${y}-${String(month).padStart(2, '0')}-${String(first[1] || 1).padStart(2, '0')}`
}
const slug = (s) => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
/** Roles where Genesis ran the event itself, as opposed to supporting someone else's. */
const OWN = new Set(['Organised', 'Co-organised'])
const SITE = 'https://www.genesishacks.com'

const [header, ...rows] = readSheet(XLSX, SHEET).filter((r) => r.B)
const col = Object.fromEntries(Object.entries(header).map(([k, v]) => [v, k]))
for (const need of ['Date', 'Event', 'Type', 'City', 'Venue', 'Organiser', 'Genesis Role', 'Participants', 'Prize Pool', 'Link', 'ID'])
  if (!col[need]) throw new Error(`Column "${need}" is missing from the ${SHEET} sheet`)

const seen = new Set()
const events = rows.map((r) => {
  const get = (name) => r[col[name]] || null
  const date = get('Date')
  const link = get('Link')
  let id = slug(get('Event'))
  if (seen.has(id)) id += '-' + (get('ID') || '').toLowerCase()
  seen.add(id)
  const onSite = !!link?.startsWith(SITE)
  const internal = onSite && link.slice(SITE.length).replace(/\/$/, '') !== '/events' && link.length > SITE.length + 1 ? link.slice(SITE.length) : null
  return {
    id,
    ref: get('ID'),
    title: get('Event'),
    iso: date ? isoOf(date) : null,
    date,
    year: date ? /(20\d{2})/.exec(date)?.[1] ?? null : null,
    venue: get('Venue'),
    city: get('City'),
    category: get('Type') || 'Other',
    organiser: get('Organiser'),
    role: get('Genesis Role') || 'Partner',
    own: OWN.has(get('Genesis Role')),
    participants: get('Participants'),
    prize: get('Prize Pool'),
    path: internal,
    link: onSite ? null : link,
    status: 'past',
  }
})

const uniq = (list) => [...new Set(list.filter(Boolean))]
const byCount = (key) => {
  const n = {}
  events.forEach((e) => e[key] && (n[e[key]] = (n[e[key]] || 0) + 1))
  return Object.keys(n).sort((a, b) => n[b] - n[a] || a.localeCompare(b))
}
const out = {
  generated: `From data/Genesis_Event_Database.xlsx, sheet "${SHEET}". Do not edit by hand; run npm run events.`,
  events,
  categories: byCount('category'),
  roles: byCount('role'),
  cities: uniq(events.map((e) => e.city)).filter((c) => c !== 'Online').sort(),
  years: uniq(events.map((e) => e.year)).sort().reverse(),
  totals: { events: events.length, own: events.filter((e) => e.own).length, hackathons: events.filter((e) => e.category === 'Hackathon').length },
}
writeFileSync(OUT, JSON.stringify(out))
const undated = events.filter((e) => !e.iso).map((e) => e.title)
console.log(`events: ${events.length} · own: ${out.totals.own} · cities: ${out.cities.length} · years: ${out.years.join(', ')}${undated.length ? ` · undated: ${undated.join('; ')}` : ''}`)

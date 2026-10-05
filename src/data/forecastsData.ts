import type { ForecastDataset, ForecastVersion } from '../types'
import { sanityClient } from './sanityClient'

interface RawVersion {
  id: string
  label: string
  published: string
  summary?: string
  grid?: string
}
interface RawDataset {
  id: string
  name: string
  unit?: string
  dimensionName?: string
  moduleId?: string
  versions?: RawVersion[]
}

const QUERY = `*[_type == "forecastDataset" && defined(slug.current)] | order(name asc){
  "id": slug.current,
  name,
  unit,
  dimensionName,
  "moduleId": module->slug.current,
  versions[]{ "id": _key, label, "published": publishedAt, summary, grid }
}`

interface ParsedGrid {
  years: number[]
  categories: string[]
  data: Record<string, number[]>
}

/** Parse a tab- or comma-separated grid (pasted from Excel) into years/categories/data. */
function parseGrid(grid?: string): ParsedGrid | null {
  if (!grid) return null
  const lines = grid
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
  if (lines.length < 2) return null
  const delim = lines[0].includes('\t') ? '\t' : ','
  const header = lines[0].split(delim).map((c) => c.trim())
  const years = header
    .slice(1)
    .map((c) => parseInt(c.replace(/[^0-9-]/g, ''), 10))
    .filter((n) => !Number.isNaN(n))
  if (years.length === 0) return null

  const categories: string[] = []
  const data: Record<string, number[]> = {}
  for (const line of lines.slice(1)) {
    const cells = line.split(delim).map((c) => c.trim())
    const cat = cells[0]
    if (!cat) continue
    const vals = years.map((_, i) => {
      const n = parseFloat((cells[i + 1] ?? '').replace(/[, ]/g, ''))
      return Number.isNaN(n) ? 0 : n
    })
    categories.push(cat)
    data[cat] = vals
  }
  if (categories.length === 0) return null
  return { years, categories, data }
}

/** Build the app's ForecastDataset, normalising every version to the newest version's shape. */
function buildDataset(raw: RawDataset): ForecastDataset | null {
  const versionsRaw = (raw.versions ?? []).filter((v) => v.grid)
  if (versionsRaw.length === 0) return null
  // Newest first, so version[i+1] is always the older one (matches the compare logic).
  const sorted = [...versionsRaw].sort((a, b) => (b.published ?? '').localeCompare(a.published ?? ''))
  const canonical = parseGrid(sorted[0].grid)
  if (!canonical) return null
  const { years, categories } = canonical

  const versions: ForecastVersion[] = sorted.map((v) => {
    const parsed = parseGrid(v.grid)
    const data: Record<string, number[]> = {}
    for (const cat of categories) {
      data[cat] = years.map((y) => {
        if (!parsed) return 0
        const yi = parsed.years.indexOf(y)
        if (yi < 0 || !parsed.data[cat]) return 0
        return parsed.data[cat][yi] ?? 0
      })
    }
    return { id: v.id, label: v.label, published: v.published, summary: v.summary ?? '', data }
  })

  return {
    id: raw.id,
    moduleId: raw.moduleId ?? '',
    name: raw.name,
    unit: raw.unit ?? '',
    dimensionName: raw.dimensionName ?? 'Category',
    categories,
    years,
    versions,
  }
}

export async function getForecastDatasets(): Promise<ForecastDataset[]> {
  const raw = await sanityClient.fetch<RawDataset[]>(QUERY)
  return raw.map(buildDataset).filter((d): d is ForecastDataset => d !== null)
}

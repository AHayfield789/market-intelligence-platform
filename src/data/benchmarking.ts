import type { PortableTextBlock } from '@portabletext/types'
import { sanityClient } from './sanityClient'
import type { ImageSource } from './imageUrl'
import { getPivot, type DbDataset } from './pivot'

export type { DbDataset } from './pivot'

export interface Facility {
  entity: string
  address: string
  town: string
  country: string
  region: string
  latitude: number | null
  longitude: number | null
  products: string
  motionControls: boolean | null
  sizeSqm: number | null
  status: string
  date: string | null
  note: string
  /** Convenience label: "Town, Country" (falls back to the address). */
  location: string
}

/** Company-level profile (facilities are company-wide, not per module). */
export interface CompanyProfile {
  name: string
  facilities: Facility[]
}

// Each facility is its own document, referencing a company.
const PROFILE_QUERY = `*[_type == "facility" && defined(company)]{
  "company": company->name,
  entity, address, town, country, region,
  latitude, longitude, products, motionControls, sizeSqm,
  status, date, note
}`

export async function getCompanyProfiles(): Promise<CompanyProfile[]> {
  const raw = await sanityClient.fetch<Record<string, unknown>[]>(PROFILE_QUERY)
  const byCompany = new Map<string, Facility[]>()
  for (const r of raw ?? []) {
    const name = String(r.company ?? '').trim()
    if (!name) continue
    const town = (r.town as string) ?? ''
    const country = (r.country as string) ?? ''
    const list = byCompany.get(name) ?? []
    list.push({
      entity: (r.entity as string) ?? '',
      address: (r.address as string) ?? '',
      town,
      country,
      region: (r.region as string) || 'Other',
      latitude: typeof r.latitude === 'number' ? r.latitude : null,
      longitude: typeof r.longitude === 'number' ? r.longitude : null,
      products: (r.products as string) ?? '',
      motionControls: typeof r.motionControls === 'boolean' ? r.motionControls : null,
      sizeSqm: typeof r.sizeSqm === 'number' ? r.sizeSqm : null,
      status: (r.status as string) || 'operating',
      date: (r.date as string) ?? null,
      note: (r.note as string) ?? '',
      location: [town, country].filter(Boolean).join(', ') || ((r.address as string) ?? ''),
    })
    byCompany.set(name, list)
  }
  return [...byCompany.entries()].map(([name, facilities]) => ({ name, facilities }))
}

export interface Announcement {
  date: string | null
  title: string
  detail: string
}

/** Analyst commentary on a company, curated in Sanity. Paired to the numbers by name. */
export interface CompanyNote {
  id: string
  name: string
  hq: string
  currentTake: string
  productPositioning: PortableTextBlock[]
  strategy: PortableTextBlock[]
  announcements: Announcement[]
  otherCommentary: PortableTextBlock[]
  moduleId: string | null
  logo: ImageSource | null
}

// One row per (company × module) analysis entry, with company fields resolved via the reference.
const COMPANY_QUERY = `*[_type == "competitiveContent"]{
  "id": _id,
  "name": company->name,
  "hq": company->hq,
  currentTake, productPositioning, strategy,
  "announcements": announcements[]{date, title, detail},
  otherCommentary,
  "moduleId": module->slug.current,
  "logo": company->logo
}`

export async function getCompanyNotes(): Promise<CompanyNote[]> {
  const raw = await sanityClient.fetch<Record<string, unknown>[]>(COMPANY_QUERY)
  return (raw ?? []).map((r) => ({
    id: String(r.id ?? r.name),
    name: String(r.name ?? ''),
    hq: (r.hq as string) ?? '',
    currentTake: (r.currentTake as string) ?? '',
    productPositioning: (r.productPositioning as PortableTextBlock[]) ?? [],
    strategy: (r.strategy as PortableTextBlock[]) ?? [],
    announcements: ((r.announcements as Announcement[]) ?? []).map((a) => ({
      date: a?.date ?? null,
      title: a?.title ?? '',
      detail: a?.detail ?? '',
    })),
    otherCommentary: (r.otherCommentary as PortableTextBlock[]) ?? [],
    moduleId: (r.moduleId as string) ?? null,
    logo: (r.logo as ImageSource) ?? null,
  }))
}

/** A benchmarking dataset is any loaded dataset that has a "Company" dimension. */
export function isBenchmarkDataset(d: DbDataset): boolean {
  return d.dimensions.includes('Company')
}

export interface CompanyRow {
  company: string
  revenue: number
  share: number
  growth: number | null
}

/**
 * Fetch company revenue for a version (optionally filtered), and derive per-company
 * revenue / market share / YoY growth for the latest year (growth needs a prior year).
 */
export async function getCompanyBenchmark(
  versionId: string,
  filters: Record<string, string>,
): Promise<{ years: number[]; year: number; rows: CompanyRow[]; total: number }> {
  const pivot = await getPivot(versionId, 'Company', 'revenue', filters)
  const years = [...new Set(pivot.map((r) => r.year))].sort((a, b) => a - b)
  const year = years[years.length - 1] ?? 0
  const prevYear = years[years.length - 2]

  const latestByCompany = new Map<string, number>()
  const prevByCompany = new Map<string, number>()
  for (const r of pivot) {
    if (r.year === year) latestByCompany.set(r.category, (latestByCompany.get(r.category) ?? 0) + r.value)
    else if (prevYear !== undefined && r.year === prevYear)
      prevByCompany.set(r.category, (prevByCompany.get(r.category) ?? 0) + r.value)
  }
  const total = [...latestByCompany.values()].reduce((s, v) => s + v, 0)

  const rows: CompanyRow[] = [...latestByCompany.entries()]
    .map(([company, revenue]) => {
      const prev = prevByCompany.get(company)
      const growth = prev !== undefined && prev !== 0 ? ((revenue - prev) / prev) * 100 : null
      return { company, revenue, share: total > 0 ? (revenue / total) * 100 : 0, growth }
    })
    .sort((a, b) => b.revenue - a.revenue)

  return { years, year, rows, total }
}

import { supabase } from './supabaseClient'

export interface DbVersion {
  id: string
  label: string
  publishedAt: string
  summary: string
}
export interface DbDataset {
  id: string
  name: string
  moduleSlug: string | null
  unit: string
  dimensions: string[]
  versions: DbVersion[]
}
export type Measure = 'revenue' | 'units'
export interface PivotRow {
  category: string
  year: number
  value: number
}
export interface Matrix {
  categories: string[]
  years: number[]
  data: Record<string, number[]>
}

export async function getDatasets(): Promise<DbDataset[]> {
  const { data, error } = await supabase.rpc('forecast_datasets')
  if (error) throw new Error(error.message)
  return (data ?? []).map((d: Record<string, unknown>) => ({
    id: String(d.id),
    name: String(d.name),
    moduleSlug: (d.module_slug as string) ?? null,
    unit: (d.unit as string) ?? '',
    dimensions: (d.dimensions as string[]) ?? [],
    versions: (((d.versions as unknown[]) ?? []) as Record<string, unknown>[]).map((v) => ({
      id: String(v.id),
      label: String(v.label),
      publishedAt: String(v.published_at),
      summary: (v.summary as string) ?? '',
    })),
  }))
}

export async function getDimValues(versionId: string, dim: string): Promise<string[]> {
  const { data, error } = await supabase.rpc('forecast_dim_values', {
    p_version_id: versionId,
    p_dim: dim,
  })
  if (error) throw new Error(error.message)
  return (data ?? [])
    .map((r: Record<string, unknown>) => r.value as string)
    .filter((v: string | null): v is string => v != null)
}

export async function getPivot(
  versionId: string,
  groupBy: string,
  measure: Measure,
  filters: Record<string, string | string[]>,
): Promise<PivotRow[]> {
  const { data, error } = await supabase.rpc('forecast_pivot', {
    p_version_id: versionId,
    p_group_by: groupBy,
    p_measure: measure,
    p_filters: filters,
  })
  if (error) throw new Error(error.message)
  return (data ?? []).map((r: Record<string, unknown>) => ({
    category: (r.category as string) ?? '—',
    year: Number(r.year),
    value: Number(r.value),
  }))
}

/** Turn the flat {category, year, value} rows into aligned categories/years/data arrays. */
export function toMatrix(rows: PivotRow[]): Matrix {
  const years = [...new Set(rows.map((r) => r.year))].sort((a, b) => a - b)
  const categories = [...new Set(rows.map((r) => r.category))].sort()
  const data: Record<string, number[]> = {}
  for (const c of categories) data[c] = years.map(() => 0)
  for (const r of rows) {
    const ci = categories.indexOf(r.category)
    const yi = years.indexOf(r.year)
    if (ci >= 0 && yi >= 0) data[r.category][yi] = r.value
  }
  return { categories, years, data }
}

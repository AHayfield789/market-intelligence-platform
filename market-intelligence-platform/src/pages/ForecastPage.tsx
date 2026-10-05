import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useLocation } from 'react-router-dom'
import MultiSelect from '../components/MultiSelect'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ReferenceLine,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Lock, Download, BookmarkPlus, GitCompareArrows, History, Filter } from 'lucide-react'
import {
  getDatasets,
  getDimValues,
  getPivot,
  toMatrix,
  type DbDataset,
  type Matrix,
  type Measure,
} from '../data/pivot'
import { hasSupabase } from '../data/supabaseClient'
import { isBenchmarkDataset } from '../data/benchmarking'
import { useStructure } from '../data/structureContext'
import { useApp } from '../store'
import { formatDate } from '../components/Layout'
import { toast } from '../components/Toast'

const CHART_COLORS = ['#2563eb', '#0d9488', '#9333ea', '#ea580c', '#db2777', '#65a30d', '#0891b2', '#7c3aed']

function Head() {
  return (
    <div className="page-head">
      <h1>Forecast Explorer</h1>
      <div className="sub">
        Interrogate proprietary forecasts like a pivot table — break down by any dimension, filter,
        and compare versions. Aggregated live from the database.
      </div>
    </div>
  )
}

export default function ForecastPage() {
  const [params, setParams] = useSearchParams()
  const location = useLocation()
  const { saveView } = useApp()
  const { modules } = useStructure()

  const [datasets, setDatasets] = useState<DbDataset[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dimValues, setDimValues] = useState<Record<string, string[]>>({})
  const [matrix, setMatrix] = useState<Matrix | null>(null)
  const [prevMatrix, setPrevMatrix] = useState<Matrix | null>(null)
  const [pivotLoading, setPivotLoading] = useState(false)

  useEffect(() => {
    if (!hasSupabase) return
    getDatasets()
      // Company-dimension datasets are market-share; those belong in Benchmarking, not here.
      .then((ds) => setDatasets(ds.filter((d) => !isBenchmarkDataset(d))))
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
  }, [])

  // --- current selections (from URL) ---
  const moduleById = useMemo(() => new Map(modules.map((m) => [m.id, m])), [modules])
  const isLocked = (d: DbDataset) =>
    !!d.moduleSlug && moduleById.has(d.moduleSlug) && !moduleById.get(d.moduleSlug)!.subscribed

  const accessible = (datasets ?? []).filter((d) => !isLocked(d))
  const dataset = accessible.find((d) => d.id === params.get('dataset')) ?? accessible[0] ?? null
  const version =
    dataset?.versions.find((v) => v.id === params.get('version')) ?? dataset?.versions[0] ?? null
  const versionIdx = dataset && version ? dataset.versions.indexOf(version) : -1
  const prevVersion = dataset && versionIdx >= 0 ? dataset.versions[versionIdx + 1] ?? null : null
  const compare = params.get('compare') === '1' && !!prevVersion

  const groupBy =
    params.get('groupBy') && dataset?.dimensions.includes(params.get('groupBy')!)
      ? params.get('groupBy')!
      : dataset?.dimensions[0] ?? ''
  const measure = (params.get('measure') as Measure) === 'units' ? 'units' : 'revenue'
  const isGrowth = params.get('mode') === 'growth'
  const filters: Record<string, string[]> = useMemo(() => {
    try {
      const raw = JSON.parse(params.get('filters') ?? '{}') as Record<string, unknown>
      const out: Record<string, string[]> = {}
      for (const [k, v] of Object.entries(raw)) {
        // Coerce old single-value filters and drop empties.
        const arr = Array.isArray(v) ? v.map(String) : v != null && v !== '' ? [String(v)] : []
        if (arr.length) out[k] = arr
      }
      return out
    } catch {
      return {}
    }
  }, [params])

  const unitLabel = measure === 'revenue' ? dataset?.unit ?? '' : 'units'

  function setParam(updates: Record<string, string | null>) {
    const next = new URLSearchParams(params)
    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === '') next.delete(k)
      else next.set(k, v)
    }
    setParams(next)
  }

  // --- load distinct dimension values for filters when the version changes ---
  useEffect(() => {
    if (!version || !dataset) return
    let cancelled = false
    Promise.all(
      dataset.dimensions.map(async (dim) => [dim, await getDimValues(version.id, dim)] as const),
    )
      .then((pairs) => {
        if (!cancelled) setDimValues(Object.fromEntries(pairs))
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [version?.id, dataset?.id])

  // --- run the pivot whenever the query shape changes ---
  const filtersKey = JSON.stringify(filters)
  useEffect(() => {
    if (!version) return
    // Filters apply to every dimension — including the break-down one, where they narrow
    // which series appear (rather than aggregating them together).
    const sentFilters = { ...filters }
    let cancelled = false
    setPivotLoading(true)
    const current = getPivot(version.id, groupBy, measure, sentFilters).then(toMatrix)
    const previous =
      compare && prevVersion
        ? getPivot(prevVersion.id, groupBy, measure, sentFilters).then(toMatrix)
        : Promise.resolve(null)
    Promise.all([current, previous])
      .then(([m, p]) => {
        if (cancelled) return
        setMatrix(m)
        setPrevMatrix(p)
      })
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : String(e)))
      .finally(() => !cancelled && setPivotLoading(false))
    return () => {
      cancelled = true
    }
  }, [version?.id, groupBy, measure, filtersKey, compare, prevVersion?.id])

  if (!hasSupabase) {
    return (
      <div>
        <Head />
        <div className="ws-empty card">
          Supabase isn’t configured yet. Add <code>VITE_SUPABASE_URL</code> and{' '}
          <code>VITE_SUPABASE_ANON_KEY</code> to a <code>.env</code> file in the app, then restart
          the dev server.
        </div>
      </div>
    )
  }
  if (error) {
    return (
      <div>
        <Head />
        <div className="ws-empty card">
          Couldn’t load forecasts.
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 8 }}>{error}</div>
        </div>
      </div>
    )
  }
  if (datasets === null) {
    return (
      <div>
        <Head />
        <div className="ws-empty card">Loading forecast datasets…</div>
      </div>
    )
  }

  // sidebar groups
  const groupMap = new Map<string, { label: string; locked: boolean; items: DbDataset[] }>()
  for (const d of datasets) {
    const key = d.moduleSlug || 'other'
    if (!groupMap.has(key)) {
      groupMap.set(key, {
        label: (d.moduleSlug && moduleById.get(d.moduleSlug)?.short) || 'Other datasets',
        locked: isLocked(d),
        items: [],
      })
    }
    groupMap.get(key)!.items.push(d)
  }
  const groups = [...groupMap.values()].sort((a, b) => Number(a.locked) - Number(b.locked))

  // Absolute totals always drive the CAGR, regardless of display mode.
  const totals = matrix ? matrix.years.map((_, yi) => matrix.categories.reduce((s, c) => s + matrix.data[c][yi], 0)) : []

  /** Year-on-year % growth for a series (first year has no prior year). */
  const growthOf = (arr: number[]): (number | null)[] =>
    arr.map((v, i) => (i === 0 || arr[i - 1] === 0 ? null : ((v - arr[i - 1]) / arr[i - 1]) * 100))

  const displayData: Record<string, (number | null)[]> = {}
  if (matrix) {
    for (const c of matrix.categories) displayData[c] = isGrowth ? growthOf(matrix.data[c]) : matrix.data[c]
  }
  const displayTotals: (number | null)[] = isGrowth ? growthOf(totals) : totals

  const chartData = matrix
    ? matrix.years.map((year, yi) => {
        const row: Record<string, number | string | null> = { year }
        for (const c of matrix.categories) row[c] = displayData[c][yi]
        return row
      })
    : []
  const firstYear = matrix?.years[0] ?? 0
  const lastYear = matrix?.years[matrix.years.length - 1] ?? 0
  const span = lastYear - firstYear
  const cagr = span > 0 && totals[0] > 0 ? (Math.pow(totals[totals.length - 1] / totals[0], 1 / span) - 1) * 100 : 0

  /**
   * Version-on-version change. In value mode this is a % difference; in growth mode it's the
   * difference between the two growth rates, in percentage points.
   */
  function delta(cat: string, yi: number): number | null {
    if (!compare || !prevMatrix || !matrix) return null
    const pyi = prevMatrix.years.indexOf(matrix.years[yi])
    if (pyi < 0) return null
    const prevArr = prevMatrix.data[cat]
    if (!prevArr) return null
    if (isGrowth) {
      const cur = displayData[cat][yi]
      const prev = pyi === 0 || prevArr[pyi - 1] === 0 ? null : ((prevArr[pyi] - prevArr[pyi - 1]) / prevArr[pyi - 1]) * 100
      if (cur === null || prev === null) return null
      return cur - prev
    }
    const prev = prevArr[pyi]
    const cur = matrix.data[cat][yi]
    if (prev === undefined || prev === 0) return null
    return ((cur - prev) / prev) * 100
  }

  function exportCsv() {
    if (!matrix || !dataset || !version) return
    const fmt = (v: number | null) => (v === null ? '' : isGrowth ? v.toFixed(1) : String(v))
    const header = [groupBy, ...matrix.years.map(String)].join(',')
    const rows = matrix.categories.map((c) => [`"${c}"`, ...displayData[c].map(fmt)].join(','))
    const totalRow = ['Total', ...displayTotals.map(fmt)].join(',')
    const activeFilters = Object.entries(filters)
      .map(([k, v]) => `${k}=${v.join('|')}`)
      .join('; ')
    const meta = `"${dataset.name} — ${measure} by ${groupBy} (${isGrowth ? 'YoY % growth' : unitLabel}), ${version.label}${activeFilters ? `, filtered: ${activeFilters}` : ''}."`
    const csv = [meta, header, ...rows, totalRow].join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${dataset.id}-${version.id}-by-${groupBy}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
    toast('CSV exported')
  }

  function handleSaveView() {
    if (!dataset || !version) return
    const name = window.prompt('Name this view:', `${dataset.name} — ${measure} by ${groupBy}, ${version.label}`)
    if (!name) return
    saveView(name, 'forecast', location.pathname + '?' + params.toString())
    toast('View saved to your workspace')
  }

  return (
    <div>
      <Head />
      <div className="explorer-layout">
        <aside className="card ds-list">
          {datasets.length === 0 && (
            <div style={{ padding: 12, fontSize: 12.5, color: 'var(--text-3)' }}>
              No forecast datasets yet.
            </div>
          )}
          {groups.map((g) => (
            <div key={g.label}>
              <div className="ds-group-label">{g.locked ? 'Not in your subscription' : g.label}</div>
              {g.items.map((d) =>
                g.locked ? (
                  <button key={d.id} className="ds-item locked" disabled>
                    {d.name}
                    <Lock size={12} className="lk" />
                  </button>
                ) : (
                  <button
                    key={d.id}
                    className={`ds-item${dataset && d.id === dataset.id ? ' active' : ''}`}
                    onClick={() => setParam({ dataset: d.id, version: null, groupBy: null, filters: null, compare: null })}
                  >
                    {d.name}
                  </button>
                ),
              )}
            </div>
          ))}
        </aside>

        {!dataset || !version ? (
          <div className="ws-empty card">
            {datasets.length === 0
              ? 'Load a dataset into the database and it will appear here.'
              : 'No forecast datasets in your current subscription.'}
          </div>
        ) : (
          <div>
            <div className="toolbar">
              <select value={version.id} onChange={(e) => setParam({ version: e.target.value, compare: null })}>
                {dataset.versions.map((v) => (
                  <option key={v.id} value={v.id}>
                    Version: {v.label}
                  </option>
                ))}
              </select>
              {prevVersion && (
                <button
                  className={`toggle${compare ? ' on' : ''}`}
                  onClick={() => setParam({ compare: compare ? null : '1' })}
                >
                  <GitCompareArrows size={14} /> Compare vs {prevVersion.label}
                </button>
              )}
              <span className="spacer" />
              <button className="btn" onClick={handleSaveView}>
                <BookmarkPlus size={14} /> Save view
              </button>
              <button className="btn primary" onClick={exportCsv} disabled={!matrix}>
                <Download size={14} /> Export CSV
              </button>
            </div>

            {/* Pivot controls */}
            <div className="card panel" style={{ paddingBottom: 16 }}>
              <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <label style={{ fontSize: 12.5 }}>
                  <div style={{ color: 'var(--text-3)', fontWeight: 700, marginBottom: 4 }}>Break down by</div>
                  <select value={groupBy} onChange={(e) => setParam({ groupBy: e.target.value })}>
                    {dataset.dimensions.map((dim) => (
                      <option key={dim} value={dim}>
                        {dim}
                      </option>
                    ))}
                  </select>
                </label>
                <label style={{ fontSize: 12.5 }}>
                  <div style={{ color: 'var(--text-3)', fontWeight: 700, marginBottom: 4 }}>Measure</div>
                  <div style={{ display: 'flex', gap: 0 }}>
                    <button
                      className={`toggle${measure === 'revenue' ? ' on' : ''}`}
                      style={{ borderRadius: '8px 0 0 8px' }}
                      onClick={() => setParam({ measure: null })}
                    >
                      Revenue
                    </button>
                    <button
                      className={`toggle${measure === 'units' ? ' on' : ''}`}
                      style={{ borderRadius: '0 8px 8px 0', marginLeft: -1 }}
                      onClick={() => setParam({ measure: 'units' })}
                    >
                      Units
                    </button>
                  </div>
                </label>
                <label style={{ fontSize: 12.5 }}>
                  <div style={{ color: 'var(--text-3)', fontWeight: 700, marginBottom: 4 }}>Show as</div>
                  <div style={{ display: 'flex', gap: 0 }}>
                    <button
                      className={`toggle${!isGrowth ? ' on' : ''}`}
                      style={{ borderRadius: '8px 0 0 8px' }}
                      onClick={() => setParam({ mode: null })}
                    >
                      Value
                    </button>
                    <button
                      className={`toggle${isGrowth ? ' on' : ''}`}
                      style={{ borderRadius: '0 8px 8px 0', marginLeft: -1 }}
                      onClick={() => setParam({ mode: 'growth' })}
                    >
                      YoY growth
                    </button>
                  </div>
                </label>
                <div style={{ flex: 1 }} />
              </div>

              {/* Filters for every dimension — including the break-down one, where the
                  selection controls which series are shown side by side. */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 14, alignItems: 'center' }}>
                <span style={{ color: 'var(--text-3)', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <Filter size={13} /> Filter:
                </span>
                {dataset.dimensions.map((dim) => (
                  <MultiSelect
                    key={dim}
                    label={dim === groupBy ? `${dim} (series)` : dim}
                    options={dimValues[dim] ?? []}
                    selected={filters[dim] ?? []}
                    onChange={(vals) => {
                      const f: Record<string, string[]> = { ...filters }
                      if (vals.length) f[dim] = vals
                      else delete f[dim]
                      setParam({ filters: Object.keys(f).length ? JSON.stringify(f) : null })
                    }}
                  />
                ))}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 8 }}>
                Selecting values in <b>{groupBy}</b> picks which series are compared side by side. Other
                dimensions narrow the data behind them.
              </div>
            </div>

            {compare && prevVersion && (
              <div className="version-note">
                <b>
                  What changed: {prevVersion.label} → {version.label}
                </b>
                {version.summary}
              </div>
            )}

            <div className="card panel">
              <h3>
                {measure === 'revenue' ? 'Revenue' : 'Units'} by {groupBy}
                {isGrowth && ' — YoY growth'}
              </h3>
              <div className="panel-sub">
                {dataset.name} · {isGrowth ? '% change year on year' : unitLabel} · {version.label}
                {matrix && matrix.years.length > 0 && ` · ${firstYear}–${lastYear} CAGR ${cagr.toFixed(1)}%`}
                {pivotLoading && ' · updating…'}
              </div>
              {matrix && matrix.categories.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  {isGrowth ? (
                    <LineChart data={chartData} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v: number) => `${v.toFixed(0)}%`} />
                      <Tooltip formatter={(v: number | string) => [`${Number(v).toFixed(1)}%`, undefined]} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <ReferenceLine y={0} stroke="#94a3b8" />
                      {matrix.categories.map((c, i) => (
                        <Line
                          key={c}
                          type="monotone"
                          dataKey={c}
                          stroke={CHART_COLORS[i % CHART_COLORS.length]}
                          strokeWidth={2}
                          dot={{ r: 2 }}
                          connectNulls={false}
                        />
                      ))}
                    </LineChart>
                  ) : (
                    <BarChart data={chartData} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v: number) => v.toLocaleString()} />
                      <Tooltip formatter={(v: number | string) => [`${Number(v).toLocaleString()} ${unitLabel}`, undefined]} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      {matrix.categories.map((c, i) => (
                        <Bar
                          key={c}
                          dataKey={c}
                          stackId="a"
                          fill={CHART_COLORS[i % CHART_COLORS.length]}
                          radius={i === matrix.categories.length - 1 ? [3, 3, 0, 0] : undefined}
                        />
                      ))}
                    </BarChart>
                  )}
                </ResponsiveContainer>
              ) : (
                <div className="ws-empty">{pivotLoading ? 'Aggregating…' : 'No data for this selection.'}</div>
              )}
            </div>

            {matrix && matrix.categories.length > 0 && (
              <div className="card panel">
                <h3>Data table</h3>
                <div className="panel-sub">
                  {isGrowth ? '% change year on year' : unitLabel}
                  {compare && prevVersion
                    ? ` · ${isGrowth ? 'percentage-point' : '%'} deltas vs ${prevVersion.label}`
                    : ' · enable compare for version-on-version changes'}
                </div>
                <div className="table-scroll">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>{groupBy}</th>
                        {matrix.years.map((y) => (
                          <th key={y}>{y}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {matrix.categories.map((c) => (
                        <tr key={c}>
                          <td>{c}</td>
                          {matrix.years.map((y, yi) => {
                            const d = delta(c, yi)
                            const v = displayData[c][yi]
                            return (
                              <td key={y}>
                                {v === null ? (
                                  <span style={{ color: 'var(--text-3)' }}>—</span>
                                ) : isGrowth ? (
                                  <span style={{ color: v > 0 ? 'var(--green)' : v < 0 ? 'var(--red)' : 'inherit' }}>
                                    {v > 0 ? '+' : ''}
                                    {v.toFixed(1)}%
                                  </span>
                                ) : (
                                  v.toLocaleString()
                                )}
                                {d !== null && Math.abs(d) >= 0.05 && (
                                  <span className={`delta ${d > 0 ? 'up' : 'down'}`}>
                                    {d > 0 ? '+' : ''}
                                    {d.toFixed(1)}
                                    {isGrowth ? 'pp' : '%'}
                                  </span>
                                )}
                                {d !== null && Math.abs(d) < 0.05 && <span className="delta flat">–</span>}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                      <tr className="total-row">
                        <td>Total</td>
                        {displayTotals.map((t, yi) => (
                          <td key={yi}>
                            {t === null ? (
                              <span style={{ color: 'var(--text-3)' }}>—</span>
                            ) : isGrowth ? (
                              `${t > 0 ? '+' : ''}${t.toFixed(1)}%`
                            ) : (
                              t.toLocaleString()
                            )}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="card panel">
              <h3>
                <History size={15} style={{ verticalAlign: -2 }} /> Version history
              </h3>
              <div className="panel-sub">Every revision is preserved and comparable.</div>
              {dataset.versions.map((v) => (
                <div className="rail-item" key={v.id}>
                  <div className="t">
                    {v.label} — published {formatDate(v.publishedAt)}
                    {v.id === version.id && (
                      <span className="type-badge type-forecast" style={{ marginLeft: 8, verticalAlign: 1 }}>
                        viewing
                      </span>
                    )}
                  </div>
                  {v.summary && <div className="s">{v.summary}</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

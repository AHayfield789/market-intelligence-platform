import { useEffect, useMemo, useState, Fragment, type ReactNode } from 'react'
import { useSearchParams, useLocation } from 'react-router-dom'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { PortableText } from '@portabletext/react'
import { ArrowUpDown, BookmarkPlus, Download, Factory, Filter, Lock, Users } from 'lucide-react'
import { getDatasets, getDimValues, type DbDataset } from '../data/pivot'
import {
  getCompanyBenchmark,
  getCompanyNotes,
  getCompanyProfiles,
  isBenchmarkDataset,
  type CompanyNote,
  type CompanyProfile,
  type CompanyRow,
  type Facility,
} from '../data/benchmarking'
import { urlFor } from '../data/imageUrl'
import { useStructure } from '../data/structureContext'
import { useApp } from '../store'
import { toast } from '../components/Toast'
import { formatDate } from '../components/Layout'
import MultiSelect from '../components/MultiSelect'
import FacilityMap, { type MapPoint } from '../components/FacilityMap'

const PIE_COLORS = [
  '#2563eb', '#0d9488', '#9333ea', '#ea580c', '#db2777',
  '#65a30d', '#0891b2', '#7c3aed', '#d97706', '#475569',
]
const MAX_PEERS = 4
type SortKey = 'company' | 'revenue' | 'share' | 'growth'

const sectionLabel = {
  fontSize: 11,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.6px',
  color: 'var(--text-3)',
  fontWeight: 700,
  margin: '0 0 8px',
}

const STATUS_LABEL: Record<string, string> = {
  operating: 'Operating',
  opened: 'Recently opened',
  expanding: 'Expanding',
  planned: 'Planned',
  downsizing: 'Downsizing',
  closed: 'Recently closed',
}
const STATUS_COLOR: Record<string, string> = {
  operating: 'var(--text-3)',
  opened: 'var(--green)',
  expanding: 'var(--green)',
  planned: 'var(--amber)',
  downsizing: 'var(--amber)',
  closed: 'var(--red)',
}

const dash = <span style={{ color: 'var(--text-3)' }}>—</span>

function Head() {
  return (
    <div className="page-head">
      <h1>Competitive Benchmarking</h1>
      <div className="sub">
        Market share, rankings and side-by-side peer comparison — numbers and analyst commentary together.
      </div>
    </div>
  )
}

export default function BenchmarkingPage() {
  const [params, setParams] = useSearchParams()
  const location = useLocation()
  const { saveView } = useApp()
  const { modules } = useStructure()

  const [datasets, setDatasets] = useState<DbDataset[] | null>(null)
  const [notes, setNotes] = useState<CompanyNote[]>([])
  const [profiles, setProfiles] = useState<CompanyProfile[]>([])
  const [error, setError] = useState<string | null>(null)
  const [bench, setBench] = useState<{ years: number[]; year: number; rows: CompanyRow[]; total: number } | null>(null)
  const [benchLoading, setBenchLoading] = useState(false)
  const [regionValues, setRegionValues] = useState<string[]>([])
  const [productValues, setProductValues] = useState<string[]>([])
  const [sortKey, setSortKey] = useState<SortKey>('revenue')
  const [sortDesc, setSortDesc] = useState(true)

  useEffect(() => {
    getDatasets().then(setDatasets).catch((e) => setError(e instanceof Error ? e.message : String(e)))
    getCompanyNotes().then(setNotes).catch(() => setNotes([]))
    getCompanyProfiles().then(setProfiles).catch(() => setProfiles([]))
  }, [])

  const moduleById = useMemo(() => new Map(modules.map((m) => [m.id, m])), [modules])
  const isLocked = (d: DbDataset) =>
    !!d.moduleSlug && moduleById.has(d.moduleSlug) && !moduleById.get(d.moduleSlug)!.subscribed

  const benchmarkSets = (datasets ?? []).filter(isBenchmarkDataset)
  const accessible = benchmarkSets.filter((d) => !isLocked(d))
  const dataset = accessible.find((d) => d.id === params.get('dataset')) ?? accessible[0] ?? null
  const version = dataset?.versions.find((v) => v.id === params.get('version')) ?? dataset?.versions[0] ?? null

  const filters: Record<string, string> = useMemo(() => {
    const f: Record<string, string> = {}
    const r = params.get('region')
    const p = params.get('product')
    if (r) f.Region = r
    if (p) f.Product = p
    return f
  }, [params])
  const filtersKey = JSON.stringify(filters)

  function setParam(updates: Record<string, string | null>) {
    const next = new URLSearchParams(params)
    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === '') next.delete(k)
      else next.set(k, v)
    }
    setParams(next)
  }

  useEffect(() => {
    if (!version) return
    let cancelled = false
    getDimValues(version.id, 'Region').then((v) => !cancelled && setRegionValues(v)).catch(() => {})
    getDimValues(version.id, 'Product').then((v) => !cancelled && setProductValues(v)).catch(() => {})
    return () => {
      cancelled = true
    }
  }, [version?.id])

  useEffect(() => {
    if (!version) return
    let cancelled = false
    setBenchLoading(true)
    getCompanyBenchmark(version.id, filters)
      .then((b) => !cancelled && setBench(b))
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : String(e)))
      .finally(() => !cancelled && setBenchLoading(false))
    return () => {
      cancelled = true
    }
  }, [version?.id, filtersKey])

  const datasetModule = dataset?.moduleSlug ?? null
  const noteByName = useMemo(() => {
    const m = new Map<string, CompanyNote>()
    for (const n of notes) {
      // Only use analysis written for the module currently being viewed.
      if (datasetModule && n.moduleId && n.moduleId !== datasetModule) continue
      if (n.name) m.set(n.name.trim().toLowerCase(), n)
    }
    return m
  }, [notes, datasetModule])
  const getNote = (company: string) => noteByName.get(company.trim().toLowerCase())

  const facilitiesByName = useMemo(() => {
    const m = new Map<string, Facility[]>()
    for (const p of profiles) if (p.name) m.set(p.name.trim().toLowerCase(), p.facilities)
    return m
  }, [profiles])
  const getFacilities = (company: string) => facilitiesByName.get(company.trim().toLowerCase()) ?? []

  if (!datasets) {
    return (
      <div>
        <Head />
        <div className="ws-empty card">Loading benchmarking data…</div>
      </div>
    )
  }
  if (error && !bench) {
    return (
      <div>
        <Head />
        <div className="ws-empty card">
          Couldn’t load benchmarking data.
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 8 }}>{error}</div>
        </div>
      </div>
    )
  }
  if (!dataset || !version) {
    return (
      <div>
        <Head />
        <div className="ws-empty card">
          {benchmarkSets.length === 0
            ? 'No market-share datasets loaded yet. Load one (with a Company dimension) and it will appear here.'
            : 'No benchmarking datasets in your current subscription.'}
        </div>
      </div>
    )
  }

  const rows = bench?.rows ?? []
  const total = bench?.total ?? 0
  const year = bench?.year ?? 0
  const hasGrowth = rows.some((r) => r.growth !== null)

  const top5Share = rows.slice(0, 5).reduce((s, r) => s + r.share, 0)
  const medianGrowth = (() => {
    const g = rows.map((r) => r.growth).filter((x): x is number => x !== null).sort((a, b) => a - b)
    if (g.length === 0) return null
    const mid = Math.floor(g.length / 2)
    return g.length % 2 ? g[mid] : (g[mid - 1] + g[mid]) / 2
  })()

  // Higher-level company filter — uncapped, clearable (empty = all companies).
  const companyFilter = (params.get('companies') ?? '')
    .split('|')
    .filter((c) => c && rows.some((r) => r.company === c))
  const setCompanyFilter = (vals: string[]) => setParam({ companies: vals.length ? vals.join('|') : null })

  // Named vendors are shown individually; the dataset's own "Others" row plus every sub-1%
  // vendor are combined into ONE aggregate "Others" row (so "Others" isn't double-counted).
  const isOthers = (name: string) => name.trim().toLowerCase() === 'others'
  const datasetOthers = rows.find((r) => isOthers(r.company))

  let visibleNamed: CompanyRow[]
  let othersRow: CompanyRow | null = null
  let othersCount = 0
  if (companyFilter.length) {
    visibleNamed = rows.filter((r) => companyFilter.includes(r.company))
  } else {
    const named = rows.filter((r) => !isOthers(r.company))
    visibleNamed = named.filter((r) => r.share >= 1)
    const tail = named.filter((r) => r.share < 1)
    const tailRevenue = (datasetOthers?.revenue ?? 0) + tail.reduce((s, r) => s + r.revenue, 0)
    othersCount = tail.length + (datasetOthers ? 1 : 0)
    if (tailRevenue > 0) {
      othersRow = {
        company: 'Others',
        revenue: tailRevenue,
        share: total > 0 ? (tailRevenue / total) * 100 : 0,
        growth: null,
      }
    }
  }

  const sortedRows = [...visibleNamed].sort((a, b) => {
    const dir = sortDesc ? -1 : 1
    if (sortKey === 'company') return dir * a.company.localeCompare(b.company)
    if (sortKey === 'growth') return dir * ((a.growth ?? -Infinity) - (b.growth ?? -Infinity))
    return dir * (a[sortKey] - b[sortKey])
  })
  function clickSort(key: SortKey) {
    if (key === sortKey) setSortDesc((d) => !d)
    else {
      setSortKey(key)
      setSortDesc(true)
    }
  }

  const pieBase = visibleNamed.map((r) => ({ name: r.company, value: r.share }))
  const othersSlice = othersRow
    ? othersRow.share
    : Math.max(0, 100 - visibleNamed.reduce((s, r) => s + r.share, 0))
  const pieData = [...pieBase, { name: 'Others', value: othersSlice }].filter((d) => d.value > 0.01)

  // Shared peer selection (pills + row clicks), capped at MAX_PEERS.
  const peerParam = params.get('peers')
  const peers = peerParam
    ? peerParam.split('|').filter((p) => rows.some((r) => r.company === p)).slice(0, MAX_PEERS)
    : rows.slice(0, 3).map((r) => r.company)
  function togglePeer(company: string) {
    const next = peers.includes(company)
      ? peers.filter((p) => p !== company)
      : peers.length < MAX_PEERS
        ? [...peers, company]
        : peers
    setParam({ peers: next.length ? next.join('|') : null })
    if (!peers.includes(company) && peers.length >= MAX_PEERS) toast(`You can compare up to ${MAX_PEERS} companies`)
  }
  const setPeers = (vals: string[]) =>
    setParam({ peers: vals.length ? vals.slice(0, MAX_PEERS).join('|') : null })
  const companyOptions = rows.map((r) => r.company)
  const peerData = peers
    .map((p) => rows.find((r) => r.company === p))
    .filter((r): r is CompanyRow => !!r)
    .map((r) => ({ name: r.company, 'Revenue ($M)': Math.round(r.revenue), 'Share %': +r.share.toFixed(1) }))

  const marketSize = total >= 1000 ? `$${(total / 1000).toFixed(1)}B` : `$${total.toFixed(0)}M`

  // Qualitative comparison rows (only shown if at least one selected peer has content).
  const commentarySections: { title: string; has: (n?: CompanyNote) => boolean; render: (n?: CompanyNote) => ReactNode }[] = [
    {
      title: 'Current take',
      has: (n) => !!n?.currentTake,
      render: (n) => (n?.currentTake ? <p style={{ margin: 0 }}>{n.currentTake}</p> : dash),
    },
    {
      title: 'Product positioning',
      has: (n) => !!n?.productPositioning?.length,
      render: (n) =>
        n?.productPositioning?.length ? <div className="body"><PortableText value={n.productPositioning} /></div> : dash,
    },
    {
      title: 'Short-to-mid-term strategy',
      has: (n) => !!n?.strategy?.length,
      render: (n) => (n?.strategy?.length ? <div className="body"><PortableText value={n.strategy} /></div> : dash),
    },
    {
      title: 'Relevant announcements',
      has: (n) => !!n?.announcements?.length,
      render: (n) =>
        n?.announcements?.length ? (
          <div>
            {n.announcements.map((a, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <div style={{ fontWeight: 600 }}>{a.title}</div>
                {(a.date || a.detail) && (
                  <div style={{ color: 'var(--text-3)', fontSize: 12 }}>
                    {[a.date ? formatDate(a.date) : null, a.detail || null].filter(Boolean).join(' · ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          dash
        ),
    },
    {
      title: 'Other commentary',
      has: (n) => !!n?.otherCommentary?.length,
      render: (n) =>
        n?.otherCommentary?.length ? <div className="body"><PortableText value={n.otherCommentary} /></div> : dash,
    },
  ]
  const activeSections = commentarySections.filter((s) => peers.some((c) => s.has(getNote(c))))

  function handleSaveView() {
    const name = window.prompt('Name this view:', `${dataset!.name} — market share ${year}`)
    if (!name) return
    saveView(name, 'benchmark', location.pathname + '?' + params.toString())
    toast('View saved to your workspace')
  }
  function exportCsv() {
    const header = `Rank,Company,HQ,Revenue ($M),Market share (%)${hasGrowth ? ',Growth YoY (%)' : ''}`
    const lines = sortedRows.map((r, i) => {
      const hq = getNote(r.company)?.hq ?? ''
      const g = hasGrowth ? `,${r.growth === null ? '' : r.growth.toFixed(1)}` : ''
      return `${i + 1},"${r.company}","${hq}",${r.revenue.toFixed(1)},${r.share.toFixed(1)}${g}`
    })
    if (othersRow) {
      lines.push(`,"Others","",${othersRow.revenue.toFixed(1)},${othersRow.share.toFixed(1)}${hasGrowth ? ',' : ''}`)
    }
    const active = Object.entries(filters).map(([k, v]) => `${k}=${v}`).join('; ')
    const csv = [`"${dataset!.name} — ${year}${active ? `, filtered: ${active}` : ''}."`, header, ...lines].join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${dataset!.id}-${year}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
    toast('CSV exported')
  }

  return (
    <div>
      <Head />

      <div className="toolbar">
        {accessible.length > 1 && (
          <select value={dataset.id} onChange={(e) => setParam({ dataset: e.target.value, version: null, region: null, product: null, peers: null })}>
            {accessible.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        )}
        {dataset.versions.length > 1 && (
          <select value={version.id} onChange={(e) => setParam({ version: e.target.value })}>
            {dataset.versions.map((v) => (
              <option key={v.id} value={v.id}>{v.label}</option>
            ))}
          </select>
        )}
        <span style={{ color: 'var(--text-3)', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <Filter size={13} /> Filter:
        </span>
        <select value={filters.Region ?? ''} onChange={(e) => setParam({ region: e.target.value || null })}>
          <option value="">All regions</option>
          {regionValues.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
        <select value={filters.Product ?? ''} onChange={(e) => setParam({ product: e.target.value || null })}>
          <option value="">All products</option>
          {productValues.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
        <MultiSelect
          label="Companies"
          placeholder="All companies"
          options={companyOptions}
          selected={companyFilter}
          onChange={setCompanyFilter}
        />
        <span className="spacer" />
        <button className="btn" onClick={handleSaveView}>
          <BookmarkPlus size={14} /> Save view
        </button>
        <button className="btn primary" onClick={exportCsv} disabled={!rows.length}>
          <Download size={14} /> Export CSV
        </button>
      </div>

      <div className="kpi-row">
        <div className="card kpi">
          <div className="label">Market size ({year})</div>
          <div className="value">{marketSize}</div>
          <div className="delta-line muted">tracked vendor revenue</div>
        </div>
        <div className="card kpi">
          <div className="label">Top-5 concentration</div>
          <div className="value">{top5Share.toFixed(0)}%</div>
          <div className="delta-line muted">share of market revenue</div>
        </div>
        <div className="card kpi">
          <div className="label">Median growth</div>
          <div className="value">{medianGrowth === null ? '—' : `${medianGrowth.toFixed(0)}%`}</div>
          <div className="delta-line muted">{medianGrowth === null ? 'needs a prior year' : 'year on year'}</div>
        </div>
        <div className="card kpi">
          <div className="label">Companies tracked</div>
          <div className="value">{rows.length}</div>
          <div className="delta-line muted">{benchLoading ? 'updating…' : 'in this view'}</div>
        </div>
      </div>

      <div className="card panel">
        <h3>Market share, {year}</h3>
        <div className="panel-sub">% of tracked vendor revenue{filters.Region ? ` · ${filters.Region}` : ''}{filters.Product ? ` · ${filters.Product}` : ''}</div>
        {pieData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={115} paddingAngle={1.5} strokeWidth={0}>
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number | string) => `${Number(v).toFixed(1)}%`} />
              <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="ws-empty">{benchLoading ? 'Loading…' : 'No data for this selection.'}</div>
        )}
      </div>

      <div className="card panel">
        <h3>Vendor rankings — {year}</h3>
        <div className="panel-sub">
          Click a row to add or remove a company from the peer comparison (up to {MAX_PEERS}). Click headers to sort.
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>#</th>
                <th className="sortable" style={{ textAlign: 'left' }} onClick={() => clickSort('company')}>Company <ArrowUpDown size={11} /></th>
                <th style={{ textAlign: 'left' }}>HQ</th>
                <th className="sortable" onClick={() => clickSort('revenue')}>Revenue ($M) <ArrowUpDown size={11} /></th>
                <th className="sortable" onClick={() => clickSort('share')}>Share <ArrowUpDown size={11} /></th>
                {hasGrowth && <th className="sortable" onClick={() => clickSort('growth')}>Growth YoY <ArrowUpDown size={11} /></th>}
                <th style={{ textAlign: 'left' }}>Analyst take</th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((r) => {
                const note = getNote(r.company)
                const on = peers.includes(r.company)
                return (
                  <tr
                    key={r.company}
                    onClick={() => togglePeer(r.company)}
                    style={{ cursor: 'pointer', ...(on ? { background: 'var(--accent-soft)' } : {}) }}
                    title={on ? 'Remove from comparison' : 'Add to comparison'}
                  >
                    <td>{rows.indexOf(r) + 1}</td>
                    <td style={{ textAlign: 'left', fontWeight: 600 }}>{r.company}</td>
                    <td style={{ textAlign: 'left', color: 'var(--text-2)' }}>{note?.hq ?? '—'}</td>
                    <td>{r.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    <td>{r.share.toFixed(1)}%</td>
                    {hasGrowth && (
                      <td>
                        {r.growth === null ? (
                          <span style={{ color: 'var(--text-3)' }}>—</span>
                        ) : (
                          <span className={`delta-line ${r.growth >= 0 ? 'up' : 'down'}`} style={{ fontSize: 12.5 }}>
                            {r.growth > 0 ? '+' : ''}{r.growth.toFixed(1)}%
                          </span>
                        )}
                      </td>
                    )}
                    <td style={{ textAlign: 'left', whiteSpace: 'normal', minWidth: 240, color: 'var(--text-2)' }}>
                      {note?.currentTake ?? <span style={{ color: 'var(--text-3)' }}>—</span>}
                    </td>
                  </tr>
                )
              })}
              {othersRow && (
                <tr className="total-row">
                  <td></td>
                  <td style={{ textAlign: 'left', fontWeight: 700 }}>Others</td>
                  <td style={{ textAlign: 'left', color: 'var(--text-3)' }}>—</td>
                  <td>{othersRow.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  <td>{othersRow.share.toFixed(1)}%</td>
                  {hasGrowth && <td><span style={{ color: 'var(--text-3)' }}>—</span></td>}
                  <td style={{ textAlign: 'left', color: 'var(--text-3)', fontWeight: 400 }}>
                    Aggregate of {othersCount} vendor{othersCount !== 1 ? 's' : ''} under 1% share
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card panel">
        <h3><Users size={16} style={{ verticalAlign: -3 }} /> Peer comparison</h3>
        <div className="panel-sub">Compare up to {MAX_PEERS} companies — numbers and analyst commentary side by side.</div>
        <div style={{ marginBottom: 16, maxWidth: 320 }}>
          <MultiSelect
            label="Companies"
            placeholder="Choose companies to compare…"
            options={companyOptions}
            selected={peers}
            onChange={setPeers}
            max={MAX_PEERS}
          />
        </div>

        {peers.length === 0 ? (
          <div className="ws-empty">Select companies above to compare them.</div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={peerData} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11.5, fill: '#64748b' }} />
                <YAxis yAxisId="rev" tick={{ fontSize: 11.5, fill: '#64748b' }} />
                <YAxis yAxisId="sh" orientation="right" tick={{ fontSize: 11.5, fill: '#64748b' }} unit="%" />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar yAxisId="rev" dataKey="Revenue ($M)" fill="#2563eb" radius={[3, 3, 0, 0]} />
                <Bar yAxisId="sh" dataKey="Share %" fill="#0d9488" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>

            <div className="table-scroll" style={{ marginTop: 18 }}>
              <div
                className="peer-matrix"
                style={{ gridTemplateColumns: `170px repeat(${peers.length}, minmax(240px, 1fr))` }}
              >
                <div className="peer-cell peer-corner" />
                {peers.map((c) => {
                  const r = rows.find((x) => x.company === c)
                  const n = getNote(c)
                  return (
                    <div className="peer-cell peer-vsep peer-head" key={c}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {n?.logo && (
                          <img
                            src={urlFor(n.logo).width(56).height(56).fit('max').url()}
                            alt=""
                            style={{ width: 22, height: 22, objectFit: 'contain' }}
                          />
                        )}
                        <span style={{ fontWeight: 700 }}>{c}</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 3 }}>
                        {r ? `${r.share.toFixed(1)}% · $${r.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}M` : ''}
                        {n?.hq ? ` · ${n.hq}` : ''}
                      </div>
                    </div>
                  )
                })}

                {activeSections.length === 0 ? (
                  <div className="peer-cell" style={{ gridColumn: `1 / -1`, color: 'var(--text-3)' }}>
                    No analyst commentary yet for the selected companies. Add Company entries in the Studio to compare their qualitative analysis here.
                  </div>
                ) : (
                  activeSections.map((s) => (
                    <Fragment key={s.title}>
                      <div className="peer-cell peer-label">{s.title}</div>
                      {peers.map((c) => (
                        <div className="peer-cell peer-vsep" key={c}>
                          {s.render(getNote(c))}
                        </div>
                      ))}
                    </Fragment>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="card panel">
        <h3><Factory size={16} style={{ verticalAlign: -3 }} /> Production footprint</h3>
        <div className="panel-sub">
          Where the selected companies manufacture, and how that footprint is changing.
        </div>
        {peers.length === 0 ? (
          <div className="ws-empty">Select companies above to compare their production footprint.</div>
        ) : (() => {
          const selected = peers.map((c) => ({ company: c, facilities: getFacilities(c) }))
          if (!selected.some((p) => p.facilities.length)) {
            return (
              <p style={{ color: 'var(--text-3)', fontSize: 13 }}>
                No production data yet for the selected companies. Add facilities under
                Competitive Analysis Content → Company Information in the Studio.
              </p>
            )
          }
          const points: MapPoint[] = selected.flatMap((p, ci) =>
            p.facilities.map((f) => ({ ...f, company: p.company, color: PIE_COLORS[ci % PIE_COLORS.length] })),
          )
          const mapped = points.filter((p) => p.latitude !== null && p.longitude !== null).length
          const moves = selected
            .flatMap((p) => p.facilities.filter((f) => f.status && f.status !== 'operating').map((f) => ({ ...f, company: p.company })))
            .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
          return (
            <>
              <FacilityMap points={points} />

              {/* Legend + coverage note */}
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', margin: '10px 0 4px' }}>
                {selected.map((p, ci) => (
                  <span key={p.company} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5 }}>
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: PIE_COLORS[ci % PIE_COLORS.length],
                        flexShrink: 0,
                      }}
                    />
                    {p.company} · {p.facilities.length} site{p.facilities.length !== 1 ? 's' : ''}
                  </span>
                ))}
                {mapped < points.length && (
                  <span style={{ fontSize: 11.5, color: 'var(--text-3)' }}>
                    ({points.length - mapped} without coordinates, listed below only)
                  </span>
                )}
              </div>

              {/* Locations table */}
              <div className="table-scroll" style={{ marginTop: 12 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left' }}>Company</th>
                      <th style={{ textAlign: 'left' }}>Location</th>
                      <th style={{ textAlign: 'left' }}>Region</th>
                      <th style={{ textAlign: 'left' }}>What’s produced</th>
                      <th>Size (m²)</th>
                      <th style={{ textAlign: 'left' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {points.map((f, i) => (
                      <tr key={i}>
                        <td style={{ textAlign: 'left' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <span
                              style={{ width: 8, height: 8, borderRadius: '50%', background: f.color, flexShrink: 0 }}
                            />
                            <span style={{ fontWeight: 600 }}>{f.company}</span>
                          </span>
                        </td>
                        <td style={{ textAlign: 'left' }}>
                          {f.location}
                          {f.entity && f.entity !== f.company && (
                            <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{f.entity}</div>
                          )}
                        </td>
                        <td style={{ textAlign: 'left', color: 'var(--text-2)' }}>{f.region}</td>
                        <td style={{ textAlign: 'left', color: 'var(--text-2)', whiteSpace: 'normal', minWidth: 200 }}>
                          {f.products || <span style={{ color: 'var(--text-3)' }}>—</span>}
                        </td>
                        <td>{f.sizeSqm ? f.sizeSqm.toLocaleString() : <span style={{ color: 'var(--text-3)' }}>—</span>}</td>
                        <td style={{ textAlign: 'left' }}>
                          <span style={{ color: STATUS_COLOR[f.status] ?? 'var(--text-2)', fontWeight: 600, fontSize: 12.5 }}>
                            {STATUS_LABEL[f.status] ?? f.status}
                          </span>
                          {f.date && <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{formatDate(f.date)}</div>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {moves.length > 0 && (
                <div style={{ marginTop: 18 }}>
                  <div style={sectionLabel}>Recent & planned moves</div>
                  {moves.map((m, i) => (
                    <div className="ws-row" key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      <span
                        className="type-badge"
                        style={{ background: 'var(--surface-2)', color: STATUS_COLOR[m.status] ?? 'var(--text-2)' }}
                      >
                        {STATUS_LABEL[m.status] ?? m.status}
                      </span>
                      <div className="grow">
                        <div className="t">
                          {m.company} — {m.location}
                        </div>
                        <div className="s">
                          {[m.region, m.products, m.date ? formatDate(m.date) : null].filter(Boolean).join(' · ')}
                          {m.note ? ` — ${m.note}` : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )
        })()}
      </div>

      {benchmarkSets.some(isLocked) && (
        <div className="disclaimer" style={{ marginTop: 20 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Lock size={11} /> Some market-share datasets are outside your current subscription.
          </span>
        </div>
      )}
    </div>
  )
}

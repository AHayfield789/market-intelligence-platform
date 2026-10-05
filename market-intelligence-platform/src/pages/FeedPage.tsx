import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CalendarClock, TrendingUp } from 'lucide-react'
import { getInsights, type FeedInsight } from '../data/insights'
import { getDatasets, type DbDataset } from '../data/pivot'
import { isBenchmarkDataset } from '../data/benchmarking'
import { useStructure } from '../data/structureContext'
import type { FeedItemType } from '../types'
import FeedCard, { typeLabels } from '../components/FeedCard'
import { formatDate } from '../components/Layout'

const filterChips: { key: FeedItemType | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'insight', label: 'Analyst Insights' },
  { key: 'event', label: 'Major Market Event Commentary' },
  { key: 'forecast', label: 'Forecast Updates' },
  { key: 'news', label: 'News Tracker' },
]

export default function FeedPage() {
  const [params, setParams] = useSearchParams()
  const typeFilter = (params.get('type') ?? 'all') as FeedItemType | 'all'
  const moduleFilter = params.get('module') ?? 'all'
  const q = (params.get('q') ?? '').toLowerCase()

  const { analysts, modules } = useStructure()
  const [insights, setInsights] = useState<FeedInsight[] | null>(null)
  const [datasets, setDatasets] = useState<DbDataset[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getInsights()
      .then(setInsights)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
    getDatasets()
      .then((ds) => setDatasets(ds.filter((d) => !isBenchmarkDataset(d))))
      .catch(() => setDatasets([]))
  }, [])

  const all = insights ?? []
  const items = all
    .filter((i) => typeFilter === 'all' || i.type === typeFilter)
    .filter((i) => moduleFilter === 'all' || i.moduleIds.includes(moduleFilter))
    .filter(
      (i) =>
        !q ||
        i.title.toLowerCase().includes(q) ||
        i.summary.toLowerCase().includes(q) ||
        i.bodyText.toLowerCase().includes(q),
    )

  // Build the module filter options from the modules actually present in the feed.
  const moduleOptions = Array.from(
    new Map(
      all.flatMap((i) => i.moduleIds.map((id, idx) => [id, i.moduleShorts[idx]] as const)),
    ).entries(),
  )

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params)
    if (value === 'all' || value === '') next.delete(key)
    else next.set(key, value)
    setParams(next)
  }

  const latestForecast = all.find((i) => i.type === 'forecast')

  const upcomingSlots = analysts
    .flatMap((a) => a.officeHours.map((s) => ({ analyst: a, slot: s })))
    .slice(0, 4)

  return (
    <div>
      <div className="page-head">
        <h1>Intelligence Feed</h1>
        <div className="sub">
          Week 24, 2026 · Your curated view across {modules.filter((m) => m.subscribed).length}{' '}
          subscribed modules
          {q && (
            <>
              {' '}
              · searching “{params.get('q')}”{' '}
              <button className="btn small" style={{ marginLeft: 6 }} onClick={() => setParam('q', '')}>
                Clear
              </button>
            </>
          )}
        </div>
      </div>

      <div className="chips">
        {filterChips.map((c) => (
          <button
            key={c.key}
            className={`chip${typeFilter === c.key ? ' active' : ''}`}
            onClick={() => setParam('type', c.key)}
          >
            {c.label}
          </button>
        ))}
        <select value={moduleFilter} onChange={(e) => setParam('module', e.target.value)}>
          <option value="all">All modules</option>
          {moduleOptions.map(([id, short]) => (
            <option key={id} value={id}>
              {short}
            </option>
          ))}
        </select>
      </div>

      <div className="feed-layout">
        <div>
          {error ? (
            <div className="ws-empty card">
              Couldn’t load insights from Sanity.
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 8 }}>{error}</div>
            </div>
          ) : insights === null ? (
            <div className="ws-empty card">Loading the latest intelligence…</div>
          ) : items.length === 0 ? (
            <div className="ws-empty card">
              {all.length === 0
                ? 'No published insights yet — publish one in the Studio and it will appear here.'
                : 'No items match the current filters.'}
            </div>
          ) : (
            items.map((i) => <FeedCard key={i.id} item={i} />)
          )}
        </div>

        <aside className="rail">
          <div className="card">
            <h4>
              <TrendingUp size={12} style={{ verticalAlign: -2 }} /> Latest Forecast Revision
            </h4>
            {latestForecast ? (
              <div className="rail-item">
                <div className="t">
                  <Link to={`/insights/${latestForecast.id}`}>{latestForecast.title}</Link>
                </div>
                <div className="s">
                  {typeLabels[latestForecast.type]} · {formatDate(latestForecast.date)}
                </div>
              </div>
            ) : (
              <div className="rail-item">
                <div className="s">No forecast updates published yet.</div>
              </div>
            )}
            <Link to="/forecasts" className="rail-cta">
              Open in Forecast Explorer
            </Link>
          </div>

          <div className="card">
            <h4>
              <CalendarClock size={12} style={{ verticalAlign: -2 }} /> Upcoming Office Hours
            </h4>
            {upcomingSlots.map(({ analyst, slot }) => (
              <div className="rail-item" key={slot.id}>
                <div className="t">{analyst.name}</div>
                <div className="s">
                  {slot.day} · {slot.time} · {slot.remaining} slot{slot.remaining !== 1 && 's'} left
                </div>
              </div>
            ))}
            <Link to="/analysts" className="rail-cta ghost">
              Book a session
            </Link>
          </div>

          <div className="card">
            <h4>Your Datasets</h4>
            {datasets.length === 0 ? (
              <div className="rail-item">
                <div className="s">No forecast datasets published yet.</div>
              </div>
            ) : (
              datasets.slice(0, 4).map((d) => (
                <div className="rail-item" key={d.id}>
                  <div className="t">
                    <Link to={`/forecasts?dataset=${d.id}`}>{d.name}</Link>
                  </div>
                  <div className="s">
                    {d.versions[0]
                      ? `Latest version: ${d.versions[0].label} · ${formatDate(d.versions[0].publishedAt)}`
                      : 'No versions yet'}
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

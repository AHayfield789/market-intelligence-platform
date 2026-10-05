import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bookmark, LineChart, StickyNote, Trash2, FolderOpen, MessageSquare } from 'lucide-react'
import { getInsights, type FeedInsight } from '../data/insights'
import { analysts } from '../data/structure'
import { useApp } from '../store'
import { typeLabels } from '../components/FeedCard'
import { formatDate } from '../components/Layout'

type Tab = 'bookmarks' | 'views' | 'notes' | 'questions'

export default function WorkspacePage() {
  const { bookmarks, toggleBookmark, savedViews, removeView, notes, removeNote, questions } =
    useApp()
  const [tab, setTab] = useState<Tab>('bookmarks')
  const [insights, setInsights] = useState<FeedInsight[]>([])

  useEffect(() => {
    getInsights().then(setInsights).catch(() => setInsights([]))
  }, [])

  const bookmarkedItems = insights.filter((i) => bookmarks.includes(i.id))

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'bookmarks', label: 'Bookmarked Insights', count: bookmarkedItems.length },
    { key: 'views', label: 'Saved Views', count: savedViews.length },
    { key: 'notes', label: 'Private Notes', count: notes.length },
    { key: 'questions', label: 'Questions Sent', count: questions.length },
  ]

  return (
    <div>
      <div className="page-head">
        <h1>My Workspace</h1>
        <div className="sub">
          Your strategic workspace — everything you have saved, organised in one place.
        </div>
      </div>

      <div className="ws-tabs">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`ws-tab${tab === t.key ? ' active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {tab === 'bookmarks' && (
        <div className="card ws-list">
          {bookmarkedItems.length === 0 ? (
            <div className="ws-empty">
              <Bookmark size={28} />
              <div>No bookmarks yet — save insights from the feed to find them here.</div>
            </div>
          ) : (
            bookmarkedItems.map((i) => (
              <div className="ws-row" key={i.id}>
                <span className={`type-badge type-${i.type}`}>{typeLabels[i.type]}</span>
                <div className="grow">
                  <div className="t">
                    <Link to={`/insights/${i.id}`}>{i.title}</Link>
                  </div>
                  <div className="s">{formatDate(i.date)}</div>
                </div>
                <button className="x" onClick={() => toggleBookmark(i.id)} title="Remove bookmark">
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'views' && (
        <div className="card ws-list">
          {savedViews.length === 0 ? (
            <div className="ws-empty">
              <LineChart size={28} />
              <div>
                No saved views yet — configure a forecast or benchmark view and click “Save view”.
              </div>
            </div>
          ) : (
            savedViews.map((v) => (
              <div className="ws-row" key={v.id}>
                <span className={`type-badge ${v.kind === 'forecast' ? 'type-forecast' : 'type-insight'}`}>
                  {v.kind === 'forecast' ? 'Forecast' : 'Benchmark'}
                </span>
                <div className="grow">
                  <div className="t">
                    <Link to={v.url}>{v.name}</Link>
                  </div>
                  <div className="s">Saved {formatDate(v.created.slice(0, 10))}</div>
                </div>
                <button className="x" onClick={() => removeView(v.id)} title="Delete view">
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'notes' && (
        <div className="card ws-list">
          {notes.length === 0 ? (
            <div className="ws-empty">
              <StickyNote size={28} />
              <div>No notes yet — capture private notes from any insight page.</div>
            </div>
          ) : (
            notes.map((n) => (
              <div className="ws-row" key={n.id}>
                <div className="grow">
                  <div className="t" style={{ whiteSpace: 'pre-wrap' }}>{n.text}</div>
                  <div className="s">
                    {n.linkedTitle && (
                      <>
                        On: <Link to={n.linkedUrl ?? '#'} style={{ color: 'var(--accent-dark)' }}>{n.linkedTitle}</Link> ·{' '}
                      </>
                    )}
                    {formatDate(n.created.slice(0, 10))}
                  </div>
                </div>
                <button className="x" onClick={() => removeNote(n.id)} title="Delete note">
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'questions' && (
        <div className="card ws-list">
          {questions.length === 0 ? (
            <div className="ws-empty">
              <MessageSquare size={28} />
              <div>No questions sent yet — ask an analyst directly from their profile.</div>
            </div>
          ) : (
            questions.map((qq) => {
              const a = analysts.find((x) => x.id === qq.analystId)
              return (
                <div className="ws-row" key={qq.id}>
                  <div className="grow">
                    <div className="t" style={{ whiteSpace: 'pre-wrap' }}>{qq.text}</div>
                    <div className="s">
                      To {a?.name} · {formatDate(qq.created.slice(0, 10))} · Awaiting response
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {(bookmarks.length > 0 || savedViews.length > 0 || notes.length > 0) && (
        <div style={{ marginTop: 16, color: 'var(--text-3)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <FolderOpen size={13} />
          Workspace contents persist in your browser between sessions.
        </div>
      )}
    </div>
  )
}

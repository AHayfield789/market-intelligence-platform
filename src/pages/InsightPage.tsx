import { useEffect, useState } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { PortableText, type PortableTextComponents } from '@portabletext/react'
import { ArrowLeft, Bookmark, Clock, CalendarPlus, StickyNote } from 'lucide-react'
import { getInsights, type FeedInsight } from '../data/insights'
import { urlFor, type ImageSource } from '../data/imageUrl'
import { useApp } from '../store'
import { typeLabels } from '../components/FeedCard'
import { formatDate } from '../components/Layout'
import { toast } from '../components/Toast'

const portableComponents: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      const img = value as {
        asset?: unknown
        alt?: string
        caption?: string
        size?: string
        align?: string
      }
      if (!img?.asset) return null
      const size = img.size ?? 'full'
      const align = img.align ?? 'center'
      return (
        <figure className={`article-figure size-${size} align-${align}`}>
          <img
            src={urlFor(value as ImageSource).width(1200).fit('max').auto('format').url()}
            alt={img.alt ?? ''}
          />
          {img.caption && <figcaption>{img.caption}</figcaption>}
        </figure>
      )
    },
  },
}

export default function InsightPage() {
  const { id } = useParams()
  const { bookmarks, toggleBookmark, addNote } = useApp()
  const [noteText, setNoteText] = useState('')
  const [insights, setInsights] = useState<FeedInsight[] | null>(null)

  useEffect(() => {
    getInsights().then(setInsights).catch(() => setInsights([]))
  }, [])

  if (insights === null) {
    return (
      <div className="ws-empty card" style={{ marginTop: 12 }}>
        Loading…
      </div>
    )
  }

  const item = insights.find((i) => i.id === id)
  if (!item) return <Navigate to="/feed" replace />

  const bookmarked = bookmarks.includes(item.id)
  const related = insights
    .filter((i) => i.id !== item.id && i.moduleIds.some((m) => item.moduleIds.includes(m)))
    .slice(0, 3)

  function saveNote() {
    if (!noteText.trim()) return
    addNote(noteText.trim(), item!.title, `/insights/${item!.id}`)
    setNoteText('')
    toast('Note saved to your workspace')
  }

  return (
    <div>
      <Link to="/feed" className="back-link">
        <ArrowLeft size={14} /> Back to feed
      </Link>
      <div className="article-layout">
        <article className="card article">
          <div className="meta-row" style={{ display: 'flex', gap: 8 }}>
            <span className={`type-badge type-${item.type}`}>{typeLabels[item.type]}</span>
            {item.moduleShorts.map((short) => (
              <span key={short} className="module-tag">
                {short}
              </span>
            ))}
          </div>
          <h1>{item.title}</h1>
          {item.coverImage && (
            <img
              className="article-cover"
              src={urlFor(item.coverImage).width(1400).fit('max').auto('format').url()}
              alt=""
            />
          )}
          <p className="lede">{item.summary}</p>
          <div className="art-meta">
            <span className="byline">
              <span className="mini-avatar" style={{ background: item.analyst.color }}>
                {item.analyst.initials}
              </span>
              <span className="nm">
                {item.analyst.name}
                {item.analyst.title ? ` · ${item.analyst.title}` : ''}
              </span>
            </span>
            <span>{formatDate(item.date)}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Clock size={12} /> {item.readTime} min read
            </span>
            <span style={{ flex: 1 }} />
            <button
              className={`btn small${bookmarked ? ' primary' : ''}`}
              onClick={() => {
                toggleBookmark(item.id)
                toast(bookmarked ? 'Bookmark removed' : 'Saved to your workspace')
              }}
            >
              <Bookmark size={13} fill={bookmarked ? 'currentColor' : 'none'} />
              {bookmarked ? 'Bookmarked' : 'Bookmark'}
            </button>
          </div>
          <div className="body">
            <PortableText value={item.body} components={portableComponents} />
          </div>
        </article>

        <aside className="rail">
          <div className="card analyst-card">
            <div className="top">
              <div className="big-avatar" style={{ background: item.analyst.color }}>
                {item.analyst.initials}
              </div>
              <div>
                <div className="nm">{item.analyst.name}</div>
                <div className="tt">{item.analyst.title}</div>
              </div>
            </div>
            {item.analyst.bio && <p className="bio">{item.analyst.bio}</p>}
            <Link
              to="/analysts"
              className="rail-cta"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <CalendarPlus size={14} /> Book office hours
            </Link>
          </div>

          <div className="card" style={{ padding: '16px 18px' }}>
            <h4>
              <StickyNote size={12} style={{ verticalAlign: -2 }} /> Private Note
            </h4>
            <div className="note-box">
              <textarea
                placeholder="Capture a thought on this insight — saved privately to your workspace."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
              />
              <button
                className="btn primary small"
                style={{ marginTop: 8 }}
                onClick={saveNote}
                disabled={!noteText.trim()}
              >
                Save note
              </button>
            </div>
          </div>

          {related.length > 0 && (
            <div className="card" style={{ padding: '16px 18px' }}>
              <h4>Related Intelligence</h4>
              {related.map((r) => (
                <div className="rail-item" key={r.id}>
                  <div className="t">
                    <Link to={`/insights/${r.id}`}>{r.title}</Link>
                  </div>
                  <div className="s">
                    {typeLabels[r.type]} · {formatDate(r.date)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

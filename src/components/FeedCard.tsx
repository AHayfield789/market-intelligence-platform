import { Link } from 'react-router-dom'
import { Bookmark, Clock } from 'lucide-react'
import type { FeedItemType } from '../types'
import type { FeedInsight } from '../data/insights'
import { urlFor } from '../data/imageUrl'
import { useApp } from '../store'
import { formatDate } from './Layout'

export const typeLabels: Record<FeedItemType, string> = {
  insight: 'Analyst Insight',
  event: 'Major Market Event Commentary',
  forecast: 'Forecast Update',
  news: 'News Tracker',
}

export default function FeedCard({ item }: { item: FeedInsight }) {
  const { bookmarks, toggleBookmark } = useApp()
  const bookmarked = bookmarks.includes(item.id)

  return (
    <article className="card feed-card">
      {item.coverImage && (
        <Link to={`/insights/${item.id}`}>
          <img
            className="feed-cover"
            src={urlFor(item.coverImage).width(900).height(360).fit('crop').auto('format').url()}
            alt=""
          />
        </Link>
      )}
      <div className="meta-row">
        <span className={`type-badge type-${item.type}`}>{typeLabels[item.type]}</span>
        {item.moduleShorts.slice(0, 2).map((short) => (
          <span key={short} className="module-tag">
            {short}
          </span>
        ))}
        <span style={{ marginLeft: 'auto', color: 'var(--text-3)', fontSize: 12 }}>
          {formatDate(item.date)}
        </span>
      </div>
      <h3>
        <Link to={`/insights/${item.id}`}>{item.title}</Link>
      </h3>
      <p className="summary">{item.summary}</p>
      <div className="foot">
        <span className="byline">
          <span className="mini-avatar" style={{ background: item.analyst.color }}>
            {item.analyst.initials}
          </span>
          <span className="nm">{item.analyst.name}</span>
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <Clock size={12} /> {item.readTime} min read
        </span>
        <span className="spacer" />
        <button
          className={`bookmark-btn${bookmarked ? ' on' : ''}`}
          onClick={() => toggleBookmark(item.id)}
          title={bookmarked ? 'Remove bookmark' : 'Bookmark for later'}
        >
          <Bookmark size={16} fill={bookmarked ? 'currentColor' : 'none'} />
        </button>
      </div>
    </article>
  )
}

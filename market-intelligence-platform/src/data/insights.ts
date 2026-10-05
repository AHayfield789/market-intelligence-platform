import type { PortableTextBlock } from '@portabletext/types'
import type { FeedItemType } from '../types'
import type { ImageSource } from './imageUrl'
import { sanityClient } from './sanityClient'

/** An insight as consumed by the app — published content resolved from Sanity. */
export interface FeedInsight {
  id: string // slug
  type: FeedItemType
  title: string
  summary: string
  body: PortableTextBlock[]
  bodyText: string // plain-text version, used for search and read-time estimation
  coverImage: ImageSource | null
  date: string // ISO datetime
  readTime: number
  analyst: {
    name: string
    title: string
    initials: string
    color: string
    bio: string
  }
  moduleIds: string[]
  moduleShorts: string[]
}

const INSIGHTS_QUERY = `*[_type == "insight" && defined(slug.current) && publishedAt <= now()] | order(publishedAt desc){
  "id": slug.current,
  type,
  title,
  summary,
  coverImage,
  body,
  "date": publishedAt,
  readTime,
  "analyst": analyst->{name, title, initials, color, bio},
  "moduleIds": modules[]->slug.current,
  "moduleShorts": modules[]->short
}`

interface RawInsight {
  id: string
  type: FeedItemType
  title: string
  summary: string
  body?: PortableTextBlock[]
  coverImage?: ImageSource
  date: string
  readTime?: number
  analyst?: { name: string; title: string; initials: string; color: string; bio: string }
  moduleIds?: (string | null)[]
  moduleShorts?: (string | null)[]
}

function toPlainText(blocks: PortableTextBlock[] = []): string {
  return blocks
    .map((block) => {
      const b = block as { _type?: string; children?: { text?: string }[] }
      if (b._type !== 'block' || !Array.isArray(b.children)) return ''
      return b.children.map((child) => child.text ?? '').join('')
    })
    .filter(Boolean)
    .join('\n\n')
}

function mapInsight(r: RawInsight): FeedInsight {
  const body = r.body ?? []
  const bodyText = toPlainText(body)
  const wordCount = bodyText.split(/\s+/).filter(Boolean).length
  const readTime = r.readTime ?? Math.max(1, Math.round(wordCount / 200))
  return {
    id: r.id,
    type: r.type,
    title: r.title,
    summary: r.summary,
    body,
    bodyText,
    coverImage: r.coverImage ?? null,
    date: r.date,
    readTime,
    analyst: r.analyst ?? { name: 'Unknown analyst', title: '', initials: '?', color: '#64748b', bio: '' },
    moduleIds: (r.moduleIds ?? []).filter((x): x is string => Boolean(x)),
    moduleShorts: (r.moduleShorts ?? []).filter((x): x is string => Boolean(x)),
  }
}

/** Fetch all published insights, newest first. */
export async function getInsights(): Promise<FeedInsight[]> {
  const raw = await sanityClient.fetch<RawInsight[]>(INSIGHTS_QUERY)
  return raw.map(mapInsight)
}

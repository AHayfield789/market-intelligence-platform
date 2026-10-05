export type FeedItemType = 'insight' | 'event' | 'forecast' | 'news'

export interface FeedItem {
  id: string
  type: FeedItemType
  title: string
  summary: string
  body: string[]
  analystId: string
  date: string // ISO
  moduleIds: string[]
  readTime: number // minutes
}

export interface OfficeHourSlot {
  id: string
  day: string
  time: string
  remaining: number
}

export interface Analyst {
  id: string
  name: string
  title: string
  focus: string[]
  bio: string
  initials: string
  color: string
  officeHours: OfficeHourSlot[]
}

export interface Portfolio {
  id: string
  name: string
  description: string
}

export interface Module {
  id: string
  portfolioId: string
  name: string
  short: string
  subscribed: boolean
  description: string
}

export interface ForecastVersion {
  id: string
  label: string
  published: string
  summary: string
  /** category -> value per year, aligned with dataset.years */
  data: Record<string, number[]>
}

export interface ForecastDataset {
  id: string
  moduleId: string
  name: string
  unit: string
  dimensionName: string
  categories: string[]
  years: number[]
  versions: ForecastVersion[] // newest first
}

export interface Company {
  id: string
  name: string
  hq: string
  moduleId: string
  revenue: number // $M, latest year
  share: number // %
  growth: number // % YoY
  note: string
}

export interface SavedView {
  id: string
  name: string
  kind: 'forecast' | 'benchmark'
  url: string
  created: string
}

export interface Note {
  id: string
  text: string
  linkedTitle?: string
  linkedUrl?: string
  created: string
}

export interface Booking {
  id: string
  analystId: string
  slotId: string
  created: string
}

export interface Question {
  id: string
  analystId: string
  text: string
  created: string
}

export interface Notification {
  id: string
  title: string
  detail: string
  date: string
  url: string
}

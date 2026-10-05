import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { SavedView, Note, Booking, Question } from './types'

interface AppState {
  bookmarks: string[]
  toggleBookmark: (id: string) => void
  savedViews: SavedView[]
  saveView: (name: string, kind: SavedView['kind'], url: string) => void
  removeView: (id: string) => void
  notes: Note[]
  addNote: (text: string, linkedTitle?: string, linkedUrl?: string) => void
  removeNote: (id: string) => void
  bookings: Booking[]
  bookSlot: (analystId: string, slotId: string) => void
  cancelBooking: (id: string) => void
  questions: Question[]
  askQuestion: (analystId: string, text: string) => void
  readNotifications: string[]
  markAllRead: () => void
}

const Ctx = createContext<AppState | null>(null)

function usePersisted<T>(key: string, initial: T): [T, (v: T | ((p: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : initial
    } catch {
      return initial
    }
  })
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])
  return [value, setValue]
}

const uid = () => Math.random().toString(36).slice(2, 10)

export function AppProvider({ children }: { children: ReactNode }) {
  const [bookmarks, setBookmarks] = usePersisted<string[]>('mp.bookmarks', [])
  const [savedViews, setSavedViews] = usePersisted<SavedView[]>('mp.views', [])
  const [notes, setNotes] = usePersisted<Note[]>('mp.notes', [])
  const [bookings, setBookings] = usePersisted<Booking[]>('mp.bookings', [])
  const [questions, setQuestions] = usePersisted<Question[]>('mp.questions', [])
  const [readNotifications, setReadNotifications] = usePersisted<string[]>('mp.readNotifs', [])

  const value: AppState = {
    bookmarks,
    toggleBookmark: (id) =>
      setBookmarks((b) => (b.includes(id) ? b.filter((x) => x !== id) : [...b, id])),
    savedViews,
    saveView: (name, kind, url) =>
      setSavedViews((v) => [
        { id: uid(), name, kind, url, created: new Date().toISOString() },
        ...v,
      ]),
    removeView: (id) => setSavedViews((v) => v.filter((x) => x.id !== id)),
    notes,
    addNote: (text, linkedTitle, linkedUrl) =>
      setNotes((n) => [
        { id: uid(), text, linkedTitle, linkedUrl, created: new Date().toISOString() },
        ...n,
      ]),
    removeNote: (id) => setNotes((n) => n.filter((x) => x.id !== id)),
    bookings,
    bookSlot: (analystId, slotId) =>
      setBookings((b) =>
        b.some((x) => x.slotId === slotId)
          ? b
          : [...b, { id: uid(), analystId, slotId, created: new Date().toISOString() }],
      ),
    cancelBooking: (id) => setBookings((b) => b.filter((x) => x.id !== id)),
    questions,
    askQuestion: (analystId, text) =>
      setQuestions((q) => [
        { id: uid(), analystId, text, created: new Date().toISOString() },
        ...q,
      ]),
    readNotifications,
    markAllRead: () => setReadNotifications(['n1', 'n2', 'n3', 'n4']),
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useApp(): AppState {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}

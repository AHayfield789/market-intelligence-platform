import { useState } from 'react'
import { CalendarCheck2, MessageSquare, Send } from 'lucide-react'
import { useStructure } from '../data/structureContext'
import { useApp } from '../store'
import { toast } from '../components/Toast'

export default function AnalystsPage() {
  const { analysts } = useStructure()
  const { bookings, bookSlot, cancelBooking, askQuestion } = useApp()
  const [askingId, setAskingId] = useState<string | null>(null)
  const [questionText, setQuestionText] = useState('')

  function submitQuestion(analystId: string) {
    if (!questionText.trim()) return
    askQuestion(analystId, questionText.trim())
    setQuestionText('')
    setAskingId(null)
    toast('Question sent — the analyst will respond within 2 business days')
  }

  return (
    <div>
      <div className="page-head">
        <h1>Analyst Engagement</h1>
        <div className="sub">
          Expert access is part of your subscription — book office hours or send a contextual
          question directly to the team behind the data.
        </div>
      </div>

      {bookings.length > 0 && (
        <div className="card panel">
          <h3>Your booked sessions</h3>
          <div className="panel-sub">Calendar invitations are sent to your registered email.</div>
          {bookings.map((b) => {
            const analyst = analysts.find((a) => a.id === b.analystId)
            if (!analyst) return null
            const slot = analyst.officeHours.find((s) => s.id === b.slotId)
            return (
              <div className="slot-row" key={b.id}>
                <span className="when">
                  {analyst.name} — {slot?.day} · {slot?.time}
                </span>
                <button className="btn small" onClick={() => cancelBooking(b.id)}>
                  Cancel
                </button>
              </div>
            )
          })}
        </div>
      )}

      <div className="analyst-grid">
        {analysts.map((a) => {
          const booked = bookings.filter((b) => b.analystId === a.id)
          return (
            <div className="card analyst-tile" key={a.id}>
              <div className="top" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div className="big-avatar" style={{ background: a.color, width: 52, height: 52, borderRadius: '50%', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>
                  {a.initials}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{a.name}</div>
                  <div style={{ color: 'var(--text-2)', fontSize: 12.5 }}>{a.title}</div>
                </div>
              </div>
              <div className="focus-tags">
                {a.focus.map((f) => (
                  <span key={f} className="module-tag">
                    {f}
                  </span>
                ))}
              </div>
              <p style={{ color: 'var(--text-2)', fontSize: 13, lineHeight: 1.55, margin: '0 0 14px' }}>
                {a.bio}
              </p>

              <h4 style={{ margin: '0 0 4px', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8, color: 'var(--text-3)', fontWeight: 700 }}>
                Office hours
              </h4>
              {a.officeHours.map((s) => {
                const isBooked = booked.some((b) => b.slotId === s.id)
                return (
                  <div className="slot-row" key={s.id}>
                    <div>
                      <div className="when">
                        {s.day} · {s.time}
                      </div>
                      <div className="left">{s.remaining} slot{s.remaining !== 1 && 's'} remaining</div>
                    </div>
                    {isBooked ? (
                      <span className="booked-banner">
                        <CalendarCheck2 size={13} /> Booked
                      </span>
                    ) : (
                      <button
                        className="btn small primary"
                        onClick={() => {
                          bookSlot(a.id, s.id)
                          toast(`Booked ${a.name} — ${s.day}, ${s.time}`)
                        }}
                      >
                        Book
                      </button>
                    )}
                  </div>
                )
              })}

              <div style={{ marginTop: 14 }}>
                {askingId === a.id ? (
                  <div className="note-box">
                    <textarea
                      autoFocus
                      placeholder={`Ask ${a.name.split(' ')[0]} a question — include context so they can respond efficiently.`}
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                    />
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <button className="btn primary small" onClick={() => submitQuestion(a.id)} disabled={!questionText.trim()}>
                        <Send size={12} /> Send question
                      </button>
                      <button className="btn small" onClick={() => { setAskingId(null); setQuestionText('') }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button className="btn" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setAskingId(a.id)}>
                    <MessageSquare size={14} /> Ask a question
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

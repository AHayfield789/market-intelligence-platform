import { useState, useRef, useEffect } from 'react'
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom'
import {
  Activity,
  Newspaper,
  LineChart,
  BarChart3,
  Users,
  FolderOpen,
  Bell,
  Search,
  Lock,
} from 'lucide-react'
import { notifications } from '../data/structure'
import { useStructure } from '../data/structureContext'
import { useApp } from '../store'

export default function Layout() {
  const navigate = useNavigate()
  const { portfolios, modules } = useStructure()
  const { readNotifications, markAllRead } = useApp()
  const [notifOpen, setNotifOpen] = useState(false)
  const [query, setQuery] = useState('')
  const notifRef = useRef<HTMLDivElement>(null)

  const unread = notifications.filter((n) => !readNotifications.includes(n.id)).length

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  function submitSearch(e: React.FormEvent) {
    e.preventDefault()
    navigate(query.trim() ? `/feed?q=${encodeURIComponent(query.trim())}` : '/feed')
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link to="/feed" className="sidebar-logo">
          <div className="logo-mark">
            <Activity size={18} />
          </div>
          <div>
            <div className="logo-name">MarketPulse</div>
            <div className="logo-sub">Intelligence Platform</div>
          </div>
        </Link>

        <nav className="nav-section">
          <NavLink to="/feed" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <Newspaper size={16} /> Intelligence Feed
          </NavLink>
          <NavLink to="/forecasts" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <LineChart size={16} /> Forecast Explorer
          </NavLink>
          <NavLink to="/benchmarking" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <BarChart3 size={16} /> Benchmarking
          </NavLink>
          <NavLink to="/analysts" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <Users size={16} /> Analysts
          </NavLink>
          <NavLink to="/workspace" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <FolderOpen size={16} /> My Workspace
          </NavLink>
        </nav>

        <div className="nav-section">
          {portfolios.map((p) => (
            <div key={p.id}>
              <div className="nav-section-label">{p.name}</div>
              {modules
                .filter((m) => m.portfolioId === p.id)
                .map((m) =>
                  m.subscribed ? (
                    <Link
                      key={m.id}
                      to={`/feed?module=${m.id}`}
                      className="nav-module"
                      title={m.description}
                    >
                      <span>
                        <span className="dot" />
                        {m.short}
                      </span>
                    </Link>
                  ) : (
                    <span key={m.id} className="nav-module locked" title={`${m.description} — not in your subscription`}>
                      <span style={{ paddingLeft: 14 }}>{m.short}</span>
                      <Lock size={12} className="lock" />
                    </span>
                  ),
                )}
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          Subscription: {modules.filter((m) => m.subscribed).length} module
          {modules.filter((m) => m.subscribed).length !== 1 && 's'}
          <br />
          Prototype — illustrative data only
        </div>
      </aside>

      <div className="main-col">
        <header className="topbar">
          <form className="search-box" onSubmit={submitSearch}>
            <Search size={15} />
            <input
              placeholder="Search insights, forecasts, companies…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </form>
          <div className="topbar-right">
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button
                className="icon-btn"
                onClick={() => setNotifOpen((o) => !o)}
                aria-label="Notifications"
              >
                <Bell size={17} />
                {unread > 0 && <span className="badge-dot" />}
              </button>
              {notifOpen && (
                <div className="notif-panel">
                  <div className="notif-head">
                    Notifications
                    {unread > 0 && <button onClick={markAllRead}>Mark all read</button>}
                  </div>
                  {notifications.map((n) => (
                    <Link
                      key={n.id}
                      to={n.url}
                      className="notif-item"
                      onClick={() => setNotifOpen(false)}
                    >
                      <div className="t">
                        {!readNotifications.includes(n.id) && <span className="unread" />}
                        {n.title}
                      </div>
                      <div className="d">{n.detail}</div>
                      <div className="dt">{formatDate(n.date)}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <div className="user-chip">
              <div className="avatar">BG</div>
              <span className="name">Blake Griffin</span>
            </div>
          </div>
        </header>

        <main className="content">
          <Outlet />
          <div className="disclaimer">
            MarketPulse prototype — all market data, company figures and commentary are illustrative.
          </div>
        </main>
      </div>
    </div>
  )
}

export function formatDate(iso: string): string {
  // Accepts both date-only ('YYYY-MM-DD') and full ISO datetimes (from Sanity).
  const d = iso.length <= 10 ? new Date(iso + 'T00:00:00') : new Date(iso)
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

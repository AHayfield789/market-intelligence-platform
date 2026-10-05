# MarketPulse — Platform-Based Market Intelligence Service (Prototype)

An interactive, clickable prototype of an analyst-led, continuously updated market
intelligence platform. Built to demonstrate the product vision: replacing static annual
reports with a living intelligence environment built around analyst expertise and
proprietary data.

**All market data, company figures and commentary are illustrative.** The demo is themed
around industrial automation markets (mobile robots, warehouse automation, LV motors).

## What's implemented

| Capability | Where | Highlights |
| --- | --- | --- |
| Living Insight Engine | Intelligence Feed | Monthly insights, event commentary, forecast-update explainers, analyst-curated news tracker; filter by type/module; full article pages |
| Structured Forecast Explorer | Forecast Explorer | Dataset library grouped by module, version control with quarter-on-quarter comparison and per-cell change deltas, version history with change notes, CSV export |
| Competitive Benchmarking | Benchmarking | Market share donut, sortable vendor rankings with analyst notes, side-by-side peer comparison (up to 4 companies), KPI cards, CSV export |
| Analyst Engagement | Analysts | Office-hours booking, "ask a question" submission, analyst bylines embedded throughout the feed |
| Workflow Integration | My Workspace | Bookmarked insights, saved forecast/benchmark views (deep links), private notes, sent questions — persisted in localStorage |
| Portfolio structure | Sidebar | Portfolio → module hierarchy with subscribed vs. locked (upsell-visible) modules |
| Engagement model | Topbar | Notification centre with unread state; global search across insights |

## Running it

Requires Node.js 18+.

```bash
npm install
npm run dev      # local dev server on http://localhost:5173
npm run build    # type-check + production build to dist/
```

> Note: this machine uses a portable Node install at
> `%LOCALAPPDATA%\node-portable\node-v22.17.0-win-x64` — add it to PATH or invoke
> `node`/`npm` from there.

## Stack

- React 18 + TypeScript + Vite
- React Router (hash routing — works from any static host, no server config)
- Recharts for forecast and benchmarking charts
- lucide-react icons; hand-rolled design system in `src/styles.css`
- No backend — all content lives in `src/data/`, user state in localStorage

## Where things live

```
src/
  data/        mock intelligence content (feed, forecasts, companies, analysts, portfolios)
  pages/       Feed, Insight article, Forecast Explorer, Benchmarking, Analysts, Workspace
  components/  Layout (sidebar/topbar/notifications), FeedCard, Toast
  store.tsx    workspace state (bookmarks, views, notes, bookings) with localStorage persistence
```

## Phase-2 candidates (per the product roadmap)

Personalised dashboards, scenario modelling, intelligent cross-linking, external data
integration, AI-assisted interrogation — plus, on the engineering side: real auth and
entitlements, a CMS/API for analyst content, and server-side forecast data.

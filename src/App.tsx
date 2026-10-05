import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ToastHost from './components/Toast'
import { StructureProvider } from './data/structureContext'
import FeedPage from './pages/FeedPage'
import InsightPage from './pages/InsightPage'
import ForecastPage from './pages/ForecastPage'
import BenchmarkingPage from './pages/BenchmarkingPage'
import AnalystsPage from './pages/AnalystsPage'
import WorkspacePage from './pages/WorkspacePage'

export default function App() {
  return (
    <>
      <ToastHost />
      <StructureProvider>
      <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/feed" replace />} />
        <Route path="/feed" element={<FeedPage />} />
        <Route path="/insights/:id" element={<InsightPage />} />
        <Route path="/forecasts" element={<ForecastPage />} />
        <Route path="/benchmarking" element={<BenchmarkingPage />} />
        <Route path="/analysts" element={<AnalystsPage />} />
        <Route path="/workspace" element={<WorkspacePage />} />
        <Route path="*" element={<Navigate to="/feed" replace />} />
      </Route>
      </Routes>
      </StructureProvider>
    </>
  )
}

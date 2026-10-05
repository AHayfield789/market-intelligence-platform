import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Portfolio, Module, Analyst } from '../types'
import { getStructure } from './content'

interface StructureState {
  portfolios: Portfolio[]
  modules: Module[]
  analysts: Analyst[]
  loading: boolean
}

const initial: StructureState = { portfolios: [], modules: [], analysts: [], loading: true }

const Ctx = createContext<StructureState>(initial)

/** Fetches the portfolio/module/analyst taxonomy once and shares it across the app. */
export function StructureProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StructureState>(initial)

  useEffect(() => {
    getStructure()
      .then((d) => setState({ ...d, loading: false }))
      .catch(() => setState((s) => ({ ...s, loading: false })))
  }, [])

  return <Ctx.Provider value={state}>{children}</Ctx.Provider>
}

export function useStructure(): StructureState {
  return useContext(Ctx)
}

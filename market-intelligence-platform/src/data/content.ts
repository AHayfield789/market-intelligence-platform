import type { Portfolio, Module, Analyst } from '../types'
import { sanityClient } from './sanityClient'

export interface Structure {
  portfolios: Portfolio[]
  modules: Module[]
  analysts: Analyst[]
}

const STRUCTURE_QUERY = `{
  "portfolios": *[_type == "portfolio"] | order(name asc){
    "id": slug.current, name, description
  },
  "modules": *[_type == "module"] | order(name asc){
    "id": slug.current, name, short, description,
    "portfolioId": portfolio->slug.current,
    "subscribed": coalesce(inSubscription, true)
  },
  "analysts": *[_type == "analyst"] | order(name asc){
    "id": slug.current, name, title, focus, bio, initials, color,
    "officeHours": officeHours[]{"id": _key, day, time, remaining}
  }
}`

/** Fetch the portfolio / module / analyst taxonomy from Sanity. */
export async function getStructure(): Promise<Structure> {
  const data = await sanityClient.fetch<Structure>(STRUCTURE_QUERY)
  return {
    portfolios: data.portfolios ?? [],
    modules: data.modules ?? [],
    analysts: (data.analysts ?? []).map((a) => ({
      ...a,
      focus: a.focus ?? [],
      officeHours: a.officeHours ?? [],
    })),
  }
}

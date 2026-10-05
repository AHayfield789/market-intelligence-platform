import { createClient } from '@sanity/client'

// Project ID is a public identifier (not a secret). Move to an env var
// (import.meta.env.VITE_SANITY_PROJECT_ID) if you prefer per-environment config.
export const sanityClient = createClient({
  projectId: 's3ux4o1v',
  dataset: 'production',
  apiVersion: '2024-10-01',
  // useCdn:false serves uncached data so newly published content appears immediately
  // during development. Switch to true in production for speed once content is stable.
  useCdn: false,
})

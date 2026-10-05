// One-off seed: creates an example forecast dataset in Sanity so the Forecast
// Explorer has real, versioned data to show. Safe to re-run (it replaces, not duplicates).
//
// Run from this folder with an Editor token (manage.sanity.io -> project -> API -> Tokens):
//   $env:SANITY_TOKEN="<your-token>"; node seed-forecast.mjs        (PowerShell)
//
// Delete this file once you're happy creating datasets in the Studio yourself.

import { createClient } from '@sanity/client'

const token = process.env.SANITY_TOKEN
if (!token) {
  console.error('Set SANITY_TOKEN first (an Editor token from manage.sanity.io). Aborting.')
  process.exit(1)
}

const client = createClient({
  projectId: 's3ux4o1v',
  dataset: 'production',
  apiVersion: '2024-10-01',
  token,
  useCdn: false,
})

const years = '2024\t2025\t2026\t2027\t2028\t2029\t2030'
const q1 = [
  `Region\t${years}`,
  'North America\t5200\t5400\t5700\t6000\t6300\t6600\t6900',
  'EMEA\t4700\t4800\t5000\t5200\t5400\t5600\t5800',
  'China\t6100\t6300\t6700\t7100\t7500\t7900\t8300',
  'APAC ex-China\t2900\t3000\t3200\t3400\t3600\t3800\t4000',
].join('\n')
const q2 = [
  `Region\t${years}`,
  'North America\t5200\t5400\t5750\t6080\t6400\t6720\t7050',
  'EMEA\t4700\t4800\t5000\t5200\t5400\t5600\t5800',
  'China\t6100\t6300\t6650\t7000\t7350\t7700\t8050',
  'APAC ex-China\t2900\t3000\t3220\t3440\t3660\t3880\t4080',
].join('\n')

const moduleId = await client.fetch(`*[_type == "module" && slug.current == "motion-control"][0]._id`)
if (!moduleId) {
  console.error(
    'No module with slug "motion-control" found. Create that module first, or change the slug in this script.',
  )
  process.exit(1)
}

await client.createOrReplace({
  _id: 'forecast-motion-control-revenue-by-region',
  _type: 'forecastDataset',
  name: 'Motion Control — Revenue by Region',
  slug: { _type: 'slug', current: 'motion-control-revenue-by-region' },
  module: { _type: 'reference', _ref: moduleId },
  unit: '$M',
  dimensionName: 'Region',
  versions: [
    {
      _key: 'v-q2-2026',
      _type: 'version',
      label: 'Q2 2026',
      publishedAt: '2026-06-10T09:00:00Z',
      summary:
        'North America raised on the order-intake recovery; China trimmed on slower domestic capex. EMEA unchanged.',
      grid: q2,
    },
    {
      _key: 'v-q1-2026',
      _type: 'version',
      label: 'Q1 2026',
      publishedAt: '2026-03-12T09:00:00Z',
      summary: 'Baseline quarterly revision.',
      grid: q1,
    },
  ],
})

console.log('Seeded: "Motion Control — Revenue by Region" with 2 versions.')

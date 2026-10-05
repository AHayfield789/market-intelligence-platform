import type { ForecastDataset } from '../types'

export const forecastDatasets: ForecastDataset[] = [
  {
    id: 'mr-region',
    moduleId: 'mobile-robots',
    name: 'Mobile Robots — Revenue by Region',
    unit: '$M',
    dimensionName: 'Region',
    categories: ['North America', 'EMEA', 'China', 'APAC ex-China'],
    years: [2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030],
    versions: [
      {
        id: 'q2-2026',
        label: 'Q2 2026',
        published: '2026-06-10',
        summary:
          'China cut ~4% on slower domestic e-commerce capex and price erosion; North America raised 2% on order-intake recovery and grocery RFP pipeline. Global 2030 moves from $14.2B to $14.0B.',
        data: {
          'North America': [1080, 1290, 1530, 1820, 2230, 2700, 3240, 3820, 4430],
          EMEA: [890, 1040, 1210, 1430, 1700, 2030, 2410, 2820, 3260],
          China: [1310, 1490, 1700, 1950, 2210, 2520, 2860, 3210, 3560],
          'APAC ex-China': [480, 580, 700, 850, 1040, 1270, 1540, 1840, 2160],
        },
      },
      {
        id: 'q1-2026',
        label: 'Q1 2026',
        published: '2026-03-12',
        summary:
          'Baseline revision: modest global trim versus Q4 2025 reflecting slower EMEA conversion; regional mix otherwise stable.',
        data: {
          'North America': [1080, 1290, 1530, 1820, 2180, 2630, 3160, 3740, 4350],
          EMEA: [890, 1040, 1210, 1430, 1700, 2030, 2410, 2820, 3260],
          China: [1310, 1490, 1700, 1950, 2300, 2640, 3000, 3360, 3720],
          'APAC ex-China': [480, 580, 700, 850, 1040, 1270, 1540, 1840, 2160],
        },
      },
      {
        id: 'q4-2025',
        label: 'Q4 2025',
        published: '2025-12-10',
        summary:
          'Year-end baseline. Incorporated 2025 actuals through Q3 and first view of 2030.',
        data: {
          'North America': [1080, 1290, 1530, 1840, 2240, 2700, 3230, 3810, 4420],
          EMEA: [890, 1040, 1210, 1450, 1750, 2100, 2500, 2930, 3380],
          China: [1310, 1490, 1700, 1960, 2320, 2670, 3040, 3410, 3780],
          'APAC ex-China': [480, 580, 700, 850, 1050, 1290, 1570, 1870, 2200],
        },
      },
    ],
  },
  {
    id: 'mr-industry',
    moduleId: 'mobile-robots',
    name: 'Mobile Robots — Revenue by Industry',
    unit: '$M',
    dimensionName: 'Industry',
    categories: ['Logistics & 3PL', 'General Manufacturing', 'Automotive', 'Grocery & Retail'],
    years: [2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030],
    versions: [
      {
        id: 'q2-2026',
        label: 'Q2 2026',
        published: '2026-06-10',
        summary:
          'Grocery & retail raised on RFP pipeline; logistics trimmed slightly in China. Industry mix otherwise consistent with Q1.',
        data: {
          'Logistics & 3PL': [1620, 1880, 2180, 2540, 2950, 3450, 4010, 4630, 5290],
          'General Manufacturing': [1010, 1180, 1370, 1610, 1900, 2240, 2630, 3050, 3490],
          Automotive: [680, 760, 850, 960, 1100, 1270, 1460, 1660, 1870],
          'Grocery & Retail': [450, 580, 740, 940, 1230, 1560, 1950, 2350, 2760],
        },
      },
      {
        id: 'q1-2026',
        label: 'Q1 2026',
        published: '2026-03-12',
        summary: 'Baseline revision aligned with the regional model.',
        data: {
          'Logistics & 3PL': [1620, 1880, 2180, 2540, 3000, 3510, 4080, 4700, 5360],
          'General Manufacturing': [1010, 1180, 1370, 1610, 1900, 2240, 2630, 3050, 3490],
          Automotive: [680, 760, 850, 960, 1100, 1270, 1460, 1660, 1870],
          'Grocery & Retail': [450, 580, 740, 940, 1220, 1550, 1940, 2350, 2770],
        },
      },
    ],
  },
  {
    id: 'wa-region',
    moduleId: 'warehouse-automation',
    name: 'Warehouse Automation — Revenue by Region',
    unit: '$M',
    dimensionName: 'Region',
    categories: ['North America', 'EMEA', 'China', 'APAC ex-China'],
    years: [2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030],
    versions: [
      {
        id: 'q1-2026',
        label: 'Q1 2026',
        published: '2026-04-14',
        summary:
          'Raised 1.5% across 2026–2028 on brownfield modernisation and software momentum, concentrated in North America and the UK.',
        data: {
          'North America': [12400, 11800, 12100, 12900, 14100, 15600, 17200, 18900, 20600],
          EMEA: [10900, 10400, 10600, 11100, 11900, 12900, 14000, 15200, 16400],
          China: [6800, 6500, 6700, 7100, 7700, 8400, 9200, 10000, 10800],
          'APAC ex-China': [4300, 4200, 4400, 4700, 5100, 5600, 6200, 6800, 7400],
        },
      },
      {
        id: 'q4-2025',
        label: 'Q4 2025',
        published: '2025-12-10',
        summary: 'Year-end baseline incorporating 2025 integrator backlog data.',
        data: {
          'North America': [12400, 11800, 12100, 12900, 13900, 15300, 16900, 18600, 20300],
          EMEA: [10900, 10400, 10600, 11100, 11800, 12700, 13800, 15000, 16200],
          China: [6800, 6500, 6700, 7100, 7700, 8400, 9200, 10000, 10800],
          'APAC ex-China': [4300, 4200, 4400, 4700, 5100, 5600, 6200, 6800, 7400],
        },
      },
    ],
  },
  {
    id: 'wa-tech',
    moduleId: 'warehouse-automation',
    name: 'Warehouse Automation — Revenue by Technology',
    unit: '$M',
    dimensionName: 'Technology',
    categories: ['ASRS & Shuttle', 'Conveyance & Sortation', 'Picking Systems', 'Software & Services'],
    years: [2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030],
    versions: [
      {
        id: 'q1-2026',
        label: 'Q1 2026',
        published: '2026-04-14',
        summary:
          'Software & services share rises fastest; reaches ~33% of industry revenue by 2030 on current trajectory.',
        data: {
          'ASRS & Shuttle': [10300, 9800, 10000, 10600, 11400, 12400, 13400, 14500, 15600],
          'Conveyance & Sortation': [9900, 9300, 9400, 9700, 10300, 11000, 11800, 12600, 13400],
          'Picking Systems': [4800, 4700, 4900, 5300, 5900, 6600, 7400, 8300, 9200],
          'Software & Services': [9400, 9100, 9500, 10200, 11200, 12500, 14000, 15500, 17000],
        },
      },
    ],
  },
  {
    id: 'motors-region',
    moduleId: 'lv-motors',
    name: 'LV AC Motors — Revenue by Region',
    unit: '$M',
    dimensionName: 'Region',
    categories: ['Americas', 'EMEA', 'China', 'APAC ex-China'],
    years: [2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030],
    versions: [
      {
        id: 'q1-2026',
        label: 'Q1 2026',
        published: '2026-03-20',
        summary:
          'Premium-efficiency mix shift raises value growth ahead of unit growth; China IE4 enforcement reflected in pricing assumptions.',
        data: {
          Americas: [4900, 5100, 5200, 5400, 5700, 6000, 6300, 6600, 6900],
          EMEA: [4600, 4700, 4700, 4800, 5000, 5200, 5400, 5600, 5800],
          China: [5800, 6000, 6100, 6300, 6700, 7100, 7500, 7900, 8300],
          'APAC ex-China': [2700, 2800, 2900, 3000, 3200, 3400, 3600, 3800, 4000],
        },
      },
      {
        id: 'q4-2025',
        label: 'Q4 2025',
        published: '2025-12-15',
        summary: 'Year-end baseline with 2025 actuals through Q3.',
        data: {
          Americas: [4900, 5100, 5200, 5400, 5600, 5900, 6200, 6500, 6800],
          EMEA: [4600, 4700, 4700, 4800, 5000, 5200, 5400, 5600, 5800],
          China: [5800, 6000, 6100, 6300, 6600, 6900, 7200, 7600, 8000],
          'APAC ex-China': [2700, 2800, 2900, 3000, 3200, 3400, 3600, 3800, 4000],
        },
      },
    ],
  },
]

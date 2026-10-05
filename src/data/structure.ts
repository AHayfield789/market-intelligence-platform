import type { Portfolio, Module, Analyst, Notification } from '../types'

export const portfolios: Portfolio[] = [
  {
    id: 'robotics',
    name: 'Robotics & Warehouse Automation',
    description:
      'Intelligence covering mobile robotics, fixed warehouse automation and industrial robot ecosystems.',
  },
  {
    id: 'motion',
    name: 'Motors, Drives & Motion',
    description:
      'Intelligence covering low-voltage motors, variable frequency drives and motion control markets.',
  },
  {
    id: 'cv',
    name: 'Commercial Vehicle Electrification',
    description:
      'Intelligence covering electrified trucks, buses and off-highway machinery powertrains.',
  },
]

export const modules: Module[] = [
  {
    id: 'mobile-robots',
    portfolioId: 'robotics',
    name: 'Mobile Robots (AMR & AGV)',
    short: 'Mobile Robots',
    subscribed: true,
    description:
      'Autonomous mobile robots and automated guided vehicles across logistics, manufacturing and retail fulfilment.',
  },
  {
    id: 'warehouse-automation',
    portfolioId: 'robotics',
    name: 'Warehouse Automation',
    short: 'Warehouse Automation',
    subscribed: true,
    description:
      'Fixed automation systems, ASRS, conveyance and sortation, and warehouse software & integration markets.',
  },
  {
    id: 'industrial-robots',
    portfolioId: 'robotics',
    name: 'Industrial & Collaborative Robots',
    short: 'Industrial Robots',
    subscribed: false,
    description:
      'Six-axis, SCARA, delta and collaborative robot markets by application and end-user industry.',
  },
  {
    id: 'lv-motors',
    portfolioId: 'motion',
    name: 'Low-Voltage AC Motors',
    short: 'LV Motors',
    subscribed: true,
    description:
      'Low-voltage AC industrial motor demand, efficiency-class transitions and regional supply dynamics.',
  },
  {
    id: 'drives',
    portfolioId: 'motion',
    name: 'Variable Frequency Drives',
    short: 'VFDs',
    subscribed: false,
    description:
      'Low- and medium-voltage drive markets by power range, industry and architecture.',
  },
  {
    id: 'cv-electrification',
    portfolioId: 'cv',
    name: 'Electric Trucks & Buses',
    short: 'eTrucks & Buses',
    subscribed: false,
    description:
      'Battery-electric and fuel-cell commercial vehicle registrations, components and infrastructure.',
  },
]

export const analysts: Analyst[] = [
  {
    id: 'evasquez',
    name: 'Dr. Elena Vasquez',
    title: 'Principal Analyst, Mobile Robotics',
    focus: ['Mobile Robots', 'Warehouse Automation'],
    bio: 'Elena leads the mobile robotics research programme. She has tracked the AMR market since 2016 and advises leading vendors and end users on fleet economics, interoperability and go-to-market strategy.',
    initials: 'EV',
    color: '#2563eb',
    officeHours: [
      { id: 'ev-1', day: 'Tue 16 Jun', time: '10:00–10:30 BST', remaining: 2 },
      { id: 'ev-2', day: 'Tue 16 Jun', time: '14:00–14:30 BST', remaining: 1 },
      { id: 'ev-3', day: 'Thu 25 Jun', time: '15:00–15:30 BST', remaining: 3 },
    ],
  },
  {
    id: 'jokafor',
    name: 'James Okafor',
    title: 'Senior Analyst, Warehouse Automation',
    focus: ['Warehouse Automation', 'Logistics Software'],
    bio: 'James covers fixed warehouse automation and the systems-integration landscape, with particular depth in ASRS economics, micro-fulfilment and the order backlogs of the major integrators.',
    initials: 'JO',
    color: '#0d9488',
    officeHours: [
      { id: 'jo-1', day: 'Wed 17 Jun', time: '09:30–10:00 BST', remaining: 3 },
      { id: 'jo-2', day: 'Mon 22 Jun', time: '16:00–16:30 BST', remaining: 2 },
    ],
  },
  {
    id: 'mchen',
    name: 'Mei-Ling Chen',
    title: 'Research Director, Motors & Drives',
    focus: ['LV Motors', 'VFDs', 'Motion Control'],
    bio: 'Mei-Ling directs the motors and drives programme. She specialises in efficiency regulation, regional manufacturing shifts and the impact of electrification on component demand.',
    initials: 'MC',
    color: '#9333ea',
    officeHours: [
      { id: 'mc-1', day: 'Thu 18 Jun', time: '11:00–11:30 BST', remaining: 1 },
      { id: 'mc-2', day: 'Fri 26 Jun', time: '13:30–14:00 BST', remaining: 3 },
    ],
  },
  {
    id: 'teriksen',
    name: 'Tom Eriksen',
    title: 'Senior Analyst, Industrial Robotics',
    focus: ['Industrial Robots', 'Collaborative Robots'],
    bio: 'Tom tracks industrial and collaborative robot shipments, pricing and the emerging humanoid segment, with a focus on automotive and electronics end markets.',
    initials: 'TE',
    color: '#ea580c',
    officeHours: [
      { id: 'te-1', day: 'Fri 19 Jun', time: '10:00–10:30 BST', remaining: 2 },
    ],
  },
]

export const notifications: Notification[] = [
  {
    id: 'n1',
    title: 'Q2 2026 forecast revision published',
    detail: 'Mobile Robots global forecast updated — China outlook revised down 4%.',
    date: '2026-06-10',
    url: '/forecasts?dataset=mr-region&compare=1',
  },
  {
    id: 'n2',
    title: 'New event commentary',
    detail: 'Elena Vasquez on the Hai Robotics–Körber partnership announcement.',
    date: '2026-06-09',
    url: '/insights/ev-hai-korber',
  },
  {
    id: 'n3',
    title: 'June Mobile Robot Tracker is live',
    detail: 'Monthly insight: order intake rebounds in North American logistics.',
    date: '2026-06-08',
    url: '/insights/mr-tracker-jun26',
  },
  {
    id: 'n4',
    title: 'Office hours: 2 slots left',
    detail: 'Mei-Ling Chen — motors efficiency regulation deep-dive, Thu 18 Jun.',
    date: '2026-06-07',
    url: '/analysts',
  },
]

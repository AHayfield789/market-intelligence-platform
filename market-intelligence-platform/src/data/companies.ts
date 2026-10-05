import type { Company } from '../types'

/** Illustrative prototype data — not real market figures. */
export const companies: Company[] = [
  // Mobile Robots (2025 revenue, $M)
  { id: 'geekplus', name: 'Geek+', hq: 'China', moduleId: 'mobile-robots', revenue: 620, share: 8.9, growth: 21, note: 'Volume leader in goods-to-person AMRs; expanding overseas service network ahead of HK secondary listing.' },
  { id: 'locus', name: 'Locus Robotics', hq: 'United States', moduleId: 'mobile-robots', revenue: 540, share: 7.7, growth: 24, note: 'RaaS leader in 3PL; installed-base utilisation growing rapidly (5B cumulative picks).' },
  { id: 'hai', name: 'Hai Robotics', hq: 'China', moduleId: 'mobile-robots', revenue: 460, share: 6.6, growth: 28, note: 'ACR pioneer; Körber partnership materially strengthens European channel.' },
  { id: 'autostore', name: 'AutoStore', hq: 'Norway', moduleId: 'mobile-robots', revenue: 440, share: 6.3, growth: 9, note: 'Cube-storage incumbent defending density advantage with next-gen bot launch.' },
  { id: 'exotec', name: 'Exotec', hq: 'France', moduleId: 'mobile-robots', revenue: 390, share: 5.6, growth: 12, note: 'Skypod system strong in continental Europe grocery; large French win reverses quiet 2025.' },
  { id: 'quicktron', name: 'Quicktron', hq: 'China', moduleId: 'mobile-robots', revenue: 310, share: 4.4, growth: 17, note: 'Alibaba-linked; aggressive pricing in export markets.' },
  { id: 'fetch-zebra', name: 'Zebra (Fetch)', hq: 'United States', moduleId: 'mobile-robots', revenue: 260, share: 3.7, growth: 14, note: 'AMR line integrated with data-capture portfolio; vision-AI acquisition deepens software stack.' },
  { id: 'otto', name: 'OTTO by Rockwell', hq: 'Canada', moduleId: 'mobile-robots', revenue: 230, share: 3.3, growth: 19, note: 'Manufacturing-focused AMRs benefiting from Rockwell channel reach.' },
  { id: 'mir', name: 'MiR (Teradyne)', hq: 'Denmark', moduleId: 'mobile-robots', revenue: 210, share: 3.0, growth: 7, note: 'Strong in manufacturing intralogistics; VDA 5050 compliance an early differentiator.' },
  { id: 'agilox', name: 'AGILOX', hq: 'Austria', moduleId: 'mobile-robots', revenue: 150, share: 2.1, growth: 26, note: 'Swarm-intelligence AGVs; rapid growth from a small base in EMEA manufacturing.' },

  // Warehouse Automation integrators (2025 revenue, $M)
  { id: 'dematic', name: 'Dematic (KION)', hq: 'Germany / US', moduleId: 'warehouse-automation', revenue: 3950, share: 11.0, growth: 6, note: 'Leading global integrator; strongest software momentum in our WES/WCS benchmarking.' },
  { id: 'daifuku', name: 'Daifuku', hq: 'Japan', moduleId: 'warehouse-automation', revenue: 3800, share: 10.6, growth: 8, note: 'Global #1 by total material handling revenue; airport automation a growing diversification stream.' },
  { id: 'honeywell-int', name: 'Honeywell Intelligrated', hq: 'United States', moduleId: 'warehouse-automation', revenue: 2900, share: 8.1, growth: 4, note: 'North America heavyweight; pivoting from mega-greenfield to brownfield and services.' },
  { id: 'vanderlande', name: 'Vanderlande (Toyota)', hq: 'Netherlands', moduleId: 'warehouse-automation', revenue: 2750, share: 7.7, growth: 5, note: 'Parcel and airport leader; Toyota automation reorganisation aims to unlock integration synergies.' },
  { id: 'ssi', name: 'SSI Schaefer', hq: 'Germany', moduleId: 'warehouse-automation', revenue: 2400, share: 6.7, growth: 3, note: 'Broad portfolio across racking to robotics; margin recovery programme ongoing.' },
  { id: 'knapp', name: 'Knapp', hq: 'Austria', moduleId: 'warehouse-automation', revenue: 2250, share: 6.3, growth: 9, note: 'Healthcare and fashion strength; top-tier software attach rates.' },
  { id: 'swisslog', name: 'Swisslog (KUKA)', hq: 'Switzerland', moduleId: 'warehouse-automation', revenue: 1900, share: 5.3, growth: 5, note: 'ASRS and AutoStore mega-partner; strong pharma vertical.' },
  { id: 'tgw', name: 'TGW Logistics', hq: 'Austria', moduleId: 'warehouse-automation', revenue: 1450, share: 4.0, growth: 7, note: 'Foundation-owned; fashion and grocery shuttle specialist.' },
  { id: 'murata', name: 'Murata Machinery', hq: 'Japan', moduleId: 'warehouse-automation', revenue: 1300, share: 3.6, growth: 4, note: 'ASRS strength in APAC manufacturing and semiconductor logistics.' },
  { id: 'bastian', name: 'Bastian Solutions (Toyota)', hq: 'United States', moduleId: 'warehouse-automation', revenue: 1100, share: 3.1, growth: 6, note: 'US systems integrator; part of consolidated Toyota automation structure.' },

  // LV Motors (2025 revenue, $M)
  { id: 'abb-m', name: 'ABB', hq: 'Switzerland', moduleId: 'lv-motors', revenue: 2950, share: 15.1, growth: 5, note: 'Premium-efficiency leader; September EMEA price increase tests market pricing power.' },
  { id: 'weg', name: 'WEG', hq: 'Brazil', moduleId: 'lv-motors', revenue: 2600, share: 13.3, growth: 11, note: 'Share gainer; new Monterrey capacity targets US IE4 demand while rivals raise prices.' },
  { id: 'siemens-m', name: 'Siemens', hq: 'Germany', moduleId: 'lv-motors', revenue: 2300, share: 11.8, growth: 4, note: 'Strength in integrated motor-drive packages; well positioned for DOE 2028 rule.' },
  { id: 'nidec-m', name: 'Nidec', hq: 'Japan', moduleId: 'lv-motors', revenue: 1700, share: 8.7, growth: -2, note: 'Restructuring commercial/industrial division; exiting low-margin fractional lines.' },
  { id: 'regal', name: 'Regal Rexnord', hq: 'United States', moduleId: 'lv-motors', revenue: 1650, share: 8.4, growth: 2, note: 'Americas distribution strength; portfolio simplification continuing.' },
  { id: 'wolong', name: 'Wolong', hq: 'China', moduleId: 'lv-motors', revenue: 1350, share: 6.9, growth: 9, note: 'Largest Chinese player; IE4 platform investment paying off under tighter enforcement.' },
  { id: 'teco', name: 'TECO', hq: 'Taiwan', moduleId: 'lv-motors', revenue: 900, share: 4.6, growth: 6, note: 'APAC strength with growing North American project wins.' },
  { id: 'yaskawa-m', name: 'Yaskawa', hq: 'Japan', moduleId: 'lv-motors', revenue: 700, share: 3.6, growth: 3, note: 'Motion-centric portfolio; motors sold largely with drive packages.' },
]

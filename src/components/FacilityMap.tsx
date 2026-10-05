import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { Facility } from '../data/benchmarking'

export interface MapPoint extends Facility {
  company: string
  color: string
}

/** World map plotting each facility, coloured by company. */
export default function FacilityMap({ points }: { points: MapPoint[] }) {
  const valid = points.filter(
    (p) => typeof p.latitude === 'number' && typeof p.longitude === 'number',
  )

  // Centre on the mean of the plotted points (falls back to a world view).
  const center: [number, number] = valid.length
    ? [
        valid.reduce((s, p) => s + (p.latitude as number), 0) / valid.length,
        valid.reduce((s, p) => s + (p.longitude as number), 0) / valid.length,
      ]
    : [25, 10]
  const zoom = valid.length === 0 ? 2 : valid.length === 1 ? 5 : 2

  return (
    <div
      style={{
        height: 420,
        borderRadius: 10,
        overflow: 'hidden',
        border: '1px solid var(--border)',
      }}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
        worldCopyJump
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {valid.map((p, i) => (
          <CircleMarker
            key={`${p.company}-${i}`}
            center={[p.latitude as number, p.longitude as number]}
            radius={7}
            pathOptions={{ color: '#ffffff', weight: 1.5, fillColor: p.color, fillOpacity: 0.9 }}
          >
            <Tooltip>
              <div style={{ fontWeight: 700 }}>{p.company}</div>
              {p.entity && p.entity !== p.company && (
                <div style={{ fontSize: 11, opacity: 0.8 }}>{p.entity}</div>
              )}
              <div>{p.location}</div>
              {p.products && <div style={{ marginTop: 3 }}>{p.products}</div>}
              {p.sizeSqm ? <div>{p.sizeSqm.toLocaleString()} m²</div> : null}
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}

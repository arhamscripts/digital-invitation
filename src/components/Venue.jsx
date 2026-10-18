import { useState } from 'react'
import { invite } from '../config'
import { fmt, mapsEmbed, mapsLink } from '../utils'
import { Corner, Divider, Icon } from './Ornaments'
import { Reveal, Section } from './Section'
import CalendarButton from './CalendarButton'

export default function Venue() {
  const { ceremony } = invite
  const [showMap, setShowMap] = useState(false)

  return (
    <Section id="venue" className="venue-section">
      <Reveal className="venue-card">
        <Corner className="c-tl" />
        <Corner className="c-tr" />
        <Corner className="c-bl" />
        <Corner className="c-br" />
        <p className="eyebrow gold">The venue</p>
        <Divider className="gold" />
        <h3 className="script-title light">{ceremony.venue}</h3>
        <p className="venue-addr">{ceremony.address}</p>
        <p className="venue-when">
          <Icon name="clock" size={16} /> {fmt.weekday(ceremony.start)}, {fmt.shortDate(ceremony.start)} · {fmt.time(ceremony.start)}
        </p>

        <div className="map-wrap">
          {showMap ? (
            <iframe
              title={`Map of ${ceremony.venue}`}
              src={mapsEmbed(ceremony.mapQuery)}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <button className="map-reveal" onClick={() => setShowMap(true)}>
              <Icon name="pin" size={26} />
              <span>Show map</span>
            </button>
          )}
        </div>

        <div className="btn-row">
          <a className="btn gold" href={mapsLink(ceremony.mapQuery)} target="_blank" rel="noreferrer">
            <Icon name="pin" size={16} /> Get directions
          </a>
          <CalendarButton event={ceremony} variant="gold" />
        </div>
      </Reveal>
    </Section>
  )
}

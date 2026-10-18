import { useEffect, useRef, useState } from 'react'
import { invite } from '../config'
import { fmt, mapsLink } from '../utils'
import { Corner, Icon } from './Ornaments'
import { Reveal, Section } from './Section'
import CalendarButton from './CalendarButton'

export default function Events() {
  const trackRef = useRef(null)
  const [active, setActive] = useState(0)
  const events = invite.events

  // On phones the cards sit in a swipeable row so the section fits one screen.
  useEffect(() => {
    const track = trackRef.current
    const onScroll = () => {
      const card = track.querySelector('.event-card')
      if (!card) return
      const step = card.getBoundingClientRect().width + 14
      setActive(Math.min(events.length - 1, Math.round(track.scrollLeft / step)))
    }
    track.addEventListener('scroll', onScroll, { passive: true })
    return () => track.removeEventListener('scroll', onScroll)
  }, [events.length])

  const go = (i) => {
    const track = trackRef.current
    const card = track.querySelectorAll('.event-card')[i]
    if (card) track.scrollTo({ left: card.offsetLeft - track.offsetLeft - (track.clientWidth - card.clientWidth) / 2, behavior: 'smooth' })
  }

  return (
    <Section id="events" eyebrow="The festivities" title="Days filled with joy">
      <div className="events" ref={trackRef}>
        {events.map((ev, i) => (
          <Reveal as="article" key={ev.title} className={`event-card paper-card ${i === active ? 'is-active' : ''}`} delay={i * 120}>
            <Corner className="c-tl" />
            <Corner className="c-br" />
            <span className="event-icon">
              <Icon name={ev.icon} size={26} />
            </span>
            <h3>{ev.title}</h3>
            <p className="event-when">
              {fmt.weekday(ev.start)}, {fmt.shortDate(ev.start)} <i>✦</i> {fmt.time(ev.start)}
            </p>
            {ev.note && <p className="event-note">{ev.note}</p>}
            <p className="event-venue">
              <Icon name="pin" size={15} /> {ev.venue}
            </p>
            <div className="btn-row">
              <a className="btn" href={mapsLink(ev.mapQuery || ev.venue)} target="_blank" rel="noreferrer">
                Directions
              </a>
              <CalendarButton event={ev} />
            </div>
          </Reveal>
        ))}
      </div>
      <div className="story-dots events-dots" role="tablist" aria-label="Events">
        {events.map((ev, i) => (
          <button
            key={ev.title}
            role="tab"
            aria-selected={i === active}
            aria-label={ev.title}
            className={i === active ? 'is-active' : ''}
            onClick={() => go(i)}
          />
        ))}
      </div>
      <p className="swipe-hint">Swipe to see all {events.length} events</p>
    </Section>
  )
}

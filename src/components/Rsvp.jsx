import { useState } from 'react'
import { invite } from '../config'
import { guestName } from '../utils'
import { Icon } from './Ornaments'
import { Reveal, Section } from './Section'

const allEvents = [...invite.events, invite.ceremony].sort((a, b) => new Date(a.start) - new Date(b.start))

export default function Rsvp() {
  const [name, setName] = useState(guestName())
  const [attending, setAttending] = useState('yes')
  const [guests, setGuests] = useState(1)
  const [picked, setPicked] = useState(() => allEvents.map((e) => e.title))
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  if (!invite.rsvp.whatsapp) return null

  const toggle = (t) => setPicked((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]))

  const submit = (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Please tell us your name')
      return
    }
    const couple = `${invite.bride.first} & ${invite.groom.first}`
    const lines = [
      `Assalamu Alaikum! RSVP for ${couple}’s wedding 💍`,
      ``,
      `Name: ${name.trim()}`,
      attending === 'yes'
        ? `Attending: Yes, in sha Allah 🤍\nGuests: ${guests}\nEvents: ${picked.join(', ') || '—'}`
        : `Attending: Sadly can’t make it`,
    ]
    if (note.trim()) lines.push(`Message: ${note.trim()}`)
    const url = `https://wa.me/${invite.rsvp.whatsapp}?text=${encodeURIComponent(lines.join('\n'))}`
    window.open(url, '_blank', 'noopener')
  }

  return (
    <Section id="rsvp" tone="blush" eyebrow="Kindly reply" title="Will you join us?">
      <Reveal as="form" className="rsvp paper-card" onSubmit={submit} noValidate>
        <label className="field">
          <span>Your name</span>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setError('')
            }}
            placeholder="e.g. The Khan Family"
            autoComplete="name"
            aria-invalid={!!error}
          />
          {error && <em className="field-error">{error}</em>}
        </label>

        <div className="field">
          <span>Will you attend?</span>
          <div className="segmented" role="radiogroup">
            {[
              ['yes', 'Joyfully accept'],
              ['no', 'Regretfully decline'],
            ].map(([v, label]) => (
              <button
                type="button"
                key={v}
                role="radio"
                aria-checked={attending === v}
                className={attending === v ? 'is-on' : ''}
                onClick={() => setAttending(v)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {attending === 'yes' && (
          <>
            <div className="field field-inline">
              <span>Number of guests</span>
              <div className="stepper">
                <button type="button" aria-label="Fewer guests" onClick={() => setGuests((g) => Math.max(1, g - 1))}>
                  −
                </button>
                <output aria-live="polite">{guests}</output>
                <button type="button" aria-label="More guests" onClick={() => setGuests((g) => Math.min(20, g + 1))}>
                  +
                </button>
              </div>
            </div>

            <div className="field">
              <span>Which events?</span>
              <div className="chips">
                {allEvents.map((ev) => (
                  <button
                    type="button"
                    key={ev.title}
                    aria-pressed={picked.includes(ev.title)}
                    className={picked.includes(ev.title) ? 'is-on' : ''}
                    onClick={() => toggle(ev.title)}
                  >
                    {ev.title}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <label className="field">
          <span>A note for the couple (optional)</span>
          <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Your duas and wishes…" />
        </label>

        <button className="btn solid" type="submit">
          <Icon name="chat" size={18} /> Send RSVP on WhatsApp
        </button>
        <p className="rsvp-deadline">{invite.rsvp.deadline}</p>
      </Reveal>
    </Section>
  )
}

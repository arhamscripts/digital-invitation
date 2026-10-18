import { useEffect, useState } from 'react'
import { invite } from '../config'
import { Section, Reveal } from './Section'

function useNow() {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

function Unit({ value, label }) {
  const v = String(value).padStart(2, '0')
  return (
    <div className="cd-unit">
      <div className="cd-num">
        <span key={v} className="cd-digits">
          {v}
        </span>
      </div>
      <span className="cd-label">{label}</span>
    </div>
  )
}

export default function Countdown() {
  const now = useNow()
  const target = new Date(invite.ceremony.start).getTime()
  const end = target + invite.ceremony.durationHours * 3600_000
  const diff = Math.max(0, target - now)

  const days = Math.floor(diff / 86_400_000)
  const hours = Math.floor((diff / 3_600_000) % 24)
  const minutes = Math.floor((diff / 60_000) % 60)
  const seconds = Math.floor((diff / 1000) % 60)

  let state = 'before'
  if (now >= target && now < end) state = 'live'
  else if (now >= end) state = 'after'

  const marriedDays = Math.floor((now - target) / 86_400_000)

  return (
    <Section id="countdown" tone="velvet" eyebrow="Until we say Qubool Hai" title="Counting every heartbeat">
      {state === 'before' ? (
        <Reveal className="countdown" role="timer" aria-label={`${days} days ${hours} hours ${minutes} minutes remaining`}>
          <Unit value={days} label="Days" />
          <Unit value={hours} label="Hours" />
          <Unit value={minutes} label="Minutes" />
          <Unit value={seconds} label="Seconds" />
        </Reveal>
      ) : (
        <Reveal className="cd-done">
          <p className="script-title light">{state === 'live' ? 'It’s happening now!' : 'Alhamdulillah'}</p>
          <p className="lead light">
            {state === 'live'
              ? 'The Nikah is underway — make dua for the couple.'
              : `${invite.bride.first} & ${invite.groom.first} have been married for ${marriedDays} ${marriedDays === 1 ? 'day' : 'days'}.`}
          </p>
        </Reveal>
      )}
    </Section>
  )
}

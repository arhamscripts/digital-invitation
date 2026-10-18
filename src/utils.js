import { invite } from './config'

const tz = invite.timeZone

export const fmt = {
  longDate: (iso) =>
    new Date(iso).toLocaleDateString('en-US', { timeZone: tz, month: 'long', day: 'numeric', year: 'numeric' }),
  shortDate: (iso) =>
    new Date(iso).toLocaleDateString('en-US', { timeZone: tz, month: 'long', day: 'numeric' }),
  weekday: (iso) => new Date(iso).toLocaleDateString('en-US', { timeZone: tz, weekday: 'long' }),
  time: (iso) =>
    new Date(iso).toLocaleTimeString('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit' }),
}

export const mapsLink = (query) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`

export const mapsEmbed = (query) =>
  `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`

const coupleTitle = `${invite.bride.first} & ${invite.groom.first}`

// 20261220T133000Z
const toCalStamp = (date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

function eventRange(ev) {
  const start = new Date(ev.start)
  const end = new Date(start.getTime() + (ev.durationHours ?? 3) * 3600_000)
  return { start, end }
}

export function googleCalendarLink(ev) {
  const { start, end } = eventRange(ev)
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${ev.title} · ${coupleTitle}`,
    dates: `${toCalStamp(start)}/${toCalStamp(end)}`,
    details: `You're invited to the ${ev.title} of ${coupleTitle}.`,
    location: ev.mapQuery || ev.venue,
  })
  return `https://calendar.google.com/calendar/render?${params}`
}

export function downloadIcs(ev) {
  const { start, end } = eventRange(ev)
  const esc = (s) => String(s).replace(/([,;\\])/g, '\\$1')
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Wedding Invitation//EN',
    'BEGIN:VEVENT',
    `UID:${toCalStamp(start)}-${ev.title.replace(/\W/g, '')}@invite`,
    `DTSTAMP:${toCalStamp(new Date())}`,
    `DTSTART:${toCalStamp(start)}`,
    `DTEND:${toCalStamp(end)}`,
    `SUMMARY:${esc(`${ev.title} · ${coupleTitle}`)}`,
    `LOCATION:${esc(ev.venue + (ev.address ? `, ${ev.address}` : ''))}`,
    `DESCRIPTION:${esc(`You're invited to the ${ev.title} of ${coupleTitle}.`)}`,
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }))
  const a = Object.assign(document.createElement('a'), {
    href: url,
    download: `${ev.title.replace(/\s+/g, '-')}.ics`,
  })
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// Personalised links: ?to=The%20Khan%20Family
export function guestName() {
  const raw = new URLSearchParams(window.location.search).get('to')
  return raw ? raw.trim().slice(0, 60) : ''
}

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

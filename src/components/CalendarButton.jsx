import { useEffect, useRef, useState } from 'react'
import { downloadIcs, googleCalendarLink } from '../utils'
import { Icon } from './Ornaments'

export default function CalendarButton({ event, variant = '' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const close = (e) => !ref.current?.contains(e.target) && setOpen(false)
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [open])

  return (
    <div className="cal" ref={ref}>
      <button className={`btn ${variant}`} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <Icon name="calendar" size={16} /> Add to calendar
      </button>
      {open && (
        <div className="cal-menu" role="menu">
          <a role="menuitem" href={googleCalendarLink(event)} target="_blank" rel="noreferrer" onClick={() => setOpen(false)}>
            Google Calendar
          </a>
          <button
            role="menuitem"
            onClick={() => {
              downloadIcs(event)
              setOpen(false)
            }}
          >
            Apple / Outlook (.ics)
          </button>
        </div>
      )}
    </div>
  )
}

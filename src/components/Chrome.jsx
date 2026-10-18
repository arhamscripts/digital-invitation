import { useEffect, useRef, useState } from 'react'
import { invite } from '../config'
import { Icon } from './Ornaments'

// Floating music toggle. Hides itself if /music.mp3 is missing.
export function MusicToggle({ start }) {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [available, setAvailable] = useState(true)

  useEffect(() => {
    if (!start || !available) return
    const a = audioRef.current
    a.volume = 0.5
    a.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
  }, [start, available])

  // pause when the tab is hidden
  useEffect(() => {
    const onVis = () => document.hidden && audioRef.current?.pause()
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  if (!invite.music || !available) return null

  const toggle = () => {
    const a = audioRef.current
    if (a.paused) a.play().then(() => setPlaying(true)).catch(() => {})
    else {
      a.pause()
      setPlaying(false)
    }
  }

  return (
    <>
      <audio ref={audioRef} src={invite.music} loop preload="auto" onError={() => setAvailable(false)} onPause={() => setPlaying(false)} />
      <button
        className={`music-btn ${playing ? 'is-playing' : ''} ${start ? 'is-shown' : ''}`}
        onClick={toggle}
        aria-label={playing ? 'Pause music' : 'Play music'}
      >
        <span className="bars" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>
      </button>
    </>
  )
}

const links = [
  { href: '#home', icon: 'home', label: 'Home' },
  { href: '#date', icon: 'calendar', label: 'Date' },
  { href: '#program', icon: 'list', label: 'Program' },
  { href: '#venue', icon: 'pin', label: 'Venue' },
  { href: '#rsvp', icon: 'heart', label: 'RSVP' },
]

// Bottom navigation dock that appears after scrolling past the hero.
export function Dock() {
  const [shown, setShown] = useState(false)
  const [active, setActive] = useState('#home')
  const items = invite.rsvp.whatsapp ? links : links.filter((l) => l.href !== '#rsvp')

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > window.innerHeight * 0.6)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setActive(`#${e.target.id}`))
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    items.forEach((l) => {
      const el = document.querySelector(l.href)
      if (el) io.observe(el)
    })
    return () => {
      window.removeEventListener('scroll', onScroll)
      io.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <nav className={`dock ${shown ? 'is-shown' : ''}`} aria-label="Sections">
      {items.map((l) => (
        <a key={l.href} href={l.href} className={active === l.href ? 'is-active' : ''}>
          <Icon name={l.icon} size={18} />
          <span>{l.label}</span>
        </a>
      ))}
    </nav>
  )
}

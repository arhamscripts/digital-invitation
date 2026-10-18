import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { invite } from '../config'
import { Icon } from './Ornaments'
import { Section } from './Section'

function Placeholder({ index }) {
  return (
    <div className="photo-placeholder" aria-hidden="true">
      <span className="foil-orn divider" />
      <span className="ph-num foil-text">{String(index + 1).padStart(2, '0')}</span>
      <span className="ph-hint">Photo coming soon</span>
    </div>
  )
}

export default function Story() {
  const items = invite.story
  const trackRef = useRef(null)
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    const track = trackRef.current
    const onScroll = () => {
      const slide = track.firstElementChild
      if (!slide) return
      const step = slide.getBoundingClientRect().width + 16
      setActive(Math.round(track.scrollLeft / step))
    }
    track.addEventListener('scroll', onScroll, { passive: true })
    return () => track.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (lightbox === null) return
    const onKey = (e) => {
      if (e.key === 'Escape') setLightbox(null)
      if (e.key === 'ArrowRight') setLightbox((i) => (i + 1) % items.length)
      if (e.key === 'ArrowLeft') setLightbox((i) => (i - 1 + items.length) % items.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox, items.length])

  const go = (i) => {
    const track = trackRef.current
    const slide = track.children[i]
    if (slide) track.scrollTo({ left: slide.offsetLeft - track.offsetLeft - (track.clientWidth - slide.clientWidth) / 2, behavior: 'smooth' })
  }

  return (
    <Section id="story" eyebrow="Our story" title="Moments, softly held">
      <div className="story-track" ref={trackRef}>
        {items.map((it, i) => (
          <figure key={i} className={`story-slide ${i === active ? 'is-active' : ''}`}>
            <button
              className="story-photo"
              onClick={() => it.src && setLightbox(i)}
              aria-label={it.src ? `Open photo: ${it.caption}` : it.caption}
              tabIndex={it.src ? 0 : -1}
            >
              {it.src ? <img src={it.src} alt={it.caption} loading="lazy" /> : <Placeholder index={i} />}
            </button>
            <figcaption>
              <span className="story-date">{it.date}</span>
              {it.caption}
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="story-dots" role="tablist" aria-label="Story photos">
        {items.map((_, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === active}
            aria-label={`Photo ${i + 1}`}
            className={i === active ? 'is-active' : ''}
            onClick={() => go(i)}
          />
        ))}
      </div>

      {lightbox !== null &&
        createPortal(
        <div className="lightbox" role="dialog" aria-modal="true" onClick={() => setLightbox(null)}>
          <button className="lb-btn lb-close" aria-label="Close" onClick={() => setLightbox(null)}>
            <Icon name="close" />
          </button>
          <button
            className="lb-btn lb-prev"
            aria-label="Previous"
            onClick={(e) => {
              e.stopPropagation()
              setLightbox((i) => (i - 1 + items.length) % items.length)
            }}
          >
            <Icon name="arrowL" />
          </button>
          <figure onClick={(e) => e.stopPropagation()}>
            {items[lightbox].src ? (
              <img src={items[lightbox].src} alt={items[lightbox].caption} />
            ) : (
              <Placeholder index={lightbox} />
            )}
            <figcaption>{items[lightbox].caption}</figcaption>
          </figure>
          <button
            className="lb-btn lb-next"
            aria-label="Next"
            onClick={(e) => {
              e.stopPropagation()
              setLightbox((i) => (i + 1) % items.length)
            }}
          >
            <Icon name="arrowR" />
          </button>
        </div>,
          document.body,
        )}
    </Section>
  )
}

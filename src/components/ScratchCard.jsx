import { useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import { invite } from '../config'
import { fmt, prefersReducedMotion } from '../utils'
import { Corner } from './Ornaments'
import { Section } from './Section'

const REVEAL_AT = 0.45

const foilImg = typeof Image !== 'undefined' ? new Image() : null
if (foilImg) foilImg.src = '/assets/gold-foil.jpg'

function paintFoil(ctx, w, h) {
  // real gold-leaf texture, cropped to cover
  if (foilImg?.complete && foilImg.naturalWidth) {
    const s = Math.max(w, h) / foilImg.naturalWidth
    ctx.drawImage(foilImg, (w - foilImg.naturalWidth * s) / 2, (h - foilImg.naturalHeight * s) / 2, foilImg.naturalWidth * s, foilImg.naturalHeight * s)
  } else {
    ctx.fillStyle = '#c99a4b'
    ctx.fillRect(0, 0, w, h)
  }
  // soft diagonal sheen
  const g = ctx.createLinearGradient(0, 0, w, h)
  g.addColorStop(0, 'rgba(255,240,200,0)')
  g.addColorStop(0.45, 'rgba(255,240,200,.28)')
  g.addColorStop(0.55, 'rgba(255,240,200,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
  // debossed inner frame
  ctx.lineWidth = 1
  ctx.strokeStyle = 'rgba(80,50,10,.45)'
  ctx.strokeRect(12.5, 12.5, w - 25, h - 25)
  ctx.strokeStyle = 'rgba(255,245,215,.5)'
  ctx.strokeRect(13.5, 13.5, w - 25, h - 25)
  // stamped lettering: dark cut + light lower edge
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const stamp = (text, font, y) => {
    ctx.font = font
    ctx.fillStyle = 'rgba(255,240,205,.55)'
    ctx.fillText(text, w / 2, y + 1.2)
    ctx.fillStyle = 'rgba(70,40,8,.78)'
    ctx.fillText(text, w / 2, y)
  }
  stamp('Scratch here', `${Math.round(h * 0.17)}px "Great Vibes", cursive`, h / 2 - h * 0.05)
  stamp('✦  TO REVEAL THE DATE  ✦', `600 ${Math.max(10, Math.round(h * 0.052))}px "Cinzel", serif`, h / 2 + h * 0.17)
}

function burst() {
  if (prefersReducedMotion()) return
  const colors = ['#c99a4b', '#f3d391', '#e9c77d', '#9b1b2a', '#fbf5ec']
  const defaults = { colors, ticks: 220, gravity: 0.9, scalar: 0.9, disableForReducedMotion: true }
  confetti({ ...defaults, particleCount: 90, spread: 75, origin: { y: 0.6 } })
  setTimeout(() => confetti({ ...defaults, particleCount: 50, angle: 60, spread: 60, origin: { x: 0, y: 0.7 } }), 180)
  setTimeout(() => confetti({ ...defaults, particleCount: 50, angle: 120, spread: 60, origin: { x: 1, y: 0.7 } }), 180)
}

export default function ScratchCard() {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const [revealed, setRevealed] = useState(false)
  const [progress, setProgress] = useState(0)
  const { ceremony } = invite

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let drawing = false
    let last = null
    let moves = 0
    let done = false

    const setup = () => {
      const { width, height } = wrap.getBoundingClientRect()
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.globalCompositeOperation = 'source-over'
      paintFoil(ctx, width, height)
    }
    // repaint once the script font has loaded so the text uses it
    setup()
    document.fonts?.ready.then(() => !done && setup())
    foilImg?.addEventListener('load', () => !done && setup(), { once: true })

    const measure = () => {
      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)
      let clear = 0
      let total = 0
      for (let i = 3; i < data.length; i += 4 * 24) {
        total++
        if (data[i] < 40) clear++
      }
      const p = clear / total
      setProgress(p)
      if (p > REVEAL_AT && !done) {
        done = true
        setRevealed(true)
        burst()
      }
    }

    const pos = (e) => {
      const r = canvas.getBoundingClientRect()
      return { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const scratch = (from, to) => {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 42
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(from.x, from.y)
      ctx.lineTo(to.x, to.y)
      ctx.stroke()
    }
    const down = (e) => {
      drawing = true
      canvas.setPointerCapture(e.pointerId)
      last = pos(e)
      scratch(last, { x: last.x + 0.1, y: last.y })
    }
    const move = (e) => {
      if (!drawing) return
      const p = pos(e)
      scratch(last, p)
      last = p
      if (++moves % 12 === 0) measure()
    }
    const up = () => {
      if (!drawing) return
      drawing = false
      measure()
    }

    canvas.addEventListener('pointerdown', down)
    canvas.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    canvas.addEventListener('pointercancel', up)
    return () => {
      canvas.removeEventListener('pointerdown', down)
      canvas.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      canvas.removeEventListener('pointercancel', up)
    }
  }, [])

  const revealNow = () => {
    if (revealed) return
    setRevealed(true)
    burst()
  }

  return (
    <Section id="date" eyebrow="A date to hold close" title="Scratch to Reveal">
      <div className="scratch-frame">
        <Corner className="c-tl" />
        <Corner className="c-tr" />
        <Corner className="c-bl" />
        <Corner className="c-br" />
        <div ref={wrapRef} className={`scratch ${revealed ? 'is-revealed' : ''}`}>
          <div className="scratch-under" aria-live="polite">
            <p className="eyebrow">You’re invited!</p>
            <p className="scratch-date">{fmt.longDate(ceremony.start)}</p>
            <p className="scratch-time">
              {fmt.weekday(ceremony.start)} <i>✦</i> {fmt.time(ceremony.start)}
            </p>
            <p className="scratch-venue">{ceremony.venue}</p>
          </div>
          <canvas ref={canvasRef} className="scratch-foil" aria-label="Scratch card covering the wedding date" />
        </div>
      </div>
      <p className="scratch-hint">
        {revealed ? (
          'Save the date — we’d love to see you there.'
        ) : (
          <>
            {progress > 0.05 ? 'Keep going…' : 'Use your finger to scratch the gold foil'}
            <button className="link-btn" onClick={revealNow}>
              or tap to reveal
            </button>
          </>
        )}
      </p>
    </Section>
  )
}

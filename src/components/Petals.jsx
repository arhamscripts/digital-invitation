import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../utils'

// Falling rose petals + drifting gold sparkles on a canvas.
// Pauses itself when scrolled out of view.
export default function Petals({ petals = 18, sparkles = 40, className = '' }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let w = 0
    let h = 0
    let raf = 0
    let running = false
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    const rand = (a, b) => a + Math.random() * (b - a)
    const hues = ['#b0283a', '#9b1b2a', '#c9374a', '#7a1220', '#d65a6a']
    const makePetal = (initial) => ({
      x: rand(0, w),
      y: initial ? rand(-h, h) : rand(-60, -20),
      s: rand(7, 14),
      vy: rand(0.35, 0.9),
      sway: rand(0.4, 1.2),
      phase: rand(0, Math.PI * 2),
      rot: rand(0, Math.PI * 2),
      vr: rand(-0.02, 0.02),
      flip: rand(0, Math.PI * 2),
      color: hues[(Math.random() * hues.length) | 0],
    })
    const makeSpark = () => ({
      x: rand(0, w),
      y: rand(0, h),
      r: rand(0.6, 1.8),
      vy: rand(-0.25, -0.05),
      t: rand(0, Math.PI * 2),
      vt: rand(0.01, 0.04),
    })
    const P = Array.from({ length: petals }, () => makePetal(true))
    const S = Array.from({ length: sparkles }, makeSpark)

    const drawPetal = (p) => {
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.scale(1, Math.abs(Math.cos(p.flip)) * 0.7 + 0.3)
      const g = ctx.createLinearGradient(-p.s, 0, p.s, 0)
      g.addColorStop(0, p.color)
      g.addColorStop(1, '#4a0d14')
      ctx.fillStyle = g
      ctx.globalAlpha = 0.85
      ctx.beginPath()
      ctx.moveTo(0, -p.s)
      ctx.bezierCurveTo(p.s, -p.s * 0.6, p.s * 0.8, p.s * 0.7, 0, p.s)
      ctx.bezierCurveTo(-p.s * 0.8, p.s * 0.7, -p.s, -p.s * 0.6, 0, -p.s)
      ctx.fill()
      ctx.restore()
    }

    const tick = () => {
      ctx.clearRect(0, 0, w, h)
      for (const s of S) {
        s.y += s.vy
        s.t += s.vt
        if (s.y < -5) Object.assign(s, makeSpark(), { y: h + 5 })
        ctx.globalAlpha = 0.35 + Math.sin(s.t) * 0.35
        ctx.fillStyle = '#f3d391'
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fill()
      }
      for (const p of P) {
        p.phase += 0.015
        p.y += p.vy
        p.x += Math.sin(p.phase) * p.sway
        p.rot += p.vr
        p.flip += 0.03
        if (p.y > h + 30) Object.assign(p, makePetal(false))
        drawPetal(p)
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(tick)
    }

    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !running) {
        running = true
        raf = requestAnimationFrame(tick)
      } else if (!e.isIntersecting && running) {
        running = false
        cancelAnimationFrame(raf)
      }
    })
    io.observe(canvas)
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      window.removeEventListener('resize', resize)
    }
  }, [petals, sparkles])

  return <canvas ref={canvasRef} className={`petals ${className}`} aria-hidden="true" />
}

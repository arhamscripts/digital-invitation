import { useLayoutEffect } from 'react'

// Height of the *small* viewport (browser toolbars visible), so a section
// never hides behind the address bar on phones.
let probe
function viewportHeight() {
  if (!probe) {
    probe = document.createElement('div')
    probe.style.cssText = 'position:fixed;top:0;left:0;width:0;height:100vh;height:100svh;visibility:hidden;pointer-events:none'
    document.body.appendChild(probe)
  }
  return Math.min(probe.offsetHeight || Infinity, window.innerHeight)
}

/**
 * Keeps a section's content inside one screen. The CSS already scales type and
 * spacing with screen height; on phones that are still too short, this shrinks
 * the content (CSS zoom, so layout reflows) just enough to fit.
 */
export function useFitToScreen(sectionRef, contentRef, { minScale = 0.7 } = {}) {
  useLayoutEffect(() => {
    const section = sectionRef.current
    const content = contentRef.current
    if (!section || !content) return
    let raf = 0
    let natural = 0

    const fit = () => {
      content.style.zoom = ''
      const cs = getComputedStyle(section)
      const available = viewportHeight() - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)
      natural = content.getBoundingClientRect().height
      if (natural <= available) return
      // Zoom keeps the visual width, so the inner layout gets a little wider and
      // can re-wrap; refine over a few passes until the content fits.
      let scale = Math.max(minScale, available / natural)
      for (let i = 0; i < 4; i++) {
        content.style.zoom = scale.toFixed(4)
        const h = content.getBoundingClientRect().height
        if (h <= available + 0.5 || scale <= minScale) break
        scale = Math.max(minScale, scale * (available / h) - 0.002)
      }
    }
    const schedule = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(fit)
    }

    fit()
    document.fonts?.ready.then(schedule)
    window.addEventListener('resize', schedule)
    window.addEventListener('orientationchange', schedule)
    // re-fit when the content itself changes height (e.g. RSVP fields toggling)
    const ro = new ResizeObserver(() => {
      const z = parseFloat(content.style.zoom) || 1
      const h = content.getBoundingClientRect().height / z
      if (Math.abs(h - natural) > 2) schedule()
    })
    ro.observe(content)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('resize', schedule)
      window.removeEventListener('orientationchange', schedule)
    }
  }, [sectionRef, contentRef, minScale])
}

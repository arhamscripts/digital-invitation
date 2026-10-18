import { useEffect, useRef, useState } from 'react'
import { Divider, Garland } from './Ornaments'
import { useFitToScreen } from '../useFit'

export function useInView(options = { threshold: 0.18 }) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true)
        io.disconnect()
      }
    }, options)
    io.observe(el)
    return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return [ref, inView]
}

export function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const [ref, inView] = useInView()
  return (
    <Tag
      ref={ref}
      className={`reveal ${inView ? 'is-in' : ''} ${className}`}
      style={{ '--delay': `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  )
}

export function Section({ id, tone = 'cream', eyebrow, title, garland = true, className = '', decor = null, children }) {
  const sectionRef = useRef(null)
  const fitRef = useRef(null)
  useFitToScreen(sectionRef, fitRef)
  return (
    <section id={id} ref={sectionRef} className={`section tone-${tone} ${className}`}>
      {decor}
      <div className="section-fit" ref={fitRef}>
      {garland && <Garland className="garland-top" />}
      <div className="section-inner">
        {(eyebrow || title) && (
          <Reveal className="section-heading">
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            {title && <h2 className="script-title">{title}</h2>}
            <Divider />
          </Reveal>
        )}
        {children}
      </div>
      </div>
    </section>
  )
}

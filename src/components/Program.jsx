import { invite } from '../config'
import { Icon } from './Ornaments'
import { Section, useInView } from './Section'

export default function Program() {
  const [ref, inView] = useInView({ threshold: 0.25 })
  return (
    <Section id="program" eyebrow="The celebration" title="Our Nikah day">
      <ol ref={ref} className={`timeline ${inView ? 'is-in' : ''}`}>
        {invite.program.map((p, i) => (
          <li key={p.title} style={{ '--i': i }}>
            <span className="tl-time">{p.time}</span>
            <span className="tl-dot">
              <Icon name={p.icon} size={18} />
            </span>
            <span className="tl-body">
              <strong>{p.title}</strong>
              {p.note && <em>{p.note}</em>}
            </span>
          </li>
        ))}
      </ol>
    </Section>
  )
}

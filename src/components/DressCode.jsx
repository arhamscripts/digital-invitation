import { invite } from '../config'
import { Reveal, Section } from './Section'

export default function DressCode() {
  const { title, text, palette } = invite.dressCode
  return (
    <Section id="dress" tone="blush" eyebrow="Dress code" title={title}>
      <Reveal as="p" className="lead">
        {text}
      </Reveal>
      <Reveal className="palette" delay={150}>
        {palette.map((c, i) => (
          <figure key={c.hex} style={{ '--i': i }}>
            <span className="swatch" style={{ '--c': c.hex }} />
            <figcaption>{c.name}</figcaption>
          </figure>
        ))}
      </Reveal>
      <Reveal as="p" className="palette-note" delay={250}>
        A gentle palette to inspire you — not a rule.
      </Reveal>
    </Section>
  )
}

import { invite } from '../config'
import { fmt, guestName } from '../utils'
import { Arch, Icon } from './Ornaments'
import Petals from './Petals'
import { RoseCluster } from './Roses'
import { useRef } from 'react'
import { useFitToScreen } from '../useFit'

export default function Hero({ opened }) {
  const { bride, groom, ceremony } = invite
  const guest = guestName()
  const heroRef = useRef(null)
  const frameRef = useRef(null)
  useFitToScreen(heroRef, frameRef, { minScale: 0.62 })

  return (
    <header id="home" ref={heroRef} className={`hero ${opened ? 'is-open' : ''}`}>
      <div className="hero-bg" />
      <div className="light-rays" />
      <div className="hero-pelmet">
        <span className="valance-trim" />
        <span className="valance-fringe" />
      </div>
      <img className="drape drape-l" src="/assets/drape-left.webp" alt="" />
      <img className="drape drape-r" src="/assets/drape-right.webp" alt="" />
      <span className="candle candle-l" />
      <span className="candle candle-r" />
      <Petals petals={0} sparkles={45} />
      <RoseCluster side="left" />
      <RoseCluster side="right" />

      <div className="hero-frame" ref={frameRef}>
        <Arch />
        <div className="hero-content">
          <span className="arch-spacer" aria-hidden="true" />
          <p className="bismillah st" style={{ '--d': 1 }} lang="ar" dir="rtl">
            بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </p>
          <p className="bismillah-en st" style={{ '--d': 2 }}>In the name of Allah, the Most Gracious, the Most Merciful</p>

          {guest && <p className="hero-guest st" style={{ '--d': 3 }}>Dear {guest},</p>}
          <p className="eyebrow light st" style={{ '--d': 4 }}>We request the honour of your presence at the Nikah of</p>

          <h1 className="couple">
            <span className="person st" style={{ '--d': 5 }}>
              <span className="name foil-text">{bride.full}</span>
              <span className="parents">
                <small>{bride.relation}</small>
                {bride.parents}
              </span>
            </span>
            <span className="amp st" style={{ '--d': 6 }} aria-label="and">
              &amp;
            </span>
            <span className="person st" style={{ '--d': 7 }}>
              <span className="name foil-text">{groom.full}</span>
              <span className="parents">
                <small>{groom.relation}</small>
                {groom.parents}
              </span>
            </span>
          </h1>

          <p className="hero-date st" style={{ '--d': 8 }}>
            {fmt.weekday(ceremony.start)} <i>·</i> {fmt.longDate(ceremony.start)}
          </p>
          <p className="eyebrow light st" style={{ '--d': 9 }}>as they begin their forever in faith and love</p>
        </div>
      </div>

      <a href="#welcome" className="scroll-cue">
        <span>Scroll</span>
        <Icon name="chevron" size={18} />
      </a>
    </header>
  )
}

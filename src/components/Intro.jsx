import { useEffect, useState } from 'react'
import { invite } from '../config'
import { guestName } from '../utils'
import Petals from './Petals'
import { RoseCluster } from './Roses'

// The closed velvet curtain with a wax seal. Tapping parts the curtains.
export default function Intro({ onOpen }) {
  const [phase, setPhase] = useState('closed') // closed → opening → gone
  const guest = guestName()

  useEffect(() => {
    document.documentElement.classList.toggle('locked', phase !== 'gone')
  }, [phase])

  const open = () => {
    if (phase !== 'closed') return
    setPhase('opening')
    onOpen()
    setTimeout(() => setPhase('gone'), 2800)
  }

  if (phase === 'gone') return null

  return (
    <div className={`intro is-${phase}`} role="dialog" aria-modal="true" aria-label="Invitation cover">
      <div className="curtain curtain-l">
        <span className="hem" />
      </div>
      <div className="curtain curtain-r">
        <span className="hem" />
      </div>
      <div className="valance">
        <span className="valance-trim" />
        <span className="valance-fringe" />
      </div>
      <div className="stage-light" />
      <Petals petals={0} sparkles={36} className="intro-sparkles" />
      <RoseCluster side="left" />
      <RoseCluster side="right" />

      <div className="intro-center">
        <p className="intro-guest">
          <span>{guest ? 'Dear' : 'You are'}</span>
          <em className="foil-text">{guest || 'cordially invited'}</em>
        </p>
        <button className="seal-btn" onClick={open} autoFocus>
          <span className="seal-glow" />
          <span className="seal">
            <img src="/assets/wax-seal.webp" alt="" draggable="false" />
            <span className="seal-initials">
              {invite.bride.first[0]}
              <i>&amp;</i>
              {invite.groom.first[0]}
            </span>
          </span>
          <span className="tap-label">Tap to open</span>
        </button>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { invite } from '../config'
import { fmt } from '../utils'
import { Divider, Icon } from './Ornaments'
import { Reveal, Section } from './Section'
import { RoseCluster } from './Roses'

export default function Closing() {
  const { bride, groom, ceremony, closing, hashtag } = invite
  const [toast, setToast] = useState('')

  const share = async () => {
    const url = window.location.origin + window.location.pathname
    const data = {
      title: `${bride.first} & ${groom.first} — Wedding Invitation`,
      text: `You're invited to the Nikah of ${bride.first} & ${groom.first} on ${fmt.longDate(ceremony.start)}.`,
      url,
    }
    try {
      if (navigator.share) await navigator.share(data)
      else {
        await navigator.clipboard.writeText(url)
        setToast('Link copied')
        setTimeout(() => setToast(''), 2200)
      }
    } catch {
      /* user cancelled */
    }
  }

  return (
    <Section id="closing" tone="velvet" eyebrow="With all our hearts" title={closing.title} className="closing"
      decor={
        <>
          <RoseCluster side="left" className="roses-top" lazy />
          <RoseCluster side="right" className="roses-top" lazy />
        </>
      }
    >
      <Reveal as="p" className="lead light">
        {closing.text}
      </Reveal>
      <Reveal className="dua" delay={150}>
        <p lang="ar" dir="rtl">
          بَارَكَ ٱللَّٰهُ لَكُمَا وَبَارَكَ عَلَيْكُمَا وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ
        </p>
        <p className="dua-en">May Allah bless you both, shower His blessings upon you, and unite you in goodness.</p>
      </Reveal>
      <Reveal delay={250}>
        <p className="closing-names foil-text">
          {bride.first} <span>&amp;</span> {groom.first}
        </p>
        <Divider className="gold" />
        <p className="eyebrow gold">
          {fmt.longDate(ceremony.start)} · {ceremony.venue}
        </p>
        {hashtag && <p className="hashtag">{hashtag}</p>}
        <button className="btn gold" onClick={share}>
          <Icon name="share" size={16} /> Share the invitation
        </button>
      </Reveal>
      <p className="made-with">
        Made with love for {bride.first} &amp; {groom.first}
      </p>
      {createPortal(
        <div className={`toast ${toast ? 'is-on' : ''}`} role="status">
          {toast}
        </div>,
        document.body,
      )}
    </Section>
  )
}

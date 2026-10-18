import { useState } from 'react'
import { invite } from './config'
import Intro from './components/Intro'
import Hero from './components/Hero'
import { Reveal, Section } from './components/Section'
import ScratchCard from './components/ScratchCard'
import Story from './components/Story'
import Countdown from './components/Countdown'
import Program from './components/Program'
import Venue from './components/Venue'
import DressCode from './components/DressCode'
import Events from './components/Events'
import Rsvp from './components/Rsvp'
import Closing from './components/Closing'
import { Dock, MusicToggle } from './components/Chrome'
import { LaidRose } from './components/Roses'

function Welcome() {
  return (
    <Section id="welcome" title="A Blessed Beginning" garland={false}>
      <Reveal as="p" className="lead">
        {invite.welcome}
      </Reveal>
      <Reveal as="p" className="welcome-names" delay={150}>
        {invite.bride.first} <span>&amp;</span> {invite.groom.first}
      </Reveal>
      <Reveal delay={300}>
        <LaidRose />
      </Reveal>
    </Section>
  )
}

export default function App() {
  const [opened, setOpened] = useState(false)

  return (
    <>
      <Intro onOpen={() => setOpened(true)} />
      <MusicToggle start={opened} />
      <main>
        <Hero opened={opened} />
        <Welcome />
        <ScratchCard />
        <Story />
        <Countdown />
        <Program />
        <Venue />
        <DressCode />
        <Events />
        <Rsvp />
        <Closing />
      </main>
      <Dock />
    </>
  )
}

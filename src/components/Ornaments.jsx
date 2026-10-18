// Ornaments are SVG masks filled with a rendered gold-leaf texture,
// so they read as real foil rather than flat vector lines.

export function Divider({ className = '' }) {
  return <span className={`foil-orn divider ${className}`} aria-hidden="true" />
}

// Wide filigree band that separates sections.
export function Garland({ className = '' }) {
  return <span className={`foil-orn band ${className}`} aria-hidden="true" />
}

export function Corner({ className = '' }) {
  return <span className={`foil-orn corner ${className}`} aria-hidden="true" />
}

// Mughal-style ogee arch framing the hero. The cap keeps its shape;
// the straight sides stretch with the content.
export function Arch({ className = '' }) {
  return (
    <div className={`arch ${className}`} aria-hidden="true">
      <svg className="arch-fill" viewBox="0 0 320 190" preserveAspectRatio="none">
        <path d="M8 190 C8 138 40 114 90 94 C130 77 150 48 160 10 C170 48 190 77 230 94 C280 114 312 138 312 190 Z" />
      </svg>
      <span className="foil-orn arch-top" />
      <div className="arch-sides">
        <i />
      </div>
    </div>
  )
}

const paths = {
  door: (
    <>
      <path d="M6 21V10a6 6 0 0 1 12 0v11" />
      <path d="M3.5 21h17" />
      <circle cx="14.5" cy="15" r=".7" fill="currentColor" />
    </>
  ),
  rings: (
    <>
      <circle cx="9" cy="14.5" r="5" />
      <circle cx="15" cy="14.5" r="5" />
      <path d="M15 9.5 13 7l1-1.5h2L17 7z" />
    </>
  ),
  moon: (
    <>
      <path d="M14.5 3.5a8.5 8.5 0 1 0 6 13.2A7 7 0 1 1 14.5 3.5z" />
      <path d="m18 4 .7 1.6 1.7.2-1.3 1.1.4 1.7-1.5-.9-1.5.9.4-1.7-1.3-1.1 1.7-.2z" />
    </>
  ),
  dinner: (
    <>
      <path d="M2.5 18.5h19" />
      <path d="M4.5 18.5a7.5 7.5 0 0 1 15 0" />
      <path d="M12 11V8.5M10.3 8.5h3.4" />
    </>
  ),
  henna: (
    <>
      <circle cx="12" cy="12" r="2.4" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <path key={a} transform={`rotate(${a} 12 12)`} d="M12 9.2c-1.6-1.8-1.6-4.2 0-6 1.6 1.8 1.6 4.2 0 6z" />
      ))}
    </>
  ),
  music: (
    <>
      <path d="M9 18V5.5l11-2V16" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="17" cy="16" r="3" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  share: (
    <>
      <circle cx="18" cy="5" r="2.6" />
      <circle cx="6" cy="12" r="2.6" />
      <circle cx="18" cy="19" r="2.6" />
      <path d="m8.4 13.3 7.2 4.4M15.6 6.3 8.4 10.7" />
    </>
  ),
  chat: <path d="M20.5 12a8.5 8.5 0 0 1-12.6 7.4L3.5 20.5l1.2-4.1A8.5 8.5 0 1 1 20.5 12z" />,
  heart: <path d="M12 20s-7.5-4.6-7.5-10.2A4.2 4.2 0 0 1 12 7.3a4.2 4.2 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z" />,
  home: (
    <>
      <path d="M4 11 12 4l8 7" />
      <path d="M6 9.5V20h12V9.5" />
    </>
  ),
  list: <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />,
  chevron: <path d="m6 9 6 6 6-6" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  arrowL: <path d="m15 6-6 6 6 6" />,
  arrowR: <path d="m9 6 6 6-6 6" />,
}

export function Icon({ name, size = 20, className = '' }) {
  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] ?? paths.heart}
    </svg>
  )
}

// Real rose photos (Unsplash, see README credits), cut out to transparent sprites.

const base = '/assets/flowers'

// Three overlapping roses, used as a corner arrangement.
export function RoseCluster({ side = 'left', className = '', lazy = false }) {
  const loading = lazy ? 'lazy' : 'eager'
  return (
    <div className={`roses roses-${side} ${className}`} aria-hidden="true">
      <img className="r r3" src={`${base}/rose-c.webp`} alt="" loading={loading} />
      <img className="r r1" src={`${base}/rose-a.webp`} alt="" loading={loading} />
      <img className="r r2" src={`${base}/rose-b.webp`} alt="" loading={loading} />
    </div>
  )
}

// A single long-stem rose laid on the paper, with its own soft shadow.
export function LaidRose({ className = '' }) {
  return <img className={`laid-rose ${className}`} src={`${base}/rose-stem.webp`} alt="" aria-hidden="true" loading="lazy" />
}

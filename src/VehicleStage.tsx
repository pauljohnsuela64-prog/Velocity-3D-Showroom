import { useEffect, useRef, useState } from 'react'

const messages = {
  loading: 'Loading the 3D vehicle…',
  ready: '3D vehicle ready.',
  unsupported: 'WebGL is unavailable. Showing the studio image.',
  error: 'The 3D vehicle could not load. Showing the studio image.',
  lost: 'The graphics connection was interrupted. Showing the studio image.',
}

export type StageState = keyof typeof messages

export default function VehicleStage() {
  const mount = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<StageState>('loading')

  useEffect(() => {
    const host = mount.current
    if (!host) return
    const lifecycle = new AbortController()
    const start = async () => {
      try {
        const { mountStudio } = await import('./studio')
        if (!lifecycle.signal.aborted) await mountStudio(host, lifecycle.signal, setState)
      } catch {
        if (!lifecycle.signal.aborted) setState('error')
      }
    }
    let observer: IntersectionObserver | undefined
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(([entry]) => {
        if (entry?.isIntersecting) {
          observer?.disconnect()
          void start()
        }
      }, { rootMargin: '120px' })
      observer.observe(host)
    } else {
      void start()
    }
    return () => {
      observer?.disconnect()
      lifecycle.abort()
    }
  }, [])

  return (
    <figure>
      <div className="studio-stage" data-state={state}>
        <div className="studio-canvas" ref={mount} />
        {state !== 'ready' && state !== 'loading' && (
          <img className="studio-still" src="/models/vehicle.webp" alt="Three-quarter studio view of the vehicle" />
        )}
        <p role="status" className={state === 'ready' ? 'sr-only' : 'stage-status'}>{messages[state]}</p>
      </div>
      <figcaption><a className="stage-credit" href="/models/CREDITS.txt">Vehicle credits</a></figcaption>
    </figure>
  )
}

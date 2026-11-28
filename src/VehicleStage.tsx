import { useCallback, useEffect, useRef, useState } from 'react'

const messages = {
  loading: 'Loading the 3D vehicle…',
  revealing: 'Revealing the vehicle.',
  ready: '3D vehicle ready.',
  unsupported: 'WebGL is unavailable. Showing the studio image.',
  error: 'The 3D vehicle could not load. Showing the studio image.',
  lost: 'The graphics connection was interrupted. Showing the studio image.',
}

export type StageState = keyof typeof messages

export default function VehicleStage() {
  const [skip] = useState(() => new AbortController())
  const mount = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<StageState>('loading')
  const skipButton = useRef<HTMLButtonElement>(null)
  const report = useCallback((next: StageState) => {
    if (next !== 'revealing' && skipButton.current === document.activeElement) {
      mount.current?.closest('figure')?.querySelector('a')?.focus({ preventScroll: true })
    }
    setState(next)
  }, [])

  useEffect(() => {
    const host = mount.current
    if (!host) return
    const lifecycle = new AbortController()
    const skipOnNavigation = () => skip.abort()
    window.addEventListener('hashchange', skipOnNavigation, { signal: lifecycle.signal })
    const skipWhenHidden = () => { if (document.hidden) skip.abort() }
    document.addEventListener('visibilitychange', skipWhenHidden, { signal: lifecycle.signal })
    if (location.hash === '#studio' || document.hidden) skip.abort()
    const start = async () => {
      try {
        const { mountStudio } = await import('./studio')
        if (!lifecycle.signal.aborted) await mountStudio(host, lifecycle.signal, report, skip.signal)
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
  }, [skip, report])

  return (
    <figure>
      <div className="studio-stage" data-state={state}>
        <div className="studio-canvas" ref={mount} />
        {state !== 'ready' && state !== 'revealing' && state !== 'loading' && (
          <img className="studio-still" src="/models/vehicle.webp" alt="Three-quarter studio view of the vehicle" />
        )}
        <p role="status" className={state === 'ready' || state === 'revealing' ? 'sr-only' : 'stage-status'}>{messages[state]}</p>
        {state === 'revealing' && <button ref={skipButton} type="button" className="skip-reveal" onClick={() => skip.abort()}>Skip reveal</button>}
      </div>
      <figcaption><a className="stage-credit" href="/models/CREDITS.txt">Vehicle credits</a></figcaption>
    </figure>
  )
}

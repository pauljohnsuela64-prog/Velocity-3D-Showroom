import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ButtonLink, Container, SectionHeading } from './components'

import VehicleStage from './VehicleStage'

gsap.registerPlugin(useGSAP)

export default function App() {
  const hero = useRef<HTMLElement>(null)
  useGSAP(() => {
    if (!window.matchMedia) return
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (preference.matches) return
    const timeline = gsap.timeline({ defaults: { ease: 'power2.out' } })
      .from('.eyebrow', { opacity: 0.55, y: 5, duration: 0.32 })
      .from('#showroom-title', { opacity: 0.55, yPercent: 14, duration: 0.68 }, 0.06)
      .from('.hero-description, .hero-copy .button-link', {
        opacity: 0.7, y: 8, duration: 0.4, stagger: 0.08,
      }, 0.18)
    const settle = () => { timeline.progress(1) }
    preference.addEventListener('change', settle)
    window.addEventListener('hashchange', settle)
    return () => {
      preference.removeEventListener('change', settle)
      window.removeEventListener('hashchange', settle)
    }
  }, { scope: hero })
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header" id="top">
        <Container className="header-layout">
          <a className="wordmark" href="#top"><span aria-hidden="true" />VELOCITY</a>
          <nav aria-label="Primary" className="site-nav">
            <a href="#showroom">Showroom</a>
            <a href="#studio">The studio</a>
          </nav>
        </Container>
      </header>
      <main id="main" tabIndex={-1}>
        <Container>
          <section ref={hero} id="showroom" tabIndex={-1} className="hero" aria-labelledby="showroom-title">
            <div className="hero-copy">
              <p className="eyebrow">The automotive showroom</p>
              <h1 id="showroom-title">VELOCITY</h1>
              <p className="hero-description">An automotive studio for taking a closer look at form, finish, and the way light moves across a car.</p>
              <ButtonLink href="#studio">Explore the studio <span aria-hidden="true">↓</span></ButtonLink>
            </div>
            <VehicleStage />
          </section>
          <section id="studio" tabIndex={-1} className="studio" aria-labelledby="studio-title">
            <SectionHeading id="studio-title">The studio</SectionHeading>
            <div className="studio-copy">
              <p>A dark room and a single strip of light. That’s where you begin to see how a car’s proportions, surfaces, and finish work together.</p>
              <ButtonLink href="#showroom" variant="outline">Back to showroom <span aria-hidden="true">↑</span></ButtonLink>
            </div>
          </section>
        </Container>
      </main>
      <footer className="site-footer"><Container>VELOCITY</Container></footer>
    </>
  )
}

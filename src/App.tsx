import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { createStoryProgress } from './storyProgress'
import { useGSAP } from '@gsap/react'
import { ButtonLink, Container, SectionHeading } from './components'

import VehicleStage from './VehicleStage'

gsap.registerPlugin(useGSAP)

export default function App() {
  const [story] = useState(createStoryProgress)
  const wheel = useRef<HTMLElement>(null)
  const lamp = useRef<HTMLElement>(null)
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
  useGSAP(() => {
    const wheelChapter = wheel.current
    const lampChapter = lamp.current
    if (!window.matchMedia || !wheelChapter || !lampChapter) return

    gsap.registerPlugin(ScrollTrigger)
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      // Match native anchor landing positions, including the sticky stage on phones.
      const arrival = (chapter: HTMLElement) =>
        chapter.getBoundingClientRect().top + window.scrollY - parseFloat(getComputedStyle(chapter).scrollMarginTop)
      let middle = 0
      const sync = (trigger: ScrollTrigger) => {
        const position = trigger.start + trigger.progress * (trigger.end - trigger.start)
        const progress = position <= middle
          ? 0.5 * (position - trigger.start) / Math.max(1, middle - trigger.start)
          : 0.5 + 0.5 * (position - middle) / Math.max(1, trigger.end - middle)
        story.set(progress)
      }
      ScrollTrigger.create({
        trigger: hero.current,
        start: () => {
          middle = arrival(wheelChapter)
          return Math.max(1, middle - window.innerHeight * 0.6)
        },
        end: () => Math.min(arrival(lampChapter), ScrollTrigger.maxScroll(window)),
        onRefresh: sync,
        onUpdate: sync,
      })
      for (const chapter of [wheelChapter, lampChapter]) {
        gsap.from(chapter.querySelector('.chapter-copy'), {
          opacity: 0.72, y: 12, ease: 'none',
          scrollTrigger: { trigger: chapter, start: 'top bottom', end: 'top 72%', scrub: true },
        })
      }
      return () => story.set(0)
    })
    return () => media.revert()
  }, { scope: hero, dependencies: [story] })

  useLayoutEffect(() => {
    const navigation = performance.getEntriesByType?.('navigation')[0] as PerformanceNavigationTiming | undefined
    if (navigation?.type === 'back_forward') return
    const target = document.getElementById(window.location.hash.slice(1))
    if (target && hero.current?.contains(target)) {
      target.focus({ preventScroll: true })
      target.scrollIntoView()
      ScrollTrigger.update()
    }
  }, [])

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
            <div className="story-stage"><VehicleStage story={story} /></div>
            <section id="studio" tabIndex={-1} className="studio" aria-labelledby="studio-title">
              <SectionHeading id="studio-title">The studio</SectionHeading>
              <section id="front-wheel" ref={wheel} tabIndex={-1} className="chapter" aria-labelledby="wheel-title">
                <div className="chapter-copy">
                  <h3 id="wheel-title">The front wheel</h3>
                  <p>Follow the spokes from the hub to the rim. Light catches their narrow edges against the dark brake assembly.</p>
                  <ButtonLink href="#headlamp" variant="outline">Inspect the headlamp <span aria-hidden="true">&darr;</span></ButtonLink>
                </div>
              </section>
              <section id="headlamp" ref={lamp} tabIndex={-1} className="chapter" aria-labelledby="lamp-title">
                <div className="chapter-copy">
                  <h3 id="lamp-title">The headlamp</h3>
                  <p>A thin seam of light follows the front fender. Seen up close, the lens traces the change in curvature where the bonnet meets the nose.</p>
                  <ButtonLink href="#front-wheel" variant="outline">Inspect the front wheel <span aria-hidden="true">&uarr;</span></ButtonLink>
                </div>
              </section>
              <ButtonLink href="#showroom" variant="outline">Back to showroom <span aria-hidden="true">&uarr;</span></ButtonLink>
            </section>
          </section>
        </Container>
      </main>
      <footer className="site-footer"><Container>VELOCITY</Container></footer>
    </>
  )
}

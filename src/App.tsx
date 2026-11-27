import { ButtonLink, Container, SectionHeading } from './components'

import VehicleStage from './VehicleStage'

export default function App() {
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
          <section id="showroom" tabIndex={-1} className="hero" aria-labelledby="showroom-title">
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

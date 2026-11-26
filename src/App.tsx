export default function App() {
  return (
    <>
      <a className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-10 focus:bg-graphite focus:p-3" href="#main">
        Skip to content
      </a>
      <header className="border-b border-white/15 bg-graphite">
        <div className="mx-auto max-w-6xl px-6 py-5 text-sm font-semibold tracking-[0.2em]">
          VELOCITY
        </div>
      </header>
      <main id="main" tabIndex={-1} className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-7xl">VELOCITY</h1>
        <p className="mt-4 max-w-prose text-lg">A cinematic automotive showroom.</p>
      </main>
    </>
  )
}

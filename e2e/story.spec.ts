import { expect, test, type Page } from '@playwright/test'

declare global {
  interface Window {
    storyView?: number[]
    storyDraws: number
  }
}

// Read the view matrix Three.js actually uploads. A DOM progress label alone
// cannot tell us which camera pose made it to the renderer.
async function observeCamera(page: Page) {
  await page.addInitScript(() => {
    const gl = WebGL2RenderingContext.prototype
    const viewUniforms = new WeakSet<WebGLUniformLocation>()
    const getLocation = gl.getUniformLocation
    gl.getUniformLocation = function (program, name) {
      const location = getLocation.call(this, program, name)
      if (name === 'viewMatrix' && location) viewUniforms.add(location)
      return location
    }
    const upload = gl.uniformMatrix4fv
    gl.uniformMatrix4fv = function (location, transpose, data, ...range) {
      if (location && viewUniforms.has(location)) {
        window.storyView = Array.from(data).slice(0, 16)
      }
      return upload.call(this, location, transpose, data, ...range)
    }
    window.storyDraws = 0
    const draw = gl.drawElements
    gl.drawElements = function (...args) {
      window.storyDraws++
      return draw.apply(this, args)
    }
  })
}

async function readView(page: Page) {
  return page.evaluate(() => window.storyView?.map(value => Number(value.toFixed(3))).join(','))
}

async function goTo(page: Page, id: string) {
  await page.locator(id).evaluate(element => element.scrollIntoView({ behavior: 'instant', block: 'start' }))
}

test('pinned wheel and headlamp views reverse exactly, resize and rest between scrolls', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await observeCamera(page)
  await page.goto('/')
  const stage = page.locator('.studio-stage')
  await expect(stage).toHaveAttribute('data-state', 'ready', { timeout: 30_000 })
  await expect.poll(() => readView(page)).toBeTruthy()
  const overview = await readView(page)
  await goTo(page, '#front-wheel')
  await expect.poll(() => readView(page)).not.toBe(overview)
  await expect(stage).toBeInViewport()
  await page.screenshot({ path: testInfo.outputPath('wheel.png') })
  const wheel = await readView(page)
  await goTo(page, '#headlamp')
  await expect.poll(() => readView(page)).not.toBe(wheel)
  await expect(stage).toBeInViewport()
  await page.screenshot({ path: testInfo.outputPath('headlamp.png') })
  const lamp = await readView(page)
  expect(lamp).not.toBe(overview)
  await page.evaluate(() => {
    for (const id of ['showroom', 'headlamp', 'front-wheel']) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'instant' })
    }
  })
  await expect.poll(() => readView(page)).toBe(wheel)
  await page.setViewportSize({ width: 390, height: 844 })
  await goTo(page, '#front-wheel')
  await expect(page.locator('canvas')).toHaveCount(1)
  await expect(page.locator('#front-wheel')).toBeInViewport()
  await page.screenshot({ path: testInfo.outputPath('mobile-wheel.png') })
  await expect.poll(() => page.evaluate(async () => {
    const before = window.storyDraws
    await new Promise(resolve => setTimeout(resolve, 500))
    return window.storyDraws - before
  })).toBe(0)
  const mobileDetail = await readView(page)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator('.story-stage')).not.toHaveCSS('position', 'sticky')
  await expect(page.getByRole('img', { name: 'Three-quarter studio view of the vehicle' })).toBeVisible()
  await expect.poll(() => readView(page)).not.toBe(mobileDetail)
  const staticView = await readView(page)
  await goTo(page, '#headlamp')
  await expect.poll(() => readView(page)).toBe(staticView)
})

test('a deferred model opens at the requested chapter without replaying the hero', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await observeCamera(page)
  let resume!: () => void
  const gate = new Promise<void>(resolve => { resume = resolve })
  await page.route('**/models/vehicle.glb', async route => {
    await gate
    await route.continue()
  })
  await page.goto('/#headlamp', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('#headlamp')).toBeInViewport()
  const stage = page.locator('.studio-stage')
  await expect(stage).toHaveAttribute('data-state', 'loading')
  await stage.evaluate(element => {
    new MutationObserver(() => {
      if (element.getAttribute('data-state') === 'revealing') element.setAttribute('data-replayed', 'true')
    }).observe(element, { attributes: true, attributeFilter: ['data-state'] })
  })
  resume()
  await expect(stage).toHaveAttribute('data-state', 'ready', { timeout: 30_000 })
  await expect(stage).not.toHaveAttribute('data-replayed', 'true')
  const lamp = await readView(page)
  expect(lamp).toBeTruthy()
  await goTo(page, '#showroom')
  await expect.poll(() => readView(page)).not.toBe(lamp)
  await goTo(page, '#headlamp')
  await expect.poll(() => readView(page)).toBe(lamp)
})

import { expect, test } from '@playwright/test'
import { writeFile } from 'node:fs/promises'

declare global {
  interface Window {
    vehicleDraws: number
    vehicleReadyMs?: number
  }
}

test('loads the vehicle on demand and shows a fallback if the graphics context is lost', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.addInitScript(() => {
    window.vehicleDraws = 0
    for (const method of ['drawElements', 'drawArrays'] as const) {
      const original = WebGL2RenderingContext.prototype[method]
      Reflect.set(WebGL2RenderingContext.prototype, method, new Proxy(original, {
        apply(target, context, args: number[]) {
          window.vehicleDraws++
          return Reflect.apply(target, context, args)
        },
      }))
    }
    const observer = new MutationObserver(() => {
      if (document.querySelector('.studio-stage[data-state="ready"]')) {
        window.vehicleReadyMs = performance.now()
        observer.disconnect()
      }
    })
    observer.observe(document, { subtree: true, attributes: true, attributeFilter: ['data-state'] })
  })
  await page.goto('/')
  const stage = page.locator('.studio-stage')
  await stage.scrollIntoViewIfNeeded()
  await expect(stage).toHaveAttribute('data-state', 'ready', { timeout: 30_000 })
  const canvas = stage.locator('canvas')
  await expect(canvas).toBeVisible()
  const metrics = await canvas.evaluate((element) => {
    if (!(element instanceof HTMLCanvasElement)) throw new Error('Missing canvas')
    const gl = element.getContext('webgl2')
    if (!gl) throw new Error('No WebGL2 context')
    const info = gl.getExtension('WEBGL_debug_renderer_info')
    const resource = performance.getEntriesByType('resource')
      .find((entry) => new URL(entry.name).pathname === '/models/vehicle.glb') as PerformanceResourceTiming
    return {
      readyMs: Math.round(window.vehicleReadyMs ?? performance.now()),
      modelBytes: resource.encodedBodySize,
      modelRequestMs: Math.round(resource.duration),
      drawingBuffer: [gl.drawingBufferWidth, gl.drawingBufferHeight],
      renderer: info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
    }
  })
  expect(metrics.modelBytes).toBeGreaterThan(0)
  const draws = await page.evaluate(() => window.vehicleDraws)
  expect(draws).toBeGreaterThan(0)
  await canvas.screenshot({
    path: testInfo.outputPath('vehicle.png'),
    style: '.stage-credit { visibility: hidden; }',
  })
  const idleDrawCount = await page.evaluate(async () => {
    const before = window.vehicleDraws
    await new Promise((resolve) => setTimeout(resolve, 500))
    return window.vehicleDraws - before
  })
  expect(idleDrawCount).toBe(0)
  await writeFile(testInfo.outputPath('measurement.json'), JSON.stringify({ ...metrics, draws, idleDrawCount }, null, 2))
  await canvas.evaluate((element) => {
    if (!(element instanceof HTMLCanvasElement)) throw new Error('Missing canvas')
    const extension = element.getContext('webgl2')?.getExtension('WEBGL_lose_context')
    if (!extension) throw new Error('Cannot simulate WebGL context loss')
    extension.loseContext()
  })
  await expect(stage).toHaveAttribute('data-state', 'lost')
  await expect(stage.getByRole('status')).toBeVisible()
  expect(errors).toEqual([])
})

test('announces loading and handles a missing model', async ({ page }) => {
  let release!: () => void
  const gate = new Promise<void>((resolve) => { release = resolve })
  await page.route('**/models/vehicle.glb', async (route) => {
    await gate
    await route.fulfill({ status: 404 })
  })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  const stage = page.locator('.studio-stage')
  await stage.scrollIntoViewIfNeeded()
  await expect(stage).toHaveAttribute('data-state', 'loading')
  await expect(stage.getByRole('status')).toBeVisible()
  release()
  await expect(stage).toHaveAttribute('data-state', 'error', { timeout: 30_000 })
  await expect(stage.getByRole('status')).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible()
})

test('keeps the showroom usable when WebGL2 is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = new Proxy(original, {
      apply(target, canvas, args) {
        if (args[0] === 'webgl2') return null
        return Reflect.apply(target, canvas, args)
      },
    })
  })
  await page.goto('/')
  const stage = page.locator('.studio-stage')
  await stage.scrollIntoViewIfNeeded()
  await expect(stage).toHaveAttribute('data-state', 'unsupported')
  const still = stage.getByRole('img', { name: /vehicle/i })
  await expect.poll(() => still.evaluate(img => img instanceof HTMLImageElement && img.naturalWidth > 0)).toBe(true)
  await expect(stage.getByRole('status')).toBeVisible()
  await page.getByRole('link', { name: 'Explore the studio' }).click()
  await expect(page.getByRole('region', { name: 'The studio' })).toBeFocused()
})

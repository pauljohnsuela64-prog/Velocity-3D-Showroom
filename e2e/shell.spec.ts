import { expect, test } from '@playwright/test'

test('the production shell fits a narrow screen and supports keyboard skipping', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 })
  await page.goto('/')
  await expect(page).toHaveTitle('VELOCITY | Automotive Showroom')
  await expect(page.getByRole('heading', { name: 'VELOCITY', level: 1 })).toBeVisible()
  const fitsViewport = await page.evaluate(() =>
    document.documentElement.scrollWidth <= document.documentElement.clientWidth)
  expect(fitsViewport).toBe(true)
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('main')).toBeFocused()
})

for (const width of [320, 768, 1024, 1440, 1920]) {
  test(`showroom layout and reduced-motion navigation at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    const action = page.getByRole('link', { name: 'Explore the studio' })
    await expect(action).toHaveCSS('transition-duration', '0s')
    await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
    if (width >= 1024) {
      const headingEnd = await page.getByRole('heading', { level: 1 }).evaluate((heading) => {
        const text = document.createRange()
        text.selectNodeContents(heading)
        return text.getBoundingClientRect().right
      })
      const stage = await page.locator('.studio-stage').boundingBox()
      expect(headingEnd).toBeLessThan(stage?.x ?? 0)
    }
    const stage = page.locator('.studio-stage')
    await stage.scrollIntoViewIfNeeded()
    await expect(stage).toHaveAttribute('data-state', 'ready', { timeout: 30_000 })
    await page.screenshot({ path: testInfo.outputPath('showroom.png'), fullPage: true })
    await action.focus()
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/#studio$/)
    await expect(page.getByRole('region', { name: 'The studio' })).toBeFocused()
  })
}

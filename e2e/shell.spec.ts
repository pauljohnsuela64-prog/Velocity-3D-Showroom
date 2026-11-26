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

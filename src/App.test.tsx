import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import App from './App'

afterEach(cleanup)

it('links each showroom navigation item to a visible section', () => {
  render(<App />)
  const navigation = screen.getByRole('navigation', { name: 'Primary' })
  const links = within(navigation).getAllByRole('link')
  expect(links).toHaveLength(2)
  for (const link of links) {
    const target = document.getElementById(link.getAttribute('href')?.slice(1) ?? '')
    expect(target?.querySelector('h1, h2')).toBeTruthy()
  }
  expect(screen.getByRole('contentinfo')).toBeTruthy()
})

it('renders the showroom with labeled landmarks and a skip link', () => {
  render(<App />)
  expect(screen.getByRole('banner')).toBeTruthy()
  const main = screen.getByRole('main')
  expect(screen.getByRole('heading', { level: 1, name: 'VELOCITY' })).toBeTruthy()
  expect(screen.getByRole('link', { name: 'Skip to content' }).getAttribute('href')).toBe('#' + main.id)
})

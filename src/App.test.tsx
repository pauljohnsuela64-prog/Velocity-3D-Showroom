import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import App from './App'

it('renders the showroom with labeled landmarks and a skip link', () => {
  render(<App />)
  expect(screen.getByRole('banner')).toBeTruthy()
  const main = screen.getByRole('main')
  expect(screen.getByRole('heading', { level: 1, name: 'VELOCITY' })).toBeTruthy()
  expect(screen.getByRole('link', { name: 'Skip to content' }).getAttribute('href')).toBe('#' + main.id)
})

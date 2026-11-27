import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import VehicleStage from './VehicleStage'
import { mountStudio } from './studio'

vi.mock('./studio', () => ({ mountStudio: vi.fn() }))

afterEach(() => {
  cleanup()
  vi.resetAllMocks()
})

it('announces loading and cancels the scene lifecycle on unmount', async () => {
  const stage = render(<VehicleStage />)
  expect(screen.getByRole('status').textContent).toMatch(/loading/i)
  await waitFor(() => expect(mountStudio).toHaveBeenCalledTimes(1))
  const signal = vi.mocked(mountStudio).mock.calls[0]?.[1]
  expect(signal?.aborted).toBe(false)
  stage.unmount()
  expect(signal?.aborted).toBe(true)
})

it('provides the local vehicle still when scene setup fails', async () => {
  vi.mocked(mountStudio).mockRejectedValue(new Error('Scene setup failed'))
  render(<VehicleStage />)
  const still = await screen.findByRole('img', { name: /vehicle/i })
  expect(still.getAttribute('src')).toBe('/models/vehicle.webp')
  expect(screen.getByRole('status').textContent).toMatch(/could not load/i)
})

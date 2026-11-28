import { expect, it, vi } from 'vitest'
import { createStoryProgress } from './storyProgress'

it('retains a chapter reached before loading and releases a departed renderer', () => {
  const story = createStoryProgress()
  story.set(0.5)
  expect(story.get()).toBe(0.5)
  const render = vi.fn()
  const unsubscribe = story.subscribe(render)
  story.set(2)
  story.set(1)
  story.set(Number.NaN)
  story.set(0.25)
  unsubscribe()
  story.set(-1)
  expect(render.mock.calls).toEqual([[1], [0.25]])
  expect(story.get()).toBe(0)
})

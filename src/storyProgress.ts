export interface StoryProgress {
  get(): number
  set(value: number): void
  subscribe(listener: (value: number) => void): () => void
}

// The page can scroll before the lazy renderer has subscribed.
export function createStoryProgress(): StoryProgress {
  let progress = 0
  const listeners = new Set<(value: number) => void>()
  return {
    get: () => progress,
    set(value) {
      const next = Math.min(1, Math.max(0, value))
      if (!Number.isFinite(next) || progress === next) return
      progress = next
      for (const listener of listeners) listener(progress)
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
  }
}

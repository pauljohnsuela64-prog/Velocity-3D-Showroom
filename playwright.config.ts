import { defineConfig } from '@playwright/test'

const baseURL = 'http://127.0.0.1:4173'

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL,
    launchOptions: { args: ['--enable-unsafe-swiftshader'] },
  },
  webServer: {
    command: 'node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4173 --strictPort',
    url: baseURL,
  },
})

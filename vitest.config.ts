import react from '@vitejs/plugin-react'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['lib/**/*.test.ts'],
    env: loadEnv(mode, process.cwd(), ''),
  },
}))

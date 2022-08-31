import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Integration tests hit a real Postgres (local or Supabase); Supabase's pooled
    // connection over the network can comfortably exceed vitest's 5s default
    // when a test makes several sequential requests. Item creation in
    // particular now triggers matching + saved-search notification checks
    // (each a further round-trip), so a test creating a handful of items
    // needs real headroom.
    testTimeout: 40000,
  },
})

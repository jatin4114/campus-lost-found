import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'
import '@testing-library/jest-dom/vitest'

// vitest's `globals: false` means Testing Library's own auto-cleanup
// (which relies on detecting a global `afterEach`) never registers —
// without this, every component test after the first sees every previously
// rendered component still in the DOM.
afterEach(() => {
  cleanup()
})

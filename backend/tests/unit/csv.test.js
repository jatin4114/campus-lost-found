import { describe, expect, it } from 'vitest'
import { toCsv } from '../../src/utils/csv.js'

describe('toCsv', () => {
  it('produces a header row plus one row per record', () => {
    const csv = toCsv(
      [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }],
      [{ label: 'id', value: (r) => r.id }, { label: 'name', value: (r) => r.name }],
    )
    expect(csv).toBe('id,name\n1,Alice\n2,Bob')
  })

  it('quotes and escapes fields containing commas, quotes, or newlines', () => {
    const csv = toCsv(
      [{ note: 'has, a comma' }, { note: 'has "quotes"' }, { note: 'has\na newline' }],
      [{ label: 'note', value: (r) => r.note }],
    )
    const rows = csv.split('\n')
    expect(rows[1]).toBe('"has, a comma"')
    expect(rows[2]).toBe('"has ""quotes"""')
    expect(rows[3]).toBe('"has')
    expect(rows[4]).toBe('a newline"')
  })

  it('renders null/undefined as an empty cell', () => {
    const csv = toCsv([{ value: null }, { value: undefined }], [{ label: 'value', value: (r) => r.value }])
    expect(csv).toBe('value\n\n')
  })
})

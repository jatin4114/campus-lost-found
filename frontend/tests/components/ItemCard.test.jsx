import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ItemCard } from '../../src/components/items/ItemCard'

const baseItem = {
  id: 'item-1',
  title: 'AirPods Pro',
  description: 'White case, lost near the library',
  type: 'LOST',
  category: { name: 'Electronics' },
  location: { name: 'Central Library' },
  eventDate: '2026-09-03T00:00:00.000Z',
}

function renderCard(item) {
  return render(
    <MemoryRouter>
      <ItemCard item={item} />
    </MemoryRouter>,
  )
}

describe('ItemCard', () => {
  it('renders the item title, category, and location', () => {
    renderCard(baseItem)
    expect(screen.getByText('AirPods Pro')).toBeInTheDocument()
    expect(screen.getByText('Electronics')).toBeInTheDocument()
    expect(screen.getByText('Central Library')).toBeInTheDocument()
  })

  it('shows a LOST badge for a lost item', () => {
    renderCard(baseItem)
    expect(screen.getByText('LOST')).toBeInTheDocument()
  })

  it('shows a FOUND badge for a found item', () => {
    renderCard({ ...baseItem, type: 'FOUND' })
    expect(screen.getByText('FOUND')).toBeInTheDocument()
  })

  it('links to the item detail page', () => {
    renderCard(baseItem)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/items/item-1')
  })
})

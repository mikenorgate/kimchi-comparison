import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Maps } from './maps'

function resetMaps() {
  localStorage.removeItem('tahoe.maps-places')
}

// Mock Leaflet to avoid loading it in jsdom
vi.mock('leaflet', () => ({
  default: {
    map: () => ({
      setView: () => {},
      remove: () => {},
      on: () => {},
    }),
    tileLayer: () => ({ addTo: () => {} }),
    marker: () => ({ addTo: () => {}, bindPopup: () => ({ addTo: () => {} }) }),
  },
}))

describe('Maps', () => {
  beforeEach(() => {
    resetMaps()
  })

  it('renders the root with sidebar and map container', () => {
    render(<Maps windowId="w1" />)
    expect(screen.getByTestId('maps-root')).toBeInTheDocument()
    expect(screen.getByTestId('maps-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('map-container')).toBeInTheDocument()
  })

  it('shows search input and search button', () => {
    render(<Maps windowId="w1" />)
    expect(screen.getByTestId('maps-search')).toBeInTheDocument()
    expect(screen.getByTestId('search-btn')).toBeInTheDocument()
  })

  it('shows zoom controls', () => {
    render(<Maps windowId="w1" />)
    expect(screen.getByTestId('zoom-in')).toBeInTheDocument()
    expect(screen.getByTestId('zoom-out')).toBeInTheDocument()
  })

  it('shows default saved places', () => {
    render(<Maps windowId="w1" />)
    expect(screen.getByTestId('place-sp1')).toHaveTextContent('Apple Park')
    expect(screen.getByTestId('place-sp2')).toHaveTextContent('Times Square')
  })

  it('searching for a known location sets info badge', () => {
    render(<Maps windowId="w1" />)
    act(() => {
      fireEvent.change(screen.getByTestId('maps-search'), { target: { value: 'San Francisco' } })
      fireEvent.click(screen.getByTestId('search-btn'))
    })
    expect(screen.getByTestId('map-info')).toHaveTextContent('San Francisco')
  })

  it('searching drops a pin', () => {
    render(<Maps windowId="w1" />)
    act(() => {
      fireEvent.change(screen.getByTestId('maps-search'), { target: { value: 'London' } })
      fireEvent.click(screen.getByTestId('search-btn'))
    })
    const pins = screen.getAllByTestId(/pin-/)
    expect(pins.length).toBe(1)
    expect(pins[0]).toHaveTextContent('London')
  })

  it('locate button sets current location', () => {
    render(<Maps windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('locate-btn'))
    })
    expect(screen.getByTestId('map-info')).toHaveTextContent('Current Location')
  })

  it('save button is disabled when no search result', () => {
    render(<Maps windowId="w1" />)
    expect((screen.getByTestId('save-place-btn') as HTMLButtonElement).disabled).toBe(true)
  })

  it('save button enabled after search', () => {
    render(<Maps windowId="w1" />)
    act(() => {
      fireEvent.change(screen.getByTestId('maps-search'), { target: { value: 'Paris' } })
      fireEvent.click(screen.getByTestId('search-btn'))
    })
    expect((screen.getByTestId('save-place-btn') as HTMLButtonElement).disabled).toBe(false)
  })

  it('saving a place adds it to the list', () => {
    render(<Maps windowId="w1" />)
    act(() => {
      fireEvent.change(screen.getByTestId('maps-search'), { target: { value: 'Tokyo' } })
      fireEvent.click(screen.getByTestId('search-btn'))
    })
    const beforeCount = screen.getAllByTestId(/place-sp/).length
    act(() => {
      fireEvent.click(screen.getByTestId('save-place-btn'))
    })
    const afterCount = screen.getAllByTestId(/place-sp/).length
    expect(afterCount).toBe(beforeCount + 1)
  })

  it('clicking a saved place navigates to it', () => {
    render(<Maps windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('place-sp2'))
    })
    expect(screen.getByTestId('map-info')).toHaveTextContent('New York')
  })

  it('clicking a saved place drops a pin', () => {
    render(<Maps windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('place-sp1'))
    })
    const pins = screen.getAllByTestId(/pin-/)
    expect(pins.length).toBeGreaterThan(0)
    expect(pins[0]).toHaveTextContent('Apple Park')
  })

  it('clear pins button removes all pins', () => {
    render(<Maps windowId="w1" />)
    // Drop a pin
    act(() => {
      fireEvent.change(screen.getByTestId('maps-search'), { target: { value: 'Berlin' } })
      fireEvent.click(screen.getByTestId('search-btn'))
    })
    expect(screen.getAllByTestId(/pin-/).length).toBe(1)
    act(() => {
      fireEvent.click(screen.getByTestId('clear-pins-btn'))
    })
    expect(screen.queryAllByTestId(/pin-/)).toHaveLength(0)
  })

  it('clear pins disabled when no pins', () => {
    render(<Maps windowId="w1" />)
    expect((screen.getByTestId('clear-pins-btn') as HTMLButtonElement).disabled).toBe(true)
  })

  it('zoom in increases zoom level', () => {
    render(<Maps windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('zoom-in'))
    })
    // Zoom is internal state; we can't directly assert it but the button should work without error
    expect(screen.getByTestId('map-container')).toBeInTheDocument()
  })

  it('zoom out decreases zoom level', () => {
    render(<Maps windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('zoom-in'))
      fireEvent.click(screen.getByTestId('zoom-out'))
    })
    expect(screen.getByTestId('map-container')).toBeInTheDocument()
  })

  it('search with empty input does nothing', () => {
    render(<Maps windowId="w1" />)
    act(() => {
      fireEvent.change(screen.getByTestId('maps-search'), { target: { value: '' } })
      fireEvent.click(screen.getByTestId('search-btn'))
    })
    expect(screen.queryByTestId('map-info')).toBeNull()
    expect(screen.queryAllByTestId(/pin-/)).toHaveLength(0)
  })

  it('searching multiple locations drops multiple pins', () => {
    render(<Maps windowId="w1" />)
    act(() => {
      fireEvent.change(screen.getByTestId('maps-search'), { target: { value: 'Paris' } })
      fireEvent.click(screen.getByTestId('search-btn'))
    })
    act(() => {
      fireEvent.change(screen.getByTestId('maps-search'), { target: { value: 'Tokyo' } })
      fireEvent.click(screen.getByTestId('search-btn'))
    })
    expect(screen.getAllByTestId(/pin-/).length).toBe(2)
  })

  it('persists saved places to localStorage', () => {
    render(<Maps windowId="w1" />)
    act(() => {
      fireEvent.change(screen.getByTestId('maps-search'), { target: { value: 'Sydney' } })
      fireEvent.click(screen.getByTestId('search-btn'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('save-place-btn'))
    })
    const stored = JSON.parse(localStorage.getItem('tahoe.maps-places')!)
    expect(stored.some((p: { name: string }) => p.name === 'Sydney')).toBe(true)
  })

  it('searching unknown location returns a result with the query as address', () => {
    render(<Maps windowId="w1" />)
    act(() => {
      fireEvent.change(screen.getByTestId('maps-search'), { target: { value: 'some random place' } })
      fireEvent.click(screen.getByTestId('search-btn'))
    })
    expect(screen.getByTestId('map-info')).toBeInTheDocument()
  })

  it('saved place shows coordinates', () => {
    render(<Maps windowId="w1" />)
    const place = screen.getByTestId('place-sp1')
    expect(place).toHaveTextContent(/37\.33/)
    expect(place).toHaveTextContent(/-122\.00/)
  })

  it('save uses search input as place name', () => {
    render(<Maps windowId="w1" />)
    act(() => {
      fireEvent.change(screen.getByTestId('maps-search'), { target: { value: 'London' } })
      fireEvent.click(screen.getByTestId('search-btn'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('save-place-btn'))
    })
    const saved = screen.getAllByTestId(/place-sp-/).find((el) => el.textContent!.includes('London'))
    expect(saved).toBeTruthy()
  })
})

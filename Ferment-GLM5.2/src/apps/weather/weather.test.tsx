import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Weather } from './weather'

function resetWeather() {
  localStorage.removeItem('tahoe.weather-cities')
}

describe('Weather', () => {
  beforeEach(() => {
    resetWeather()
  })

  it('renders the root with sidebar and detail view', () => {
    render(<Weather windowId="w1" />)
    expect(screen.getByTestId('weather-root')).toBeInTheDocument()
    expect(screen.getByTestId('weather-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('weather-detail')).toBeInTheDocument()
  })

  it('shows default cities in sidebar', () => {
    render(<Weather windowId="w1" />)
    expect(screen.getByTestId('city-wc1')).toHaveTextContent('Cupertino')
    expect(screen.getByTestId('city-wc2')).toHaveTextContent('San Francisco')
    expect(screen.getByTestId('city-wc3')).toHaveTextContent('New York')
  })

  it('shows city temp in sidebar', () => {
    render(<Weather windowId="w1" />)
    expect(screen.getByTestId('city-wc1')).toHaveTextContent('78°')
  })

  it('detail shows city name and temperature', () => {
    render(<Weather windowId="w1" />)
    expect(screen.getByTestId('city-name')).toHaveTextContent('Cupertino')
    expect(screen.getByTestId('city-temp')).toHaveTextContent('78°')
  })

  it('detail shows condition with icon', () => {
    render(<Weather windowId="w1" />)
    expect(screen.getByTestId('city-condition')).toHaveTextContent('☀️')
    expect(screen.getByTestId('city-condition')).toHaveTextContent('sunny')
  })

  it('detail shows high and low', () => {
    render(<Weather windowId="w1" />)
    expect(screen.getByTestId('city-high')).toHaveTextContent('H: 82°')
    expect(screen.getByTestId('city-low')).toHaveTextContent('L: 62°')
  })

  it('detail shows humidity and wind', () => {
    render(<Weather windowId="w1" />)
    expect(screen.getByTestId('detail-humidity')).toHaveTextContent('45%')
    expect(screen.getByTestId('detail-wind')).toHaveTextContent('8 mph')
  })

  it('has animated weather background', () => {
    render(<Weather windowId="w1" />)
    expect(screen.getByTestId('weather-bg')).toBeInTheDocument()
  })

  it('forecast shows 7 days', () => {
    render(<Weather windowId="w1" />)
    for (let i = 0; i < 7; i++) {
      expect(screen.getByTestId(`forecast-${i}`)).toBeInTheDocument()
    }
  })

  it('forecast day shows icon, condition, high and low', () => {
    render(<Weather windowId="w1" />)
    const day0 = screen.getByTestId('forecast-0')
    expect(day0).toHaveTextContent('Mon')
    expect(day0.textContent).toMatch(/[☀️⛅☁️🌧️⛈️🌨️🌫️💨]/)
    expect(day0.textContent).toMatch(/\d+°/)
  })

  it('clicking a city switches detail view', () => {
    render(<Weather windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('city-wc2'))
    })
    expect(screen.getByTestId('city-name')).toHaveTextContent('San Francisco')
    expect(screen.getByTestId('city-temp')).toHaveTextContent('62°')
  })

  it('remove city button removes from sidebar', () => {
    render(<Weather windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('city-wc3'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('remove-city'))
    })
    expect(screen.queryByTestId('city-wc3')).toBeNull()
    expect(screen.getByTestId('city-wc1')).toBeInTheDocument()
  })

  it('removing selected city switches to first remaining', () => {
    render(<Weather windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('city-wc1'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('remove-city'))
    })
    expect(screen.getByTestId('city-name')).toHaveTextContent('San Francisco')
  })

  it('add city button opens available cities list', () => {
    render(<Weather windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('add-city-btn'))
    })
    expect(screen.getByTestId('add-city-london')).toBeInTheDocument()
    expect(screen.getByTestId('add-city-tokyo')).toBeInTheDocument()
  })

  it('adding a city adds it to sidebar', () => {
    render(<Weather windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('add-city-btn'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('add-city-london'))
    })
    const cities = screen.getAllByTestId(/city-wc/)
    expect(cities.length).toBe(4)
    expect(cities[3]).toHaveTextContent('London')
  })

  it('adding a city selects it', () => {
    render(<Weather windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('add-city-btn'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('add-city-paris'))
    })
    expect(screen.getByTestId('city-name')).toHaveTextContent('Paris')
  })

  it('already-added cities do not appear in add list', () => {
    render(<Weather windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('add-city-btn'))
    })
    expect(screen.queryByTestId('add-city-cupertino')).toBeNull()
    expect(screen.queryByTestId('add-city-san-francisco')).toBeNull()
  })

  it('persists cities to localStorage', () => {
    render(<Weather windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('add-city-btn'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('add-city-tokyo'))
    })
    const stored = JSON.parse(localStorage.getItem('tahoe.weather-cities')!)
    expect(stored.some((c: { name: string }) => c.name === 'Tokyo')).toBe(true)
  })

  it('different cities show different conditions', () => {
    render(<Weather windowId="w1" />)
    expect(screen.getByTestId('city-condition')).toHaveTextContent('sunny')
    act(() => {
      fireEvent.click(screen.getByTestId('city-wc2'))
    })
    expect(screen.getByTestId('city-condition')).toHaveTextContent('foggy')
  })

  it('detail background changes with condition', () => {
    render(<Weather windowId="w1" />)
    const detail1 = screen.getByTestId('weather-detail')
    const bg1 = detail1.style.background
    act(() => {
      fireEvent.click(screen.getByTestId('city-wc2'))
    })
    const detail2 = screen.getByTestId('weather-detail')
    const bg2 = detail2.style.background
    expect(bg1).not.toBe(bg2)
  })

  it('removing all cities shows empty state', () => {
    render(<Weather windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('city-wc1'))
      fireEvent.click(screen.getByTestId('remove-city'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('city-wc2'))
      fireEvent.click(screen.getByTestId('remove-city'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('city-wc3'))
      fireEvent.click(screen.getByTestId('remove-city'))
    })
    expect(screen.queryByTestId('weather-sidebar')).toBeNull()
  })
})

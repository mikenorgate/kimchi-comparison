import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, beforeEach } from 'vitest'
import { Weather } from './Weather'

describe('Weather', () => {
  beforeEach(() => {
    render(<Weather />)
  })

  it('renders the current weather for the default city', () => {
    expect(screen.getByTestId('weather-city')).toHaveTextContent('Cupertino')
    expect(screen.getByTestId('weather-temp')).toHaveTextContent(/\d+°/)
    expect(screen.getByTestId('weather-forecast')).toBeInTheDocument()
  })

  it('toggles temperature unit between C and F', async () => {
    const toggle = screen.getByTestId('weather-unit-toggle')
    expect(toggle).toHaveTextContent('°C')
    await userEvent.click(toggle)
    expect(toggle).toHaveTextContent('°F')
    expect(screen.getByTestId('weather-temp')).toHaveTextContent(/\d+°/)
  })

  it('searches for a different city', async () => {
    const input = screen.getByTestId('weather-search-input')
    await userEvent.clear(input)
    await userEvent.type(input, 'Tokyo')
    await userEvent.click(screen.getByTestId('weather-search-button'))
    expect(screen.getByTestId('weather-city')).toHaveTextContent('Tokyo')
    expect(screen.getByTestId('weather-condition')).toHaveTextContent('Sunny')
  })

  it('renders humidity and wind details', () => {
    expect(screen.getByTestId('weather-humidity')).toHaveTextContent('Humidity')
    expect(screen.getByTestId('weather-wind')).toHaveTextContent('Wind')
  })
})

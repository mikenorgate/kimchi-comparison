import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PhoneApp } from './components'

describe('PhoneApp', () => {
  it('renders the Recents tab by default with mocked calls', () => {
    render(<PhoneApp />)
    expect(screen.getByTestId('phone-recents-list')).toBeInTheDocument()
    expect(screen.getByTestId('phone-recent-r1')).toHaveTextContent('Sarah Chen')
    expect(screen.getByTestId('phone-recent-r1')).toHaveTextContent('+1 (555) 123-4567')
  })

  it('switches to Contacts and Voicemail tabs', () => {
    render(<PhoneApp />)
    expect(screen.getByTestId('phone-recents-list')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('phone-tab-contacts'))
    expect(screen.getByTestId('phone-contacts-list')).toBeInTheDocument()
    expect(screen.getByTestId('phone-contact-c1')).toHaveTextContent('Alex Rivera')

    fireEvent.click(screen.getByTestId('phone-tab-voicemail'))
    expect(screen.getByTestId('phone-voicemail-list')).toBeInTheDocument()
    expect(screen.getByTestId('phone-voicemail-v1')).toHaveTextContent('Sarah Chen')
    expect(screen.getByTestId('phone-voicemail-play-v1')).toBeInTheDocument()
  })
})

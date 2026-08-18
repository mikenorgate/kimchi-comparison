import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import Finder from './Finder'

afterEach(() => cleanup())

describe('Finder', () => {
  it('renders with sidebar and file list', () => {
    render(<Finder />)
    expect(screen.getByTestId('finder')).toBeInTheDocument()
    expect(screen.getByTestId('finder-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('finder-file-list')).toBeInTheDocument()
  })

  it('shows Home contents by default (Documents, Downloads, Applications, Desktop, readme.md)', () => {
    render(<Finder />)
    expect(screen.getByTestId('finder-item-Documents')).toBeInTheDocument()
    expect(screen.getByTestId('finder-item-Downloads')).toBeInTheDocument()
    expect(screen.getByTestId('finder-item-Applications')).toBeInTheDocument()
    expect(screen.getByTestId('finder-item-Desktop')).toBeInTheDocument()
    expect(screen.getByTestId('finder-item-readme-md')).toBeInTheDocument()
  })

  it('navigates into Documents folder and shows expected files', () => {
    render(<Finder />)
    fireEvent.doubleClick(screen.getByTestId('finder-item-Documents'))

    expect(screen.getByTestId('finder-item-Resume-pdf')).toBeInTheDocument()
    expect(screen.getByTestId('finder-item-Budget-xlsx')).toBeInTheDocument()
    expect(screen.getByTestId('finder-item-Notes-txt')).toBeInTheDocument()
    expect(screen.getByTestId('finder-item-Projects')).toBeInTheDocument()
  })

  it('navigates into Documents via sidebar click', () => {
    render(<Finder />)
    fireEvent.click(screen.getByTestId('finder-location-documents'))

    expect(screen.getByTestId('finder-item-Resume-pdf')).toBeInTheDocument()
    expect(screen.getByTestId('finder-item-Notes-txt')).toBeInTheDocument()
  })

  it('navigates back to Home via sidebar', () => {
    render(<Finder />)
    // Go into Documents
    fireEvent.click(screen.getByTestId('finder-location-documents'))
    expect(screen.getByTestId('finder-item-Resume-pdf')).toBeInTheDocument()

    // Go back to Home
    fireEvent.click(screen.getByTestId('finder-location-home'))
    expect(screen.getByTestId('finder-item-Documents')).toBeInTheDocument()
    expect(screen.getByTestId('finder-item-Downloads')).toBeInTheDocument()
    expect(screen.queryByTestId('finder-item-Resume-pdf')).not.toBeInTheDocument()
  })

  it('navigates into nested folder (Documents > Projects)', () => {
    render(<Finder />)
    fireEvent.doubleClick(screen.getByTestId('finder-item-Documents'))
    expect(screen.getByTestId('finder-item-Projects')).toBeInTheDocument()

    fireEvent.doubleClick(screen.getByTestId('finder-item-Projects'))
    expect(screen.getByTestId('finder-item-README-md')).toBeInTheDocument()
    expect(screen.getByTestId('finder-item-index-html')).toBeInTheDocument()
  })

  it('shows Downloads contents via sidebar', () => {
    render(<Finder />)
    fireEvent.click(screen.getByTestId('finder-location-downloads'))

    expect(screen.getByTestId('finder-item-installer-dmg')).toBeInTheDocument()
    expect(screen.getByTestId('finder-item-photo-jpg')).toBeInTheDocument()
    expect(screen.getByTestId('finder-item-report-zip')).toBeInTheDocument()
  })

  it('shows Applications contents via sidebar', () => {
    render(<Finder />)
    fireEvent.click(screen.getByTestId('finder-location-applications'))

    expect(screen.getByTestId('finder-item-Safari-app')).toBeInTheDocument()
    expect(screen.getByTestId('finder-item-Mail-app')).toBeInTheDocument()
    expect(screen.getByTestId('finder-item-Calendar-app')).toBeInTheDocument()
  })

  it('breadcrumb shows path and navigates back', () => {
    render(<Finder />)
    fireEvent.doubleClick(screen.getByTestId('finder-item-Documents'))

    // Breadcrumb should show Home / Documents
    expect(screen.getByTestId('finder-crumb-0').textContent).toBe('Home')
    expect(screen.getByTestId('finder-crumb-1').textContent).toBe('Documents')

    // Click Home crumb to go back
    fireEvent.click(screen.getByTestId('finder-crumb-0'))
    expect(screen.getByTestId('finder-item-Documents')).toBeInTheDocument()
    expect(screen.getByTestId('finder-item-Downloads')).toBeInTheDocument()
  })
})

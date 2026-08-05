import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, beforeEach } from 'vitest'
import { News } from './News'

describe('News', () => {
  beforeEach(() => {
    render(<News />)
  })

  it('renders the feed and topic tabs', () => {
    expect(screen.getByTestId('news-app')).toBeInTheDocument()
    expect(screen.getByTestId('news-topics')).toBeInTheDocument()
    expect(screen.getByTestId('news-feed')).toBeInTheDocument()
    expect(screen.getByTestId('news-topic-today')).toHaveClass('bg-tahoe-text')
  })

  it('filters articles by topic', async () => {
    await userEvent.click(screen.getByTestId('news-topic-technology'))
    expect(screen.getByTestId('news-card-art-3')).toBeInTheDocument()
    expect(screen.getByTestId('news-card-art-4')).toBeInTheDocument()
    expect(screen.queryByTestId('news-card-art-1')).not.toBeInTheDocument()
  })

  it('opens and closes an article detail', async () => {
    await userEvent.click(screen.getByTestId('news-card-art-1'))
    expect(screen.getByTestId('news-article-detail')).toBeInTheDocument()
    expect(screen.getByTestId('news-article-headline')).toHaveTextContent(
      'Global Markets Rally on Tech Earnings'
    )
    await userEvent.click(screen.getByTestId('news-back'))
    expect(screen.queryByTestId('news-article-detail')).not.toBeInTheDocument()
  })

  it('saves and unsaves an article', async () => {
    await userEvent.click(screen.getByTestId('news-card-art-2'))
    await userEvent.click(screen.getByTestId('news-save'))
    expect(screen.getByTestId('news-save')).toHaveTextContent('Saved')
    await userEvent.click(screen.getByTestId('news-save'))
    expect(screen.getByTestId('news-save')).toHaveTextContent('Save')
  })

  it('searches articles by headline', async () => {
    await userEvent.type(screen.getByTestId('news-search'), 'Mars')
    expect(screen.getByTestId('news-card-art-5')).toBeInTheDocument()
    expect(screen.queryByTestId('news-card-art-1')).not.toBeInTheDocument()
  })
})

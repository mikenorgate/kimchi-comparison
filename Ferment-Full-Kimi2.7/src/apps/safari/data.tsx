import type { MockPage } from './types'

export const homeUrl = 'tahoe://start'

function StartPage() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-3xl font-semibold mb-2">Welcome to Tahoe</h1>
      <p className="text-tahoe-text-secondary">Your private, mocked browsing start page.</p>
    </div>
  )
}

function ExamplePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-2">Example Domain</h1>
      <p className="text-tahoe-text-secondary">This domain is for use in illustrative examples in documents.</p>
    </div>
  )
}

function SearchPage() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-3xl font-semibold mb-4">Tahoe Search</h1>
      <p className="text-tahoe-text-secondary">Search the web (mocked).</p>
    </div>
  )
}

function NewsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-2">Tahoe News</h1>
      <p className="text-tahoe-text-secondary">Latest headlines from around the world.</p>
    </div>
  )
}

function NotFoundPage({ url }: { url: string }) {
  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-semibold mb-2">Page Not Found</h1>
      <p className="text-tahoe-text-secondary">No mocked content for {url}.</p>
    </div>
  )
}

export const mockPages: MockPage[] = [
  { url: homeUrl, title: 'Start Page', content: StartPage },
  { url: 'https://example.com', title: 'Example Domain', content: ExamplePage },
  { url: 'https://search.example', title: 'Search', content: SearchPage },
  { url: 'https://news.example', title: 'Tahoe News', content: NewsPage },
]

export function resolvePage(url: string): MockPage {
  const normalized = url.trim().toLowerCase()
  const found = mockPages.find((p) => p.url.toLowerCase() === normalized)
  if (found) return found
  return { url, title: url, content: () => <NotFoundPage url={url} /> }
}

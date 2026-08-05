import { useMemo, useState } from 'react'
import {
  BookOpen,
  Search,
  ChevronLeft,
  Library,
  Heart,
  Bookmark,
  CheckCircle2,
} from 'lucide-react'
import type { Book } from './types'
import { books as initialBooks, collections } from './data'

function CollectionIcon({ collectionId }: { collectionId: string }) {
  switch (collectionId) {
    case 'favorites':
      return <Heart className="w-4 h-4" />
    case 'want-to-read':
      return <Bookmark className="w-4 h-4" />
    case 'finished':
      return <CheckCircle2 className="w-4 h-4" />
    default:
      return <Library className="w-4 h-4" />
  }
}

function formatPages(page: number, total: number) {
  return `${Math.min(page, total)} of ${total}`
}

export function Books() {
  const [booksList] = useState<Book[]>(initialBooks)
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>(
    collections[0].id
  )
  const [search, setSearch] = useState('')
  const [readingBookId, setReadingBookId] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const filteredBooks = useMemo(() => {
    return booksList
      .filter((book) => {
        if (selectedCollectionId === 'library') return true
        return book.collectionId === selectedCollectionId
      })
      .filter((book) => {
        const query = search.toLowerCase()
        return (
          query === '' ||
          book.title.toLowerCase().includes(query) ||
          book.author.toLowerCase().includes(query)
        )
      })
  }, [booksList, selectedCollectionId, search])

  const readingBook = useMemo(
    () => booksList.find((b) => b.id === readingBookId) ?? null,
    [booksList, readingBookId]
  )

  const openReader = (book: Book) => {
    setReadingBookId(book.id)
    setPage(1)
  }

  const closeReader = () => {
    setReadingBookId(null)
    setPage(1)
  }

  const collectionName =
    collections.find((c) => c.id === selectedCollectionId)?.name ?? 'Library'

  return (
    <div
      className="flex h-full w-full overflow-hidden bg-tahoe-glass/30 text-tahoe-text"
      data-testid="books-app"
    >
      {/* Sidebar */}
      <div
        className="w-44 flex-shrink-0 border-r border-tahoe-glass-border bg-tahoe-window/60 p-3"
        data-testid="books-sidebar"
      >
        <div className="mb-3 flex items-center gap-2 px-3 text-sm font-semibold">
          <BookOpen className="h-5 w-5 text-tahoe-accent" />
          <span>Books</span>
        </div>
        {collections.map((collection) => (
          <button
            key={collection.id}
            onClick={() => setSelectedCollectionId(collection.id)}
            className={`flex w-full items-center gap-2 rounded-tahoe-xs px-3 py-2 text-left text-sm transition-colors ${
              selectedCollectionId === collection.id
                ? 'bg-tahoe-accent/20 text-tahoe-text'
                : 'text-tahoe-text-secondary hover:bg-white/5'
            }`}
            data-testid={`books-collection-${collection.id}`}
          >
            <CollectionIcon collectionId={collection.id} />
            {collection.name}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="flex flex-1 flex-col bg-tahoe-window/80">
        <div className="flex h-12 items-center justify-between border-b border-tahoe-glass-border px-4">
          <span className="font-medium" data-testid="books-grid-heading">
            {collectionName}
          </span>
          <div className="flex items-center gap-2 rounded-full bg-tahoe-glass/50 px-3 py-1.5">
            <Search className="h-4 w-4 text-tahoe-text-secondary" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search books"
              className="w-40 bg-transparent text-sm outline-none placeholder:text-tahoe-text-secondary"
              data-testid="books-search"
            />
          </div>
        </div>

        <div
          className="flex-1 overflow-y-auto p-5"
          data-testid="books-grid"
        >
          {filteredBooks.length === 0 ? (
            <div
              className="flex h-full items-center justify-center text-sm text-tahoe-text-secondary"
              data-testid="books-empty"
            >
              No books in this collection
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-5">
              {filteredBooks.map((book) => (
                <button
                  key={book.id}
                  onClick={() => openReader(book)}
                  className="group flex flex-col gap-2 text-left"
                  data-testid={`books-item-${book.id}`}
                >
                  <div
                    className={`aspect-[2/3] w-full rounded-tahoe-sm bg-gradient-to-br ${book.cover} shadow-sm transition-transform group-hover:scale-[1.02]`}
                  />
                  <div>
                    <div className="font-medium leading-tight">{book.title}</div>
                    <div className="text-xs text-tahoe-text-secondary">
                      {book.author}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reader overlay */}
      {readingBook && (
        <div
          className="absolute inset-0 z-50 flex flex-col bg-tahoe-window"
          data-testid="books-reader"
        >
          <div className="flex h-12 items-center justify-between border-b border-tahoe-glass-border bg-tahoe-glass/50 px-4 backdrop-blur-md">
            <button
              onClick={closeReader}
              className="flex items-center gap-1 rounded-tahoe-xs px-2 py-1 text-sm hover:bg-white/20"
              data-testid="books-reader-back"
            >
              <ChevronLeft className="h-4 w-4" />
              Library
            </button>
            <div className="text-sm font-medium" data-testid="books-reader-title">
              {readingBook.title}
            </div>
            <div className="w-16 text-right text-xs text-tahoe-text-secondary">
              {formatPages(page, readingBook.totalPages)}
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center gap-6 overflow-hidden p-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-full bg-tahoe-glass-strong/50 p-2 hover:bg-tahoe-glass-strong disabled:opacity-30"
              disabled={page <= 1}
              aria-label="Previous page"
              data-testid="books-reader-prev"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div
              className="flex h-full max-h-[600px] w-full max-w-2xl flex-col items-center justify-center rounded-tahoe-lg bg-white p-8 shadow-sm"
              data-testid="books-reader-page"
            >
              <h2 className="text-2xl font-semibold">{readingBook.title}</h2>
              <p className="mt-2 text-sm text-tahoe-text-secondary">
                by {readingBook.author}
              </p>
              <div className="mt-8 max-w-md text-center text-sm leading-relaxed text-tahoe-text-secondary">
                {readingBook.description}
              </div>
              <div className="mt-auto text-xs text-tahoe-text-tertiary">
                Page {page}
              </div>
            </div>

            <button
              onClick={() =>
                setPage((p) => Math.min(readingBook.totalPages, p + 1))
              }
              className="rounded-full bg-tahoe-glass-strong/50 p-2 hover:bg-tahoe-glass-strong disabled:opacity-30"
              disabled={page >= readingBook.totalPages}
              aria-label="Next page"
              data-testid="books-reader-next"
            >
              <ChevronLeft className="h-5 w-5 rotate-180" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

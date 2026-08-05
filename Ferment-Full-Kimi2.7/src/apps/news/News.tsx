import { useState, useMemo, useCallback } from 'react'
import { Search, ChevronLeft, Clock, Share2, Bookmark } from 'lucide-react'
import { articles, topics } from './data'

export function News() {
  const [selectedTopic, setSelectedTopic] = useState<string>('today')
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [saved, setSaved] = useState<Set<string>>(new Set())

  const filteredArticles = useMemo(() => {
    let list =
      selectedTopic === 'today'
        ? articles
        : articles.filter((a) => a.topic === selectedTopic)
    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (a) =>
          a.headline.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q)
      )
    }
    return list
  }, [selectedTopic, query])

  const selectedArticle = useMemo(
    () => articles.find((a) => a.id === selectedArticleId) ?? null,
    [selectedArticleId]
  )

  const featuredArticle = useMemo(
    () => filteredArticles[0] ?? null,
    [filteredArticles]
  )

  const openArticle = useCallback((id: string) => {
    setSelectedArticleId(id)
  }, [])

  const closeArticle = useCallback(() => {
    setSelectedArticleId(null)
  }, [])

  const toggleSave = useCallback((id: string) => {
    setSaved((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden bg-tahoe-glass/30 text-tahoe-text"
      data-testid="news-app"
    >
      {/* Header */}
      <div
        className="flex h-12 items-center justify-between border-b border-tahoe-glass-border bg-tahoe-window/80 px-4"
        data-testid="news-header"
      >
        <div className="flex items-center gap-2">
          {selectedArticle && (
            <button
              onClick={closeArticle}
              className="rounded-tahoe-xs p-1 hover:bg-white/10"
              data-testid="news-back"
              aria-label="Back"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          <span className="font-semibold">
            {selectedArticle ? selectedArticle.source : 'Apple News'}
          </span>
        </div>
        {!selectedArticle && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-tahoe-xs bg-white/10 px-2 py-1">
              <Search className="h-4 w-4 text-tahoe-text-secondary" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                className="w-32 bg-transparent text-sm outline-none placeholder:text-tahoe-text-tertiary"
                data-testid="news-search"
              />
            </div>
            <button
              className="rounded-tahoe-xs p-1 hover:bg-white/10"
              data-testid="news-bookmarks"
              aria-label="Saved"
            >
              <Bookmark
                className={`h-5 w-5 ${saved.size > 0 ? 'fill-tahoe-accent text-tahoe-accent' : ''}`}
              />
            </button>
          </div>
        )}
      </div>

      {/* Topic tabs */}
      {!selectedArticle && (
        <div
          className="flex gap-1 overflow-x-auto border-b border-tahoe-glass-border bg-tahoe-window/60 px-3 py-2"
          data-testid="news-topics"
        >
          {topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => setSelectedTopic(topic.id)}
              className={`flex-shrink-0 rounded-full px-3 py-1 text-sm transition-colors ${
                selectedTopic === topic.id
                  ? 'bg-tahoe-text text-tahoe-window'
                  : 'bg-white/10 text-tahoe-text-secondary hover:bg-white/20'
              }`}
              data-testid={`news-topic-${topic.id}`}
            >
              {topic.name}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-tahoe-window/80">
        {selectedArticle ? (
          <div
            className="mx-auto max-w-2xl p-6"
            data-testid="news-article-detail"
          >
            <div
              className={`mb-4 h-48 w-full rounded-tahoe-lg bg-gradient-to-br ${selectedArticle.image}`}
              data-testid="news-article-image"
            />
            <span className="text-xs font-semibold uppercase tracking-wide text-tahoe-text-secondary">
              {topics.find((t) => t.id === selectedArticle.topic)?.name}
            </span>
            <h1
              className="mt-1 text-2xl font-bold"
              data-testid="news-article-headline"
            >
              {selectedArticle.headline}
            </h1>
            <div className="mt-2 flex items-center gap-2 text-sm text-tahoe-text-secondary">
              <span>{selectedArticle.source}</span>
              <span>•</span>
              <Clock className="h-3 w-3" />
              <span>{selectedArticle.time}</span>
            </div>
            <p className="mt-4 text-base leading-relaxed">
              {selectedArticle.summary} In this detailed report, our journalists
              explore the broader context, interview key figures, and examine
              what this development means for the months ahead. Stay informed
              with concise, accurate coverage.
            </p>
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => toggleSave(selectedArticle.id)}
                className={`flex items-center gap-2 rounded-tahoe-xs px-4 py-2 text-sm font-medium transition-colors ${
                  saved.has(selectedArticle.id)
                    ? 'bg-tahoe-accent text-white'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
                data-testid="news-save"
              >
                <Bookmark className="h-4 w-4" />
                {saved.has(selectedArticle.id) ? 'Saved' : 'Save'}
              </button>
              <button
                className="flex items-center gap-2 rounded-tahoe-xs bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20"
                data-testid="news-share"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4" data-testid="news-feed">
            {featuredArticle && (
              <button
                onClick={() => openArticle(featuredArticle.id)}
                className="mb-4 w-full text-left"
                data-testid={`news-card-${featuredArticle.id}`}
              >
                <div
                  className={`h-40 w-full rounded-tahoe-lg bg-gradient-to-br ${featuredArticle.image}`}
                />
                <span className="mt-2 block text-xs font-semibold uppercase tracking-wide text-tahoe-text-secondary">
                  Top Story
                </span>
                <h2 className="mt-1 text-xl font-bold">
                  {featuredArticle.headline}
                </h2>
                <p className="mt-1 text-sm text-tahoe-text-secondary">
                  {featuredArticle.summary}
                </p>
                <div className="mt-2 text-xs text-tahoe-text-tertiary">
                  {featuredArticle.source} • {featuredArticle.time}
                </div>
              </button>
            )}

            <div className="space-y-3">
              {filteredArticles.slice(1).map((article) => (
                <button
                  key={article.id}
                  onClick={() => openArticle(article.id)}
                  className="flex w-full gap-3 rounded-tahoe-xs bg-white/5 p-3 text-left transition-colors hover:bg-white/10"
                  data-testid={`news-card-${article.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-tahoe-text-secondary">
                      {article.source}
                    </div>
                    <h3 className="mt-0.5 font-medium">{article.headline}</h3>
                    <p className="mt-0.5 line-clamp-2 text-sm text-tahoe-text-secondary">
                      {article.summary}
                    </p>
                    <div className="mt-1 text-xs text-tahoe-text-tertiary">
                      {article.time}
                    </div>
                  </div>
                  <div
                    className={`h-20 w-20 flex-shrink-0 rounded-tahoe-xs bg-gradient-to-br ${article.image}`}
                  />
                </button>
              ))}
            </div>

            {filteredArticles.length === 0 && (
              <div
                className="py-12 text-center text-sm text-tahoe-text-secondary"
                data-testid="news-empty"
              >
                No stories found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

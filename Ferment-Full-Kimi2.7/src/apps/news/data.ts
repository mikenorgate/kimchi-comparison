import type { Article, Topic } from './types'

export const topics: Topic[] = [
  { id: 'today', name: 'Today' },
  { id: 'business', name: 'Business' },
  { id: 'technology', name: 'Technology' },
  { id: 'science', name: 'Science' },
  { id: 'health', name: 'Health' },
  { id: 'entertainment', name: 'Entertainment' },
]

export const articles: Article[] = [
  {
    id: 'art-1',
    topic: 'today',
    source: 'The Morning Post',
    headline: 'Global Markets Rally on Tech Earnings',
    summary:
      'Major indices reached record highs as leading technology companies reported stronger-than-expected quarterly results.',
    time: '2h ago',
    image: 'from-blue-400 to-indigo-600',
  },
  {
    id: 'art-2',
    topic: 'business',
    source: 'Finance Today',
    headline: 'Startups Rethink Remote Work Policies',
    summary:
      'A new wave of companies is introducing hybrid schedules designed to balance collaboration with flexibility.',
    time: '4h ago',
    image: 'from-emerald-400 to-teal-600',
  },
  {
    id: 'art-3',
    topic: 'technology',
    source: 'Code & Circuit',
    headline: 'The Rise of On-Device AI',
    summary:
      'Smaller, efficient models are bringing powerful assistants directly to phones and laptops without the cloud.',
    time: '1h ago',
    image: 'from-violet-400 to-fuchsia-600',
  },
  {
    id: 'art-4',
    topic: 'technology',
    source: 'Future Stack',
    headline: 'WebAssembly Goes Mainstream',
    summary:
      'Developers are increasingly using Wasm to run performance-critical code inside browsers and edge runtimes.',
    time: '5h ago',
    image: 'from-orange-400 to-red-600',
  },
  {
    id: 'art-5',
    topic: 'science',
    source: 'Nature Weekly',
    headline: 'Mars Sample Return Mission Redesigned',
    summary:
      'NASA and partner agencies outlined a leaner approach to bringing Martian rock samples back to Earth.',
    time: '3h ago',
    image: 'from-red-400 to-rose-600',
  },
  {
    id: 'art-6',
    topic: 'health',
    source: 'Wellness Journal',
    headline: 'Sleep and Memory: New Findings',
    summary:
      'Researchers discovered another pathway linking deep sleep to the brain’s ability to consolidate memories.',
    time: '6h ago',
    image: 'from-cyan-400 to-blue-600',
  },
  {
    id: 'art-7',
    topic: 'entertainment',
    source: 'Screen Time',
    headline: 'Streaming Hits Record Subscriber Numbers',
    summary:
      'Viewership growth accelerated this quarter across ad-supported tiers and international markets.',
    time: '30m ago',
    image: 'from-pink-400 to-purple-600',
  },
  {
    id: 'art-8',
    topic: 'business',
    source: 'Market Watch',
    headline: 'Small Businesses Embrace AI Tools',
    summary:
      'New affordable productivity tools are helping local shops compete with larger online retailers.',
    time: '7h ago',
    image: 'from-yellow-400 to-orange-600',
  },
]

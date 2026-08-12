export interface SafariFavorite {
  id: string;
  title: string;
  url: string;
  color: string;
}

export interface SafariFrequentlyVisited {
  id: string;
  title: string;
  url: string;
}

export const safariFavorites: SafariFavorite[] = [
  {
    id: 'apple',
    title: 'Apple',
    url: 'https://www.apple.com',
    color: '#007aff',
  },
  {
    id: 'icloud',
    title: 'iCloud',
    url: 'https://www.icloud.com',
    color: '#007aff',
  },
  {
    id: 'github',
    title: 'GitHub',
    url: 'https://github.com',
    color: '#24292f',
  },
  {
    id: 'wikipedia',
    title: 'Wikipedia',
    url: 'https://www.wikipedia.org',
    color: '#6e6e73',
  },
  {
    id: 'reddit',
    title: 'Reddit',
    url: 'https://www.reddit.com',
    color: '#ff4500',
  },
  {
    id: 'youtube',
    title: 'YouTube',
    url: 'https://www.youtube.com',
    color: '#ff0000',
  },
  {
    id: 'news',
    title: 'Apple News',
    url: 'https://www.apple.com/newsroom/',
    color: '#ff2d55',
  },
  {
    id: 'maps',
    title: 'Apple Maps',
    url: 'https://maps.apple.com',
    color: '#34c759',
  },
];

export const safariFrequentlyVisited: SafariFrequentlyVisited[] = [
  { id: 'apple', title: 'Apple', url: 'https://www.apple.com' },
  { id: 'icloud', title: 'iCloud', url: 'https://www.icloud.com' },
  { id: 'github', title: 'GitHub', url: 'https://github.com' },
  { id: 'wikipedia', title: 'Wikipedia', url: 'https://www.wikipedia.org' },
];

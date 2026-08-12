export type SafariPageMode = 'start' | 'page';

export interface SafariTab {
  id: string;
  title: string;
  url: string;
  mode: SafariPageMode;
  history: string[];
  historyIndex: number;
}

export interface SafariState {
  tabs: SafariTab[];
  activeTabId: string;
}

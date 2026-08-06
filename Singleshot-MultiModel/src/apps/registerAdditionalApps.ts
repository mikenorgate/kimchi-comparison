/**
 * Chunk 7 — Additional apps aggregator.
 *
 * Calls each per-app register function in turn to install the full
 * additional-app set with the OS store. The caller passes the store's
 * `registerApp` action.
 *
 * Apps registered (in order):
 *  - calendar
 *  - mail
 *  - music
 *  - photos
 *  - weather
 *  - maps
 *  - clock
 *  - stocks
 *  - tv
 *  - podcasts
 *  - reminders
 */

import type { AppDefinition } from '../types/os';

import { registerCalendar } from './registerCalendar';
import { registerClock } from './registerClock';
import { registerMail } from './registerMail';
import { registerMaps } from './registerMaps';
import { registerMusic } from './registerMusic';
import { registerPhotos } from './registerPhotos';
import { registerPodcasts } from './registerPodcasts';
import { registerReminders } from './registerReminders';
import { registerStocks } from './registerStocks';
import { registerTV } from './registerTV';
import { registerWeather } from './registerWeather';

/** Ids registered by this aggregator, in registration order. */
export const ADDITIONAL_APP_IDS: readonly string[] = [
  'calendar',
  'mail',
  'music',
  'photos',
  'weather',
  'maps',
  'clock',
  'stocks',
  'tv',
  'podcasts',
  'reminders',
] as const;

/**
 * Register every additional (Chunk 7) app with the store.
 *
 * Idempotent: each per-app `registerXxx` is itself idempotent (calling
 * `useOSStore.registerApp()` overwrites the previous definition), so
 * this can be called multiple times safely.
 */
export function registerAdditionalApps(
  register: (app: AppDefinition) => void,
): void {
  registerCalendar(register);
  registerMail(register);
  registerMusic(register);
  registerPhotos(register);
  registerWeather(register);
  registerMaps(register);
  registerClock(register);
  registerStocks(register);
  registerTV(register);
  registerPodcasts(register);
  registerReminders(register);
}

export default registerAdditionalApps;

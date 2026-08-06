import type { AppDefinition } from '../types/os';

import { registerCalculator } from './registerCalculator';
import { registerNotes } from './registerNotes';
import { registerSafari } from './registerSafari';
import { registerSystemSettings } from './registerSystemSettings';
import { registerTerminal } from './registerTerminal';

/**
 * Register all core apps (Chunk 6) with the OS app registry.
 *
 * Each `registerXxx` function registers exactly one app definition. The
 * `register` callback is typically `useOSStore.getState().registerApp`,
 * but callers may also use any other store action to perform the
 * registration. Calling `registerCoreApps` more than once is safe and
 * simply overwrites the previous definitions for these ids.
 *
 * App ids registered here:
 *   - safari
 *   - terminal
 *   - system-settings
 *   - notes
 *   - calculator
 */
export function registerCoreApps(register: (app: AppDefinition) => void): void {
  registerSafari(register);
  registerTerminal(register);
  registerSystemSettings(register);
  registerNotes(register);
  registerCalculator(register);
}

export default registerCoreApps;

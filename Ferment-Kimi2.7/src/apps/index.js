import { APP_IDS } from '../data/apps'
import { Finder } from './Finder'
import { Calculator } from './Calculator'
import { Notes } from './Notes'
import { Calendar } from './Calendar'
import { Clock } from './Clock'
import { Safari } from './Safari'
import { Settings } from './Settings'

export const APP_COMPONENTS = {
  [APP_IDS.FINDER]: Finder,
  [APP_IDS.CALCULATOR]: Calculator,
  [APP_IDS.NOTES]: Notes,
  [APP_IDS.CALENDAR]: Calendar,
  [APP_IDS.CLOCK]: Clock,
  [APP_IDS.SAFARI]: Safari,
  [APP_IDS.SETTINGS]: Settings,
}

export function getAppComponent(appId) {
  return APP_COMPONENTS[appId] ?? null
}

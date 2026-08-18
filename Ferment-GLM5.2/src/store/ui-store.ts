import { create } from 'zustand'

interface UIState {
  spotlightOpen: boolean
  controlCenterOpen: boolean
  notificationCenterOpen: boolean
  missionControlOpen: boolean
  setSpotlightOpen: (v: boolean) => void
  setControlCenterOpen: (v: boolean) => void
  setNotificationCenterOpen: (v: boolean) => void
  setMissionControlOpen: (v: boolean) => void
  closeAllPanels: () => void
}

export const useUIStore = create<UIState>((set) => ({
  spotlightOpen: false,
  controlCenterOpen: false,
  notificationCenterOpen: false,
  missionControlOpen: false,
  setSpotlightOpen: (v) => set({ spotlightOpen: v, controlCenterOpen: false, notificationCenterOpen: false }),
  setControlCenterOpen: (v) => set({ controlCenterOpen: v, spotlightOpen: false, notificationCenterOpen: false }),
  setNotificationCenterOpen: (v) => set({ notificationCenterOpen: v, spotlightOpen: false, controlCenterOpen: false }),
  setMissionControlOpen: (v) => set({ missionControlOpen: v }),
  closeAllPanels: () =>
    set({ spotlightOpen: false, controlCenterOpen: false, notificationCenterOpen: false, missionControlOpen: false }),
}))

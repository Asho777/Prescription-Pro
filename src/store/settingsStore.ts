import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AppSettings } from '../types'

interface SettingsStore {
  settings: AppSettings
  updateSettings: (updates: Partial<AppSettings>) => void
  resetSettings: () => void
}

const defaultSettings: AppSettings = {
  notifications: {
    medicationReminders: true,
    refillAlerts: true,
    appointmentReminders: true,
    soundEnabled: true,
    vibrationEnabled: true,
    reminderAdvanceTime: 15,
  },
  currency: 'AUD',
  dateFormat: 'dd/MM/yyyy',
  timeFormat: '12h',
  theme: 'dark',
  language: 'en',
  backupEnabled: true,
  biometricAuth: false,
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      
      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates }
        }))
      },
      
      resetSettings: () => {
        set({ settings: defaultSettings })
      },
    }),
    {
      name: 'prescription-manager-settings',
      version: 1,
    }
  )
)

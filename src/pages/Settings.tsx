import { useSettingsStore } from '../store/settingsStore'
import { Save, Download, Upload, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export function Settings() {
  const { settings, updateSettings, resetSettings } = useSettingsStore()

  const handleNotificationChange = (key: keyof typeof settings.notifications, value: boolean) => {
    updateSettings({
      notifications: {
        ...settings.notifications,
        [key]: value
      }
    })
  }

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    updateSettings({ [key]: value })
  }

  const exportData = () => {
    const data = localStorage.getItem('prescription-manager-storage')
    if (data) {
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `prescription-backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Data exported successfully!')
    }
  }

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = e.target?.result as string
          JSON.parse(data) // Validate JSON
          localStorage.setItem('prescription-manager-storage', data)
          toast.success('Data imported successfully! Please refresh the page.')
        } catch (error) {
          toast.error('Invalid backup file format.')
        }
      }
      reader.readAsText(file)
    }
  }

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      localStorage.clear()
      toast.success('All data cleared successfully! Please refresh the page.')
    }
  }

  const handleResetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults?')) {
      resetSettings()
      toast.success('Settings reset to defaults!')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Customize your prescription management experience</p>
      </div>

      {/* Notification Settings */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Medication Reminders</label>
              <p className="text-sm text-gray-500">Get notified when it's time to take your medications</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.medicationReminders}
              onChange={(e) => handleNotificationChange('medicationReminders', e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Refill Alerts</label>
              <p className="text-sm text-gray-500">Get notified when medications are running low</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.refillAlerts}
              onChange={(e) => handleNotificationChange('refillAlerts', e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Appointment Reminders</label>
              <p className="text-sm text-gray-500">Get notified about upcoming doctor appointments</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.appointmentReminders}
              onChange={(e) => handleNotificationChange('appointmentReminders', e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Sound Notifications</label>
              <p className="text-sm text-gray-500">Play sound with notifications</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.soundEnabled}
              onChange={(e) => handleNotificationChange('soundEnabled', e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Vibration</label>
              <p className="text-sm text-gray-500">Vibrate device for notifications (mobile only)</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.vibrationEnabled}
              onChange={(e) => handleNotificationChange('vibrationEnabled', e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Reminder Advance Time</label>
              <p className="text-sm text-gray-500">How early to send reminders</p>
            </div>
            <select
              value={settings.notifications.reminderAdvanceTime}
              onChange={(e) => handleNotificationChange('reminderAdvanceTime', parseInt(e.target.value))}
              className="input-field w-auto"
            >
              <option value={0}>At scheduled time</option>
              <option value={5}>5 minutes before</option>
              <option value={15}>15 minutes before</option>
              <option value={30}>30 minutes before</option>
              <option value={60}>1 hour before</option>
            </select>
          </div>
        </div>
      </div>

      {/* Display Settings */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Display Settings</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Currency</label>
            <select
              value={settings.currency}
              onChange={(e) => handleSettingChange('currency', e.target.value)}
              className="input-field"
            >
              <option value="AUD">AUD (A$)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="CAD">CAD (C$)</option>
            </select>
          </div>
          
          <div>
            <label className="label">Date Format</label>
            <select
              value={settings.dateFormat}
              onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
              className="input-field"
            >
              <option value="dd/MM/yyyy">DD/MM/YYYY</option>
              <option value="MM/dd/yyyy">MM/DD/YYYY</option>
              <option value="yyyy-MM-dd">YYYY-MM-DD</option>
            </select>
          </div>
          
          <div>
            <label className="label">Time Format</label>
            <select
              value={settings.timeFormat}
              onChange={(e) => handleSettingChange('timeFormat', e.target.value)}
              className="input-field"
            >
              <option value="12h">12 Hour (AM/PM)</option>
              <option value="24h">24 Hour</option>
            </select>
          </div>
          
          <div>
            <label className="label">Theme</label>
            <select
              value={settings.theme}
              onChange={(e) => handleSettingChange('theme', e.target.value)}
              className="input-field"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Security & Privacy</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Biometric Authentication</label>
              <p className="text-sm text-gray-500">Use fingerprint or face recognition to unlock the app</p>
            </div>
            <input
              type="checkbox"
              checked={settings.biometricAuth}
              onChange={(e) => handleSettingChange('biometricAuth', e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Automatic Backup</label>
              <p className="text-sm text-gray-500">Automatically backup your data to cloud storage</p>
            </div>
            <input
              type="checkbox"
              checked={settings.backupEnabled}
              onChange={(e) => handleSettingChange('backupEnabled', e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Export Data</label>
              <p className="text-sm text-gray-500">Download a backup of all your data</p>
            </div>
            <button
              onClick={exportData}
              className="btn-secondary inline-flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Import Data</label>
              <p className="text-sm text-gray-500">Restore data from a backup file</p>
            </div>
            <label className="btn-secondary inline-flex items-center cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              Import
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
              />
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Clear All Data</label>
              <p className="text-sm text-gray-500">Permanently delete all your data</p>
            </div>
            <button
              onClick={clearAllData}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 inline-flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Data
            </button>
          </div>
        </div>
      </div>

      {/* Reset Settings */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Reset Settings</h2>
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-900">Reset to Defaults</label>
            <p className="text-sm text-gray-500">Reset all settings to their default values (AUD currency, DD/MM/YYYY date format, 12h time, Dark theme)</p>
          </div>
          <button
            onClick={handleResetSettings}
            className="btn-secondary"
          >
            Reset Settings
          </button>
        </div>
      </div>
    </div>
  )
}

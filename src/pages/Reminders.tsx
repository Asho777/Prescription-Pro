import { useState, useEffect } from 'react'
import { useMedicationStore } from '../store/medicationStore'
import { Bell, Clock, Calendar, AlertTriangle, Plus, Edit, Trash2 } from 'lucide-react'
import { format, addDays, isToday, isTomorrow } from 'date-fns'
import { Link } from 'react-router-dom'

export function Reminders() {
  const { medications, reminders, addReminder, updateReminder, deleteReminder, markMedicationTaken, unmarkMedicationTaken, getDailyMedicationStatus } = useMedicationStore()
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'settings'>('today')
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update current time every minute (same as HomeScreenWidget)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [])

  // Helper function to safely format date (same as HomeScreenWidget)
  const safeFormat = (date: Date | string, formatStr: string): string => {
    try {
      if (typeof date === 'string') {
        const parsedDate = new Date(date)
        if (isNaN(parsedDate.getTime())) {
          return 'Invalid Date'
        }
        return format(parsedDate, formatStr)
      }
      if (isNaN(date.getTime())) {
        return 'Invalid Date'
      }
      return format(date, formatStr)
    } catch (error) {
      console.error('Date formatting error:', error)
      return 'Invalid Date'
    }
  }

  // Calculate today string using the same method as HomeScreenWidget
  const today = safeFormat(currentTime, 'yyyy-MM-dd')

  // Generate today's medication reminders with proper dependency on currentTime
  const todaysMedications = (() => {
    try {
      const medReminders = medications
        .filter(med => med?.isActive && med?.timings && Array.isArray(med.timings))
        .flatMap(med => 
          med.timings
            .filter(time => time && typeof time === 'string')
            .map(timing => {
              const takenTimings = getDailyMedicationStatus ? getDailyMedicationStatus(med.id, today) : []
              const isTaken = Array.isArray(takenTimings) ? takenTimings.includes(timing) : false
              
              return {
                id: `${med.id}-${timing}`,
                medicationId: med.id,
                medicationName: med.name,
                dosage: med.dosage,
                timing,
                taken: isTaken,
                currentQuantity: med.currentQuantity,
              }
            })
        )

      // Group by medication
      const medicationGroups = new Map()
      medReminders.forEach(reminder => {
        if (!medicationGroups.has(reminder.medicationId)) {
          medicationGroups.set(reminder.medicationId, [])
        }
        medicationGroups.get(reminder.medicationId).push(reminder)
      })
      
      // Sort each medication's timings and flatten back to array
      const sortedReminders = []
      Array.from(medicationGroups.values())
        .forEach(medicationTimings => {
          // Sort timings within each medication (morning first, then bedtime)
          medicationTimings.sort((a, b) => b.timing.localeCompare(a.timing))
          sortedReminders.push(...medicationTimings)
        })
      
      // Sort all reminders by their timing (morning → lunch → bedtime)
      sortedReminders.sort((a, b) => {
        return b.timing.localeCompare(a.timing)
      })
      
      return sortedReminders

      return medReminders
    } catch (error) {
      console.error('Error calculating today\'s medications:', error)
      return []
    }
  })()

  // Generate upcoming refill reminders
  const upcomingRefills = medications
    .filter(med => {
      const daysUntilEmpty = Math.floor(med.currentQuantity / med.frequency)
      return daysUntilEmpty <= 14 && med.isActive
    })
    .map(med => {
      const daysUntilEmpty = Math.floor(med.currentQuantity / med.frequency)
      const refillDate = addDays(currentTime, daysUntilEmpty)
      return {
        ...med,
        daysUntilEmpty,
        refillDate,
        priority: daysUntilEmpty <= 3 ? 'high' : daysUntilEmpty <= 7 ? 'medium' : 'low'
      }
    })
    .sort((a, b) => a.daysUntilEmpty - b.daysUntilEmpty)

  const handleToggleMedicationTaken = (medicationId: string, timing: string) => {
    try {
      const takenTimings = getDailyMedicationStatus(medicationId, today)
      const isTaken = takenTimings.includes(timing)
      
      // Prevent double-processing by checking current state before making changes
      const medication = medications.find(med => med.id === medicationId)
      if (!medication) return
      
      if (isTaken) {
        // Only undo if it's actually marked as taken
        if (unmarkMedicationTaken) {
          unmarkMedicationTaken(medicationId, timing, today)
        }
      } else {
        // Only mark as taken if it's not already taken
        if (markMedicationTaken) {
          markMedicationTaken(medicationId, timing, today)
        }
      }
    } catch (error) {
      console.error('Error toggling medication:', error)
    }
  }

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    return format(date, 'MMM dd, yyyy')
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-blue-600 bg-blue-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reminders</h1>
        <p className="text-gray-600">Manage your medication reminders and alerts</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('today')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'today'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Today's Medications
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'upcoming'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Upcoming Refills
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'settings'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Reminder Settings
          </button>
        </nav>
      </div>

      {/* Today's Medications */}
      {activeTab === 'today' && (
        <div className="space-y-4">
          {todaysMedications.length > 0 ? (
            todaysMedications.map((reminder) => (
              <div key={reminder.id} className="card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`w-3 h-3 rounded-full ${reminder.taken ? 'bg-green-500' : 'bg-gray-300'}`} />
                    </div>
                    <div>
                      <Link 
                        to={`/medications/edit/${reminder.medicationId}`}
                        className="text-lg font-medium text-gray-900 hover:text-primary-600 transition-colors"
                      >
                        {reminder.medicationName}
                      </Link>
                      <p className="text-sm text-gray-500">{reminder.dosage} - {reminder.timing}</p>
                      <p className="text-xs text-gray-400">Current stock: {reminder.currentQuantity}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      {reminder.timing}
                    </span>
										<button
                      onClick={() => handleToggleMedicationTaken(reminder.medicationId, reminder.timing)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        reminder.taken
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-primary-600 text-white hover:bg-primary-700'
                      }`}
                    >
                      {reminder.taken ? 'Undo' : 'Mark as Taken'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Bell className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No medications scheduled</h3>
              <p className="mt-1 text-sm text-gray-500">
                You don't have any medications scheduled for today.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Upcoming Refills */}
      {activeTab === 'upcoming' && (
        <div className="space-y-4">
          {upcomingRefills.length > 0 ? (
            upcomingRefills.map((medication) => (
              <div key={medication.id} className="card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <AlertTriangle className={`h-6 w-6 ${
                        medication.priority === 'high' ? 'text-red-500' :
                        medication.priority === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                      }`} />
                    </div>
                    <div>
                      <Link 
                        to={`/medications/edit/${medication.id}`}
                        className="text-lg font-medium text-gray-900 hover:text-primary-600 transition-colors"
                      >
                        {medication.name}
                      </Link>
                      <p className="text-sm text-gray-500">
                        {medication.currentQuantity} remaining • {medication.dosage}
                      </p>
                      <p className="text-sm text-gray-500">
                        {medication.repeatsRemaining} repeats remaining
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(medication.priority)}`}>
                      {medication.daysUntilEmpty} days left
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Refill by {getDateLabel(medication.refillDate)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming refills</h3>
              <p className="mt-1 text-sm text-gray-500">
                All your medications have sufficient stock for the next two weeks.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Reminder Settings */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">Medication Reminders</label>
                  <p className="text-sm text-gray-500">Get notified when it's time to take your medications</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
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
                  defaultChecked
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
                  defaultChecked
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
                  defaultChecked
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Timing Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Reminder Advance Time</label>
                <select className="input-field w-auto">
                  <option value="0">At scheduled time</option>
                  <option value="5">5 minutes before</option>
                  <option value="15" defaultValue="15">15 minutes before</option>
                  <option value="30">30 minutes before</option>
                  <option value="60">1 hour before</option>
                </select>
              </div>
              
              <div>
                <label className="label">Refill Alert Timing</label>
                <select className="input-field w-auto">
                  <option value="3">3 days before running out</option>
                  <option value="5">5 days before running out</option>
                  <option value="7" defaultValue="7">7 days before running out</option>
                  <option value="14">14 days before running out</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button className="btn-primary">
              Save Settings
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

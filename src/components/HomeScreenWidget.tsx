import { useState, useEffect } from 'react'
import { useMedicationStore } from '../store/medicationStore'
import { Medication } from '../types'
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Pill,
  ChevronRight,
  Calendar,
  Timer,
  Package
} from 'lucide-react'
import { format } from 'date-fns'

interface TodaysMedication {
  medication: Medication
  timings: {
    time: string
    taken: boolean
    overdue: boolean
  }[]
  allTaken: boolean
  hasOverdue: boolean
}

interface WidgetProps {
  size?: 'small' | 'medium' | 'large'
  onMedicationClick?: (medicationId: string) => void
  onMarkAsTaken?: (medicationId: string, timing: string) => void
  onViewAll?: () => void
  showStock?: boolean
}

export function HomeScreenWidget({ 
  size = 'medium', 
  onMedicationClick,
  onMarkAsTaken,
  onViewAll,
  showStock = false
}: WidgetProps) {
  const { 
    medications, 
    markMedicationTaken, 
    unmarkMedicationTaken, 
    getDailyMedicationStatus 
  } = useMedicationStore()
  
  const [currentTime, setCurrentTime] = useState(new Date())
  const [todaysMedications, setTodaysMedications] = useState<TodaysMedication[]>([])

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [])

  // Helper function to safely parse time string
  const parseTimeString = (timeString: string): Date | null => {
    if (!timeString || typeof timeString !== 'string') {
      return null
    }

    const timePattern = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/
    if (!timePattern.test(timeString)) {
      return null
    }

    const [hours, minutes] = timeString.split(':').map(Number)
    
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return null
    }

    const date = new Date()
    date.setHours(hours, minutes, 0, 0)
    return date
  }

  // Helper function to safely format date
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

  // Calculate remaining days for a medication
  const calculateRemainingDays = (medication: Medication) => {
    if (!medication.currentQuantity || !medication.frequency) return 0
    return Math.floor(medication.currentQuantity / medication.frequency)
  }

  // Get stock status color
  const getStockStatusColor = (medication: Medication) => {
    const remaining = medication.currentQuantity || 0
    if (remaining <= 7) return 'text-red-600'
    if (remaining <= 14) return 'text-yellow-600'
    return 'text-green-600'
  }

  // Calculate today's medications with timing status
  useEffect(() => {
    try {
      const today = safeFormat(new Date(), 'yyyy-MM-dd')
      const now = new Date()
      
      const activeMeds = medications.filter(med => med?.isActive && med?.timings && Array.isArray(med.timings))
      
      const todaysData: TodaysMedication[] = activeMeds.map(medication => {
        const takenTimings = getDailyMedicationStatus ? getDailyMedicationStatus(medication.id, today) : []
        
        const timings = medication.timings
          .filter(time => time && typeof time === 'string')
          .map(time => {
            const medicationTime = parseTimeString(time)
            const taken = Array.isArray(takenTimings) ? takenTimings.includes(time) : false
            const overdue = medicationTime ? (!taken && now > medicationTime) : false
            
            return {
              time,
              taken,
              overdue
            }
          })
          .filter(timing => timing.time) // Remove any invalid timings
        
        const allTaken = timings.length > 0 ? timings.every(t => t.taken) : false
        const hasOverdue = timings.some(t => t.overdue)
        
        return {
          medication,
          timings,
          allTaken,
          hasOverdue
        }
      }).filter(medData => medData.timings.length > 0) // Only include medications with valid timings

      /// Sort each medication's timings internally first
      todaysData.forEach(medData => {
        medData.timings.sort((a, b) => b.time.localeCompare(a.time))
      })
      
      // Sort medications by their earliest timing (morning → lunch → bedtime)
      todaysData.sort((a, b) => {
        const aEarliestTime = a.timings.length > 0 ? a.timings[0].time : '00:00'
        const bEarliestTime = b.timings.length > 0 ? b.timings[0].time : '00:00'
        
        return bEarliestTime.localeCompare(aEarliestTime)
      })
      
      setTodaysMedications(todaysData)
    } catch (error) {
      console.error('Error calculating today\'s medications:', error)
      setTodaysMedications([])
    }
  }, [medications, getDailyMedicationStatus, currentTime])

  const handleToggleMedication = (medicationId: string, timing: string, currentlyTaken: boolean) => {
    try {
      const today = safeFormat(new Date(), 'yyyy-MM-dd')
      
      if (currentlyTaken) {
        if (unmarkMedicationTaken) {
          unmarkMedicationTaken(medicationId, timing, today)
        }
      } else {
        if (markMedicationTaken) {
          markMedicationTaken(medicationId, timing, today)
        }
      }
      
      if (onMarkAsTaken) {
        onMarkAsTaken(medicationId, timing)
      }
    } catch (error) {
      console.error('Error toggling medication:', error)
    }
  }

  const getNextUpcomingMedication = () => {
    try {
      const upcomingMed = todaysMedications.find(med => !med.allTaken)
      if (!upcomingMed) return null
      
      const nextTiming = upcomingMed.timings.find(t => !t.taken)
      return nextTiming ? { medication: upcomingMed.medication, timing: nextTiming } : null
    } catch (error) {
      console.error('Error getting next upcoming medication:', error)
      return null
    }
  }

  const getWidgetStats = () => {
    try {
      const total = todaysMedications.length
      const completed = todaysMedications.filter(med => med.allTaken).length
      const overdue = todaysMedications.filter(med => med.hasOverdue).length
      
      return { total, completed, overdue }
    } catch (error) {
      console.error('Error getting widget stats:', error)
      return { total: 0, completed: 0, overdue: 0 }
    }
  }

  const formatTime = (time: string) => {
    try {
      if (!time || typeof time !== 'string') {
        return 'Invalid Time'
      }

      const parsedTime = parseTimeString(time)
      if (!parsedTime) {
        return time // Return original string if parsing fails
      }

      return safeFormat(parsedTime, 'h:mm a')
    } catch (error) {
      console.error('Error formatting time:', error)
      return time || 'Invalid Time'
    }
  }

  const stats = getWidgetStats()
  const nextMed = getNextUpcomingMedication()

  // Small widget - shows only next medication
  if (size === 'small') {
    return (
      <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200 max-w-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Next Medication</h3>
          <Pill className="h-5 w-5 text-primary-600" />
        </div>
        
        {nextMed ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">{nextMed.medication.name || 'Unknown Medication'}</span>
              <span className={`text-sm px-2 py-1 rounded-full ${
                nextMed.timing.overdue 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {formatTime(nextMed.timing.time)}
              </span>
            </div>
            <p className="text-sm text-gray-600">{nextMed.medication.dosage || 'No dosage info'}</p>
            
            {/* Stock Information */}
            {showStock && (
              <div className="flex items-center text-sm">
                <Package className="h-4 w-4 mr-1" />
                <span className={`font-medium ${getStockStatusColor(nextMed.medication)}`}>
                  {nextMed.medication.currentQuantity || 0} left
                </span>
                <span className="text-gray-400 ml-2">
                  ({calculateRemainingDays(nextMed.medication)} days)
                </span>
              </div>
            )}
            
            {/* Low stock warning */}
            {showStock && (nextMed.medication.currentQuantity || 0) <= 7 && (
              <div className="p-2 bg-red-50 border border-red-200 rounded-md">
                <p className="text-xs text-red-700">
                  ⚠️ Low stock! Consider refilling soon.
                </p>
              </div>
            )}

            <button
              onClick={() => handleToggleMedication(nextMed.medication.id, nextMed.timing.time, nextMed.timing.taken)}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 text-base"
            >
              <CheckCircle2 className="h-5 w-5" />
              Mark as Taken
            </button>
          </div>
        ) : (
          <div className="text-center py-4">
            <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">All medications completed!</p>
          </div>
        )}
      </div>
    )
  }

  // Medium widget - shows today's overview with key medications
  if (size === 'medium') {
    const displayMeds = todaysMedications.slice(0, 5)
    
    return (
      <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200 max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Today's Medications</h3>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">{safeFormat(new Date(), 'MMM dd')}</span>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium text-gray-900">{stats.completed}/{stats.total}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
            />
          </div>
          {stats.overdue > 0 && (
            <div className="flex items-center gap-1 mt-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-600">{stats.overdue} overdue</span>
            </div>
          )}
        </div>

        {/* Medication list */}
        <div className="space-y-3">
          {displayMeds.map((medData) => (
            <div key={medData.medication.id} className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{medData.medication.name || 'Unknown Medication'}</p>
                
                {/* Stock Information */}
                {showStock && (
                  <div className="flex items-center text-xs mt-1 mb-1">
                    <Package className="h-3 w-3 mr-1" />
                    <span className={`font-medium ${getStockStatusColor(medData.medication)}`}>
                      {medData.medication.currentQuantity || 0} left
                    </span>
                    <span className="text-gray-400 ml-1">
                      ({calculateRemainingDays(medData.medication)} days)
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {medData.timings.map((timing) => (
                    <button
                      key={timing.time}
                      onClick={() => handleToggleMedication(medData.medication.id, timing.time, timing.taken)}
                      className={`text-sm px-3 py-2 rounded-full border transition-all ${
                        timing.taken
                          ? 'bg-green-100 text-green-800 border-green-200'
                          : timing.overdue
                            ? 'bg-red-100 text-red-800 border-red-200 animate-pulse'
                            : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-primary-50 hover:text-primary-700'
                      }`}
                    >
                      {formatTime(timing.time)}
                    </button>
                  ))}
                </div>
              </div>
              {medData.allTaken && (
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>

        {todaysMedications.length > 5 && (
          <button
            onClick={onViewAll}
            className="w-full mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center justify-center gap-1"
          >
            View All ({todaysMedications.length})
            <ChevronRight className="h-4 w-4" />
          </button>
        )}

        {todaysMedications.length === 0 && (
          <div className="text-center py-4">
            <Pill className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No medications scheduled for today</p>
          </div>
        )}
      </div>
    )
  }

  // Large widget - comprehensive view with weekly trends
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 max-w-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Medication Dashboard</h3>
        <div className="flex items-center gap-2">
          <Timer className="h-5 w-5 text-gray-500" />
          <span className="text-sm text-gray-500">{safeFormat(currentTime, 'h:mm a')}</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary-600">{stats.completed}</div>
          <div className="text-xs text-gray-500">Completed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-600">{stats.total - stats.completed}</div>
          <div className="text-xs text-gray-500">Remaining</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          <div className="text-xs text-gray-500">Overdue</div>
        </div>
      </div>

      {/* Today's medications */}
      <div className="space-y-3 mb-4">
        {todaysMedications.map((medData) => (
          <div 
            key={medData.medication.id} 
            className={`p-3 rounded-lg border transition-all ${
              medData.allTaken 
                ? 'bg-gray-50 border-green-200' 
                : medData.hasOverdue 
                  ? 'bg-red-50 border-red-200'
                  : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">{medData.medication.name || 'Unknown Medication'}</h4>
              <span className="text-xs text-gray-500">{medData.medication.dosage || 'No dosage'}</span>
            </div>
            
            {/* Stock Information */}
            {showStock && (
              <div className="flex items-center text-sm mb-2">
                <Package className="h-4 w-4 mr-1" />
                <span className={`font-medium ${getStockStatusColor(medData.medication)}`}>
                  {medData.medication.currentQuantity || 0} left
                </span>
                <span className="text-gray-400 ml-2">
                  ({calculateRemainingDays(medData.medication)} days)
                </span>
                {(medData.medication.currentQuantity || 0) <= 7 && (
                  <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                    Low Stock
                  </span>
                )}
              </div>
            )}
            
            <div className="flex items-center gap-2 flex-wrap">
              {medData.timings.map((timing) => (
                <button
                  key={timing.time}
                  onClick={() => handleToggleMedication(medData.medication.id, timing.time, timing.taken)}
                  className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    timing.taken
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : timing.overdue
                        ? 'bg-red-100 text-red-800 hover:bg-red-200 animate-pulse'
                        : 'bg-white text-gray-700 hover:bg-primary-100 hover:text-primary-800 border border-gray-300'
                  }`}
                >
                  {timing.taken ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Clock className="h-4 w-4" />
                  )}
                  {formatTime(timing.time)}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {todaysMedications.length === 0 && (
        <div className="text-center py-8">
          <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No medications scheduled for today</p>
        </div>
      )}

      {/* Quick actions */}
      <div className="flex gap-2 pt-4 border-t border-gray-200">
        <button
          onClick={onViewAll}
          className="flex-1 bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          View All Medications
        </button>
        {nextMed && (
          <button
            onClick={() => handleToggleMedication(nextMed.medication.id, nextMed.timing.time, nextMed.timing.taken)}
            className="bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium whitespace-nowrap"
          >
            Quick Mark
          </button>
        )}
      </div>
    </div>
  )
}

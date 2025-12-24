import { useNavigate } from 'react-router-dom'
import { useMedicationStore } from '../store/medicationStore'
import { DashboardStats } from '../types'
import { Link } from 'react-router-dom'
import { 
  Pill, 
  AlertTriangle, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  Clock
} from 'lucide-react'
import { format, isAfter, isBefore, addDays } from 'date-fns'
import toast from 'react-hot-toast'

// Helper function to get current year total with reset logic (same as Reports.tsx)
const getCurrentYearlyTotal = (medication: any) => {
  const currentYear = new Date().getFullYear()
  const lastResetYear = medication.lastYearlyResetDate 
    ? new Date(medication.lastYearlyResetDate).getFullYear()
    : currentYear - 1 // If no reset date, assume it needs reset

  // If we're in a new year, return 0
  if (currentYear > lastResetYear) {
    return 0
  }
  
  return medication.yearlyTotalCost || 0
}

export function Dashboard() {
  const navigate = useNavigate()
  const { medications, financialRecords, logs, doctors } = useMedicationStore()

  // Calculate yearly spending using the same method as Reports.tsx
  const yearlySpending = medications.reduce((sum, med) => {
    return sum + getCurrentYearlyTotal(med)
  }, 0)

  const stats: DashboardStats = {
    totalMedications: medications.length,
    activeMedications: medications.filter(med => med.isActive).length,
    medicationsLow: medications.filter(med => med.currentQuantity <= 7).length,
    upcomingRefills: medications.filter(med => {
      const daysUntilEmpty = Math.floor(med.currentQuantity / med.frequency)
      return daysUntilEmpty <= 7
    }).length,
    yearlySpending,
    adherenceRate: 85 // This would be calculated from logs in a real app
  }

  const upcomingMedications = medications
    .filter(med => med.isActive)
    .slice(0, 10)

  const lowStockMedications = medications
    .filter(med => med.currentQuantity <= 7)
    .slice(0, 3)

  const expiringMedications = medications
    .filter(med => {
      const expiryDate = new Date(med.expiryDate)
      const thirtyDaysFromNow = addDays(new Date(), 30)
      return isBefore(expiryDate, thirtyDaysFromNow) && isAfter(expiryDate, new Date())
    })
    .slice(0, 3)

  // Check for medications that need doctor appointments
  const medicationsNeedingAppointments = medications.filter(med => {
    const daysUntilEmpty = Math.floor(med.currentQuantity / med.frequency)
    return daysUntilEmpty <= 7 && med.repeatsRemaining === 0 && med.isActive
  })

  // Show notifications for medications needing appointments
  if (medicationsNeedingAppointments.length > 0) {
    medicationsNeedingAppointments.forEach(med => {
      const doctor = doctors.find(d => d.id === med.doctorId)
      toast.error(
        `${med.name} is running low with no repeats remaining. Book an appointment with ${doctor?.name || 'your doctor'} for a new prescription.`,
        { duration: 8000 }
      )
    })
  }

  const currentYear = new Date().getFullYear()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of your prescription management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Pill className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Medications</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalMedications}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Medications</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeMedications}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Low Stock</p>
              <p className="text-2xl font-bold text-gray-900">{stats.medicationsLow}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Upcoming Refills</p>
              <p className="text-2xl font-bold text-gray-900">{stats.upcomingRefills}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{currentYear} Spending</p>
              <p className="text-2xl font-bold text-gray-900">${stats.yearlySpending.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Adherence Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.adherenceRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        
        {/* Today's Medications */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Today's Medications</h3>
          <div className="space-y-3">
            {upcomingMedications.map((medication) => (
              <div key={medication.id} className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <div className="flex-1">
                  <Link
                    to={`/medications/edit/${medication.id}`}
                    className="font-medium text-gray-900 hover:text-primary-600"
                  >
                    {medication.name}
                  </Link>
                  <p className="text-sm text-gray-500">
                    {medication.dosage} - {medication.timings?.join(', ') || 'No timing set'}
                  </p>
                </div>
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    medication.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {medication.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
            {upcomingMedications.length === 0 && (
              <p className="text-gray-500 text-center py-4">No active medications</p>
            )}
          </div>
        </div>

        {/* Alerts */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Alerts & Notifications</h3>
          <div className="space-y-3">
            {medicationsNeedingAppointments.map((medication) => (
              <Link
                key={medication.id}
                to={`/medications/edit/${medication.id}`}
                className="flex items-center p-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
              >
                <Calendar className="h-5 w-5 text-red-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900 hover:text-primary-600 dark:!text-black">Appointment Needed: {medication.name}</p>
                  <p className="text-sm text-gray-500">No repeats remaining - book doctor appointment</p>
                </div>
              </Link>
            ))}
            
            {lowStockMedications.map((medication) => (
              <Link
                key={medication.id}
                to={`/medications/edit/${medication.id}`}
                className="flex items-center p-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
              >
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900 hover:text-primary-600 dark:!text-black">Low Stock: {medication.name}</p>
                  <p className="text-sm text-gray-500">{medication.currentQuantity} remaining</p>
                </div>
              </Link>
            ))}
            
            {expiringMedications.map((medication) => (
              <Link
                key={medication.id}
                to={`/medications/edit/${medication.id}`}
                className="flex items-center p-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
              >
                <Calendar className="h-5 w-5 text-red-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900 hover:text-primary-600 dark:!text-black">Expiring: {medication.name}</p>
                  <p className="text-sm text-gray-500">Expires {format(new Date(medication.expiryDate), 'MMM dd, yyyy')}</p>
                </div>
              </Link>
            ))}
            
            {medicationsNeedingAppointments.length === 0 && lowStockMedications.length === 0 && expiringMedications.length === 0 && (
              <p className="text-gray-500 text-center py-4">No alerts at this time</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

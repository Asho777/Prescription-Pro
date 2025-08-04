import { useMedicationStore } from '../store/medicationStore'
import { DashboardStats } from '../types'
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

export function Dashboard() {
  const { medications, financialRecords, logs, doctors } = useMedicationStore()

  // Calculate yearly spending (current year)
  const currentYear = new Date().getFullYear()
  const yearlySpending = financialRecords
    .filter(record => {
      const recordDate = new Date(record.date)
      return recordDate.getFullYear() === currentYear
    })
    .reduce((sum, record) => sum + record.amount, 0)

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
    .slice(0, 5)

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

  return (
    <div className="space-y-6">
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
              <p className="text-2xl font-bold text-gray-900">A${stats.yearlySpending.toFixed(2)}</p>
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
          {upcomingMedications.length > 0 ? (
            <div className="space-y-3">
              {upcomingMedications.map((medication) => (
                <div key={medication.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{medication.name}</p>
                    <p className="text-sm text-gray-500">{medication.dosage} - {medication.timings.join(', ')}</p>
                  </div>
                  <span className="status-badge status-active">Active</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No medications scheduled for today</p>
          )}
        </div>

        {/* Alerts */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Alerts & Notifications</h3>
          <div className="space-y-3">
            {medicationsNeedingAppointments.map((medication) => (
              <div key={medication.id} className="flex items-center p-3 bg-red-50 rounded-lg">
                <Calendar className="h-5 w-5 text-red-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Appointment Needed: {medication.name}</p>
                  <p className="text-sm text-gray-500">No repeats remaining - book doctor appointment</p>
                </div>
              </div>
            ))}
            
            {lowStockMedications.map((medication) => (
              <div key={medication.id} className="flex items-center p-3 bg-yellow-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Low Stock: {medication.name}</p>
                  <p className="text-sm text-gray-500">{medication.currentQuantity} remaining</p>
                </div>
              </div>
            ))}
            
            {expiringMedications.map((medication) => (
              <div key={medication.id} className="flex items-center p-3 bg-red-50 rounded-lg">
                <Calendar className="h-5 w-5 text-red-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Expiring: {medication.name}</p>
                  <p className="text-sm text-gray-500">Expires {format(new Date(medication.expiryDate), 'MMM dd, yyyy')}</p>
                </div>
              </div>
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

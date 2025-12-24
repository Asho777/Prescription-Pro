import { useNavigate } from 'react-router-dom'
import { HomeScreenWidget } from '../components/HomeScreenWidget'
import { useAuthStore } from '../store/useAuthStore'
import { BookOpen } from 'lucide-react'

export function Home() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Welcome Back!</h1>
        {user && (
          <p className="mt-1 text-2xl font-medium text-gray-900">
            {user.user_metadata?.first_name} {user.user_metadata?.last_name}
          </p>
        )}
        <p className="mt-2 text-lg text-gray-600">Here are your medications for today</p>
      </div>

      {/* Centered HomeScreenWidget */}
      <div className="flex justify-center">
        <HomeScreenWidget
          size="large"
          onMedicationClick={(id) => navigate(`/medications/edit/${id}`)}
          onViewAll={() => navigate('/medications')}
          showStock={true}
        />
      </div>

      {/* Help Guide Button - Prominent placement for new users */}
      <div className="flex justify-center">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md">
          <div className="flex items-center mb-2">
            <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-sm font-medium text-blue-900">New to Prescription Pro?</h3>
          </div>
          <p className="text-sm text-blue-700 mb-3">
            Learn how to get the most out of your medication management with our comprehensive user guide.
          </p>
          <button
            onClick={() => navigate('/user-guide')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 text-sm"
          >
            View User Guide
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex justify-center">
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/medications/add')}
            className="btn-primary"
          >
            Add New Medication
          </button>
          <button
            onClick={() => navigate('/reminders')}
            className="btn-secondary"
          >
            View Reminders
          </button>
        </div>
      </div>
    </div>
  )
}

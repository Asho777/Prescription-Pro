import { useNavigate } from 'react-router-dom'
import { HomeScreenWidget } from '../components/HomeScreenWidget'

export function Home() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Welcome Back!</h1>
        <p className="mt-2 text-lg text-gray-600">Here are your medications for today</p>
      </div>

      {/* Centered HomeScreenWidget */}
      <div className="flex justify-center">
        <HomeScreenWidget 
          size="large"
          onMedicationClick={(id) => navigate(`/medications/edit/${id}`)}
          onViewAll={() => navigate('/medications')}
        />
      </div>

      {/* Quick Actions */}
      <div className="flex justify-center">
        <div className="flex gap-4">
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
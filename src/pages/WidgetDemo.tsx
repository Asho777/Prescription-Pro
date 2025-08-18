import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HomeScreenWidget } from '../components/HomeScreenWidget'
import { Settings, Maximize2, Minimize2 } from 'lucide-react'

// This component demonstrates how to integrate the HomeScreenWidget into your app
export function WidgetDemo() {
  const navigate = useNavigate()
  const [widgetSize, setWidgetSize] = useState<'small' | 'medium' | 'large'>('medium')

  const handleMedicationClick = (medicationId: string) => {
    navigate(`/medications/edit/${medicationId}`)
  }

  const handleMarkAsTaken = (medicationId: string, timing: string) => {
    // This is already handled by the widget internally
    // But you could add additional logic here like:
    // - Show success toast
    // - Update external systems
    // - Track analytics
    console.log(`Marked medication ${medicationId} at ${timing} as taken`)
  }

  const handleViewAll = () => {
    navigate('/medications')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Demo Controls */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Home Screen Widget Demo</h2>
          <p className="text-gray-600 mb-6">
            This widget can be placed on your app's home screen, dashboard, or even as a system widget
            on mobile devices. It automatically updates based on your medication schedule and tracks adherence in real-time.
          </p>
          
          {/* Size selector */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm font-medium text-gray-700">Widget Size:</span>
            <div className="flex gap-2">
              {(['small', 'medium', 'large'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setWidgetSize(size)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    widgetSize === size
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Widget features */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Key Features</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Real-time medication tracking</li>
                <li>• Visual progress indicators</li>
                <li>• Overdue medication alerts</li>
                <li>• One-tap mark as taken</li>
                <li>• Auto-updates every minute</li>
                <li>• Responsive design (3 sizes)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Smart Sorting</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Overdue medications shown first</li>
                <li>• Next upcoming times prioritized</li>
                <li>• Completed medications at bottom</li>
                <li>• Color-coded status indicators</li>
                <li>• Automatic stock tracking</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Widget Showcase */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Small Widget */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">Small Widget</h3>
            <p className="text-sm text-gray-600">Perfect for quick glances and minimal screen real estate</p>
            <div className="flex justify-center">
              <HomeScreenWidget 
                size="small"
                onMedicationClick={handleMedicationClick}
                onMarkAsTaken={handleMarkAsTaken}
                onViewAll={handleViewAll}
              />
            </div>
          </div>

          {/* Medium Widget */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">Medium Widget</h3>
            <p className="text-sm text-gray-600">Balanced view with progress tracking and key medications</p>
            <div className="flex justify-center">
              <HomeScreenWidget 
                size="medium"
                onMedicationClick={handleMedicationClick}
                onMarkAsTaken={handleMarkAsTaken}
                onViewAll={handleViewAll}
              />
            </div>
          </div>

          {/* Large Widget */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">Large Widget</h3>
            <p className="text-sm text-gray-600">Comprehensive dashboard with full medication overview</p>
            <div className="flex justify-center">
              <HomeScreenWidget 
                size="large"
                onMedicationClick={handleMedicationClick}
                onMarkAsTaken={handleMarkAsTaken}
                onViewAll={handleViewAll}
              />
            </div>
          </div>
        </div>

        {/* Interactive Demo */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Interactive Demo</h3>
          <p className="text-gray-600 mb-6">
            Try different widget sizes and interact with the medications. This widget uses your actual 
            Prescription Pro data and will update your medication tracking in real-time.
          </p>
          
          <div className="flex justify-center">
            <HomeScreenWidget 
              size={widgetSize}
              onMedicationClick={handleMedicationClick}
              onMarkAsTaken={handleMarkAsTaken}
              onViewAll={handleViewAll}
            />
          </div>
        </div>

        {/* Implementation Notes */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Implementation Notes</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>
              <strong>For Web App:</strong> Add this widget to your Dashboard component or create a dedicated home screen.
            </p>
            <p>
              <strong>For Mobile App:</strong> This component can be adapted for React Native and used as a system widget.
            </p>
            <p>
              <strong>Customization:</strong> Easily customize colors, sizing, and behavior through props and CSS variables.
            </p>
            <p>
              <strong>Performance:</strong> Optimized with minimal re-renders and efficient data processing.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Example of how to add the widget to your existing Dashboard
export function EnhancedDashboard() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      {/* Your existing dashboard header */}
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of your prescription management</p>
      </div>

      {/* Add the widget at the top for immediate visibility */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <HomeScreenWidget 
            size="medium"
            onMedicationClick={(id) => navigate(`/medications/edit/${id}`)}
            onViewAll={() => navigate('/medications')}
          />
        </div>
        
        {/* Your existing stats or other widgets can go here */}
        <div className="lg:col-span-2">
          {/* Your existing dashboard content */}
        </div>
      </div>

      {/* Rest of your existing dashboard content */}
    </div>
  )
}

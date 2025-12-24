import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, DollarSign, BarChart3, Settings, Pill, Users, Calendar, FileText, Shield, Download, HelpCircle } from 'lucide-react'

export function UserGuide() {
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState('overview')

  const sections = [
    { id: 'overview', title: 'Overview', icon: BookOpen },
    { id: 'getting-started', title: 'Getting Started', icon: Pill },
    { id: 'managing', title: 'Managing Medications', icon: FileText },
    { id: 'cost-tracking', title: 'Cost Tracking', icon: DollarSign },
    { id: 'reports', title: 'Reports & Analytics', icon: BarChart3 },
    { id: 'settings', title: 'Settings', icon: Settings },
    { id: 'data-security', title: 'Data & Security', icon: Shield },
    { id: 'best-practices', title: 'Best Practices', icon: HelpCircle },
  ]

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
            <p className="text-gray-700 mb-4">
              Prescription Pro is your personal medication assistant that helps you:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Track all your medications in one secure location</li>
              <li>Monitor prescription refills and expiry dates</li>
              <li>Manage medication costs and yearly spending</li>
              <li>Generate detailed reports and analytics</li>
              <li>Set up reminders for medication times</li>
              <li>Maintain records of doctors and pharmacies</li>
            </ul>
          </div>
        )
      
      case 'getting-started':
        return (
          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Getting Started</h2>

						<div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
              <p className="text-red-800 font-medium">
                <strong>Please Note!</strong> Before entering your medications, please add your Doctors 
								and Pharmacies in their respective sections. Both a Doctor and a Pharmacy must be added 
								to complete your medication setup.
              </p>
            </div>
					
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Adding Your First Medication</h3>
            <ol className="list-decimal pl-6 space-y-3 text-gray-700">
              <li><strong>Navigate to Medications:</strong> Use the main navigation to access your medication list</li>
              <li><strong>Add New Medication:</strong> Click the "Add Medication" button</li>
              <li><strong>Fill in Basic Information:</strong>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Medication name (e.g., "Lisinopril")</li>
                  <li>Dosage (e.g., "10mg")</li>
                  <li>Form (tablet, capsule, liquid, etc.)</li>
                  <li>Frequency (times per day)</li>
                  <li>Timing instructions (morning, with food, etc.)</li>
                </ul>
              </li>
              <li><strong>Add Healthcare Providers:</strong>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Select prescribing doctor</li>
                  <li>Choose pharmacy</li>
                  <li>(Add doctors and pharmacies in their respective sections first)</li>
                </ul>
              </li>
              <li><strong>Enter Prescription Details:</strong>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Prescription date</li>
                  <li>Expiry date</li>
                  <li>Repeats remaining</li>
                  <li>Total repeats authorized</li>
                </ul>
              </li>
              <li><strong>Set Quantity & Cost Information:</strong>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Quantity per fill</li>
                  <li>Current quantity in stock</li>
                  <li>Cost per fill</li>
                  <li>Purchase date</li>
                </ul>
              </li>
            </ol>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Understanding Key Calculations</h3>
            <div className="bg-green-50 p-4 rounded-lg">
              <ul className="space-y-2 text-green-700">
                <li><strong>Total Number of Dispensings:</strong> Automatically calculated as Total Repeats + 1</li>
                <li><strong>Remaining Days:</strong> Current Quantity ÷ Daily Frequency (helps identify when you'll run out)</li>
                <li><strong>Yearly Cost Tracking:</strong> Accumulates all purchases for the current year, automatically resets on January 1st</li>
                <li><strong>Purchase Tracking:</strong> Records every medication purchase with date stamps for accurate spending analysis</li>
              </ul>
            </div>
          </div>
        )

      case 'managing':
        return (
          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Managing Your Medications</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Editing Medications</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
              <li>Click on any medication name to edit its details</li>
              <li>Update quantities when you receive new prescriptions</li>
              <li>Record new purchases to track spending</li>
              <li>The cost field resets to $0 after saving to prepare for next purchase entry</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">Monitoring Stock Levels</h3>
            <div className="bg-green-50 p-4 rounded-lg mb-6">
              <ul className="list-disc pl-6 space-y-2 text-green-700">
                <li>Red indicators show medications with 7 days or less remaining</li>
                <li>Red highlighting alerts you to medications with 0 repeats remaining</li>
                <li>Use the Reports section to see all critical medications at a glance</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">Yearly Cost Management</h3>
            <p className="text-gray-700 mb-3">The app includes sophisticated yearly cost tracking:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Automatic Calculation:</strong> Adds up all purchases for the current year</li>
              <li><strong>Manual Override:</strong> Edit yearly totals manually if needed (marked with blue indicators)</li>
              <li><strong>Automatic Reset:</strong> Costs reset to $0 on January 1st each year</li>
              <li><strong>Purchase History:</strong> All purchases are logged with dates for accurate reporting</li>
            </ul>
          </div>
        )

      case 'cost-tracking':
        return (
          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cost Tracking & Financial Management</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Key Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Purchase History</h4>
                <p className="text-green-700">Record every medication purchase with dates and amounts</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Yearly Cost Tracking</h4>
                <p className="text-blue-700">Automatically calculate annual spending per medication with yearly reset functionality</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">Cost Analysis</h4>
                <p className="text-purple-700">View total amount spent per purchase and track dispensings purchased</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-semibold text-orange-800 mb-2">Manual Adjustments</h4>
                <p className="text-orange-700">Option to manually edit yearly totals when needed</p>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">How It Works</h3>
            <ol className="list-decimal pl-6 space-y-2 text-gray-700">
              <li>Enter the cost per fill when you purchase medication</li>
              <li>Record how many dispensings you purchased</li>
              <li>The app calculates your total purchase amount</li>
              <li>Your yearly total is automatically updated</li>
              <li>Purchase history is recorded with the date you entered</li>
              <li>On January 1st, yearly totals reset to $0 for the new year</li>
            </ol>
          </div>
        )

      case 'reports':
        return (
          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Reports & Analytics</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Monthly Spending Chart</h3>
            <p className="text-gray-700 mb-4">
              Visual representation of your medication spending throughout the year, helping you:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
              <li>Identify spending patterns</li>
              <li>Budget for medication costs</li>
              <li>Track seasonal variations in medication needs</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">Medication Summary Table</h3>
            <p className="text-gray-700 mb-3">Comprehensive overview showing:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
              <li>Current stock levels</li>
              <li>Days remaining</li>
              <li>Repeat status</li>
              <li>Yearly costs per medication</li>
              <li>Active/inactive status</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">Recent Purchases</h3>
            <p className="text-gray-700 mb-3">Track your latest medication purchases with:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Purchase dates</li>
              <li>Amount spent</li>
              <li>Quick links to edit medication details</li>
            </ul>
          </div>
        )

      case 'settings':
        return (
          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Settings Customization</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Notification Settings</h3>
            <p className="text-gray-700 mb-3">Configure alerts for:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
              <li>Medication reminders with advance timing options</li>
              <li>Refill alerts for low stock</li>
              <li>Appointment reminders</li>
              <li>Sound and vibration preferences</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">Display Preferences</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Currency:</strong> Choose from AUD, USD, EUR, GBP, CAD</li>
                <li><strong>Date Format:</strong> DD/MM/YYYY, MM/DD/YYYY, or YYYY-MM-DD</li>
                <li><strong>Time Format:</strong> 12-hour or 24-hour display</li>
                <li><strong>Theme:</strong> Light or dark mode options</li>
              </ul>
            </div>
          </div>
        )

      case 'data-security':
        return (
          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security & Backup</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Export Your Data</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
              <li>Generate complete backups in JSON format</li>
              <li>Include all medications, purchase history, and settings</li>
              <li>File naming includes date stamp for easy organization</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">Import Data</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
              <li>Restore from previous backups</li>
              <li>Transfer data between devices</li>
              <li>Validate file format before importing</li>
            </ul>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Privacy & Security</h4>
              <p className="text-green-700">
                Prescription Pro stores all data locally on your device. Your medication information remains private and secure. 
                Use the biometric authentication feature for additional security, and enable automatic backups to prevent data loss.
              </p>
            </div>
          </div>
        )

      case 'best-practices':
        return (
          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Best Practices</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Regular Updates</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
              <li>Update medication quantities when you receive new prescriptions</li>
              <li>Record purchases immediately to maintain accurate cost tracking</li>
              <li>Review and update medication timing as prescribed</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">Stock Management</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
              <li>Check the Reports section weekly for low stock alerts</li>
              <li>Plan pharmacy visits when medications show 7 days or less remaining</li>
              <li>Monitor repeat counts to schedule doctor visits for new prescriptions</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">Cost Tracking</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
              <li>Enter accurate purchase amounts and dates</li>
              <li>Use the manual yearly total override only when necessary</li>
              <li>Review monthly spending trends to budget effectively</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">Data Maintenance</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Export your data monthly as a backup</li>
              <li>Keep doctor and pharmacy information up to date</li>
              <li>Archive inactive medications rather than deleting them</li>
            </ul>

            <div className="bg-red-50 p-4 rounded-lg mt-6">
              <h4 className="font-semibold text-red-800 mb-2">Important Note</h4>
              <p className="text-red-700">
                This application is designed to assist with medication management but does not replace professional medical advice. 
                Always consult with your healthcare providers regarding your medications and treatment plans.
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Prescription Pro User Guide</h1>
        <p className="text-gray-600 mt-2">Complete guide to managing your medications effectively</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1 sticky top-4">
            {sections.map((section) => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeSection === section.id
                      ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-500'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {section.title}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  )
}

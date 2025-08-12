import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMedicationStore } from '../store/medicationStore'
import { Plus, Search, Filter, Edit, Trash2, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'

export function Medications() {
  const { medications, doctors, pharmacies, deleteMedication } = useMedicationStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'low'>('all')

  const filteredMedications = medications.filter(medication => {
    const matchesSearch = medication.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'active' && medication.isActive) ||
      (filterStatus === 'inactive' && !medication.isActive) ||
      (filterStatus === 'low' && medication.currentQuantity <= 7)
    
    return matchesSearch && matchesFilter
  })

  const getDoctorName = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId)
    return doctor?.name || 'Unknown Doctor'
  }

  const getPharmacyName = (pharmacyId: string) => {
    const pharmacy = pharmacies.find(p => p.id === pharmacyId)
    return pharmacy?.name || 'Unknown Pharmacy'
  }

  const getStatusBadge = (medication: any) => {
    if (!medication.isActive) {
      return <span className="status-badge bg-gray-100 text-gray-800">Inactive</span>
    }
    if (medication.currentQuantity <= 7) {
      return <span className="status-badge status-low">Low Stock</span>
    }
    return <span className="status-badge status-active">Active</span>
  }

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      deleteMedication(id)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medications</h1>
          <p className="text-gray-600">Manage your prescription medications</p>
        </div>
        <div className="flex-shrink-0">
          <Link
            to="/medications/add"
            className="btn-primary inline-flex items-center whitespace-nowrap"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Medication
          </Link>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search medications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="input-field w-auto min-w-0"
          >
            <option value="all">All Medications</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
            <option value="low">Low Stock</option>
          </select>
        </div>
      </div>

      {/* Medications Grid */}
      {filteredMedications.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMedications.map((medication) => (
            <div key={medication.id} className="medication-card">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{medication.name}</h3>
                  <p className="text-sm text-gray-600">{medication.dosage} {medication.form}</p>
                </div>
                <div className="flex-shrink-0 ml-2">
                  {getStatusBadge(medication)}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Frequency:</span>
                  <span className="text-gray-900">{medication.frequency}x daily</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Current Stock:</span>
                  <span className={`font-medium ${medication.currentQuantity <= 7 ? 'text-red-600' : 'text-gray-900'}`}>
                    {medication.currentQuantity}
                    {medication.currentQuantity <= 7 && (
                      <AlertTriangle className="inline h-4 w-4 ml-1" />
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Expires:</span>
                  <span className="text-gray-900">{format(new Date(medication.expiryDate), 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Doctor:</span>
                  <span className="text-gray-900 truncate ml-2">{getDoctorName(medication.doctorId)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Pharmacy:</span>
                  <span className="text-gray-900 truncate ml-2">{getPharmacyName(medication.pharmacyId)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <span className="text-sm text-gray-500">
                  {medication.repeatsRemaining} repeats left
                </span>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/medications/edit/${medication.id}`}
                    className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(medication.id, medication.name)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No medications found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by adding your first medication.'
            }
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <div className="mt-6">
              <Link to="/medications/add" className="btn-primary inline-flex items-center whitespace-nowrap">
                <Plus className="h-5 w-5 mr-2" />
                Add Medication
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { useMedicationStore } from '../store/medicationStore'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Edit, Trash2, Phone, Mail, MapPin, Building2, Globe } from 'lucide-react'
import toast from 'react-hot-toast'

const pharmacySchema = z.object({
  name: z.string().min(1, 'Pharmacy name is required'),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  notes: z.string().optional(),
})

type PharmacyFormData = z.infer<typeof pharmacySchema>

export function Pharmacies() {
  const { pharmacies, addPharmacy, updatePharmacy, deletePharmacy, medications } = useMedicationStore()
  const [isAddingPharmacy, setIsAddingPharmacy] = useState(false)
  const [editingPharmacy, setEditingPharmacy] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<PharmacyFormData>({
    resolver: zodResolver(pharmacySchema),
  })

  const onSubmit = async (data: PharmacyFormData) => {
    try {
      if (editingPharmacy) {
        updatePharmacy(editingPharmacy, data)
        toast.success('Pharmacy updated successfully!')
        setEditingPharmacy(null)
      } else {
        addPharmacy(data)
        toast.success('Pharmacy added successfully!')
        setIsAddingPharmacy(false)
      }
      reset()
    } catch (error) {
      toast.error('Failed to save pharmacy. Please try again.')
    }
  }

  const handleEdit = (pharmacy: any) => {
    setEditingPharmacy(pharmacy.id)
    setIsAddingPharmacy(true)
    reset(pharmacy)
  }

  const handleDelete = (id: string, name: string) => {
    const medicationsWithPharmacy = medications.filter(med => med.pharmacyId === id)
    
    if (medicationsWithPharmacy.length > 0) {
      toast.error(`Cannot delete ${name}. They are associated with ${medicationsWithPharmacy.length} medication(s).`)
      return
    }

    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      deletePharmacy(id)
      toast.success('Pharmacy deleted successfully!')
    }
  }

  const handleCancel = () => {
    setIsAddingPharmacy(false)
    setEditingPharmacy(null)
    reset()
  }

  const getMedicationCount = (pharmacyId: string) => {
    return medications.filter(med => med.pharmacyId === pharmacyId).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pharmacies</h1>
          <p className="text-gray-600">Manage your preferred pharmacies</p>
        </div>
        {!isAddingPharmacy && (
          <div className="flex-shrink-0">
            <button
              onClick={() => setIsAddingPharmacy(true)}
              className="btn-primary inline-flex items-center whitespace-nowrap"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Pharmacy
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Pharmacy Form */}
      {isAddingPharmacy && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingPharmacy ? 'Edit Pharmacy' : 'Add New Pharmacy'}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Pharmacy Name *</label>
                <input
                  type="text"
                  {...register('name')}
                  className="input-field"
                  placeholder="CVS Pharmacy"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="label">Phone Number *</label>
                <input
                  type="tel"
                  {...register('phone')}
                  className="input-field"
                  placeholder="(555) 123-4567"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  {...register('email')}
                  className="input-field"
                  placeholder="pharmacy@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="label">Website</label>
                <input
                  type="url"
                  {...register('website')}
                  className="input-field"
                  placeholder="https://www.pharmacy.com"
                />
                {errors.website && (
                  <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="label">Address *</label>
              <textarea
                {...register('address')}
                rows={2}
                className="input-field"
                placeholder="123 Main St, City, State 12345"
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
              )}
            </div>

            <div>
              <label className="label">Notes</label>
              <textarea
                {...register('notes')}
                rows={3}
                className="input-field"
                placeholder="Any additional notes about this pharmacy..."
              />
            </div>

            <div className="flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={handleCancel}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary inline-flex items-center whitespace-nowrap"
              >
                {isSubmitting ? (
                  <>
                    <div className="loading-spinner mr-2" />
                    {editingPharmacy ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5 mr-2" />
                    {editingPharmacy ? 'Update Pharmacy' : 'Add Pharmacy'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Pharmacies List */}
      {pharmacies.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pharmacies.map((pharmacy) => (
            <div key={pharmacy.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center min-w-0 flex-1">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-3 min-w-0 flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{pharmacy.name}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(pharmacy)}
                    className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(pharmacy.id, pharmacy.name)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{pharmacy.phone}</span>
                </div>
                {pharmacy.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{pharmacy.email}</span>
                  </div>
                )}
                {pharmacy.website && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Globe className="h-4 w-4 mr-2 flex-shrink-0" />
                    <a 
                      href={pharmacy.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 truncate"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
                <div className="flex items-start text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="break-words">{pharmacy.address}</span>
                </div>
              </div>

              {pharmacy.notes && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-600 break-words">{pharmacy.notes}</p>
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {getMedicationCount(pharmacy.id)} medication(s)
                  </span>
                  <span className="text-xs text-gray-400">
                    Added {new Date(pharmacy.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !isAddingPharmacy && (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <Building2 className="h-12 w-12" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No pharmacies added</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your preferred pharmacy.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setIsAddingPharmacy(true)}
                className="btn-primary inline-flex items-center whitespace-nowrap"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Pharmacy
              </button>
            </div>
          </div>
        )
      )}
    </div>
  )
}

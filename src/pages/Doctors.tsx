import { useState } from 'react'
import { useMedicationStore } from '../store/medicationStore'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Edit, Trash2, Phone, Mail, MapPin, Stethoscope, Calendar, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

const doctorSchema = z.object({
  name: z.string().min(1, 'Doctor name is required'),
  specialty: z.string().min(1, 'Specialty is required'),
  phone: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  address: z.string().min(1, 'Address is required'),
  bookingUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  mobileAppName: z.string().optional(),
  notes: z.string().optional(),
})

type DoctorFormData = z.infer<typeof doctorSchema>

export function Doctors() {
  const { doctors, addDoctor, updateDoctor, deleteDoctor, medications } = useMedicationStore()
  const [isAddingDoctor, setIsAddingDoctor] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<DoctorFormData>({
    resolver: zodResolver(doctorSchema),
  })

  const onSubmit = async (data: DoctorFormData) => {
    try {
      if (editingDoctor) {
        updateDoctor(editingDoctor, data)
        toast.success('Doctor updated successfully!')
        setEditingDoctor(null)
      } else {
        addDoctor(data)
        toast.success('Doctor added successfully!')
        setIsAddingDoctor(false)
      }
      reset()
    } catch (error) {
      toast.error('Failed to save doctor. Please try again.')
    }
  }

  const handleEdit = (doctor: any) => {
    setEditingDoctor(doctor.id)
    setIsAddingDoctor(true)
    reset(doctor)
  }

  const handleDelete = (id: string, name: string) => {
    const medicationsWithDoctor = medications.filter(med => med.doctorId === id)
    
    if (medicationsWithDoctor.length > 0) {
      toast.error(`Cannot delete ${name}. They are associated with ${medicationsWithDoctor.length} medication(s).`)
      return
    }

    if (window.confirm(`Are you sure you want to delete Dr. ${name}?`)) {
      deleteDoctor(id)
      toast.success('Doctor deleted successfully!')
    }
  }

  const handleCancel = () => {
    setIsAddingDoctor(false)
    setEditingDoctor(null)
    reset()
  }

  const getMedicationCount = (doctorId: string) => {
    return medications.filter(med => med.doctorId === doctorId).length
  }

  const handleBookingClick = (doctor: any) => {
    if (doctor.bookingUrl) {
      window.open(doctor.bookingUrl, '_blank')
    } else if (doctor.mobileAppName) {
      // Try to open mobile app (this would work on mobile devices)
      const appUrl = `${doctor.mobileAppName.toLowerCase()}://`
      window.open(appUrl, '_blank')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Doctors</h1>
          <p className="text-gray-600">Manage your healthcare providers</p>
        </div>
        {!isAddingDoctor && (
          <div className="flex-shrink-0">
            <button
              onClick={() => setIsAddingDoctor(true)}
              className="btn-primary inline-flex items-center whitespace-nowrap"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Doctor
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Doctor Form */}
      {isAddingDoctor && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Doctor Name *</label>
                <input
                  type="text"
                  {...register('name')}
                  className="input-field"
                  placeholder="Dr. John Smith"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="label">Specialty *</label>
                <input
                  type="text"
                  {...register('specialty')}
                  className="input-field"
                  placeholder="Cardiologist"
                />
                {errors.specialty && (
                  <p className="mt-1 text-sm text-red-600">{errors.specialty.message}</p>
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
                  placeholder="doctor@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="label">Booking URL</label>
                <input
                  type="url"
                  {...register('bookingUrl')}
                  className="input-field"
                  placeholder="https://booking.example.com"
                />
                {errors.bookingUrl && (
                  <p className="mt-1 text-sm text-red-600">{errors.bookingUrl.message}</p>
                )}
              </div>

              <div>
                <label className="label">Mobile App Name</label>
                <input
                  type="text"
                  {...register('mobileAppName')}
                  className="input-field"
                  placeholder="MyHealth"
                />
              </div>
            </div>

            <div>
              <label className="label">Address *</label>
              <textarea
                {...register('address')}
                rows={2}
                className="input-field"
                placeholder="123 Medical Center Dr, City, State 12345"
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
                placeholder="Any additional notes about this doctor..."
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
                    {editingDoctor ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5 mr-2" />
                    {editingDoctor ? 'Update Doctor' : 'Add Doctor'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Doctors List */}
      {doctors.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center min-w-0 flex-1">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <Stethoscope className="h-5 w-5 text-primary-600" />
                    </div>
                  </div>
                  <div className="ml-3 min-w-0 flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{doctor.name}</h3>
                    <p className="text-sm text-gray-600 truncate">{doctor.specialty}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(doctor)}
                    className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(doctor.id, doctor.name)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{doctor.phone}</span>
                </div>
                {doctor.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{doctor.email}</span>
                  </div>
                )}
                <div className="flex items-start text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="break-words">{doctor.address}</span>
                </div>
              </div>

              {doctor.notes && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-600 break-words">{doctor.notes}</p>
                </div>
              )}

              {/* Booking Button */}
              {(doctor.bookingUrl || doctor.mobileAppName) && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => handleBookingClick(doctor)}
                    className="w-full btn-primary inline-flex items-center justify-center whitespace-nowrap"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Appointment
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </button>
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {getMedicationCount(doctor.id)} medication(s)
                  </span>
                  <span className="text-xs text-gray-400">
                    Added {new Date(doctor.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !isAddingDoctor && (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <Stethoscope className="h-12 w-12" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No doctors added</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your first healthcare provider.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setIsAddingDoctor(true)}
                className="btn-primary inline-flex items-center whitespace-nowrap"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Doctor
              </button>
            </div>
          </div>
        )
      )}
    </div>
  )
}

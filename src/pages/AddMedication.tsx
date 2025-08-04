import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMedicationStore } from '../store/medicationStore'
import { MedicationForm } from '../types'
import { ArrowLeft, Plus } from 'lucide-react'
import toast from 'react-hot-toast'

const medicationSchema = z.object({
  name: z.string().min(1, 'Medication name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  form: z.enum(['tablet', 'capsule', 'liquid', 'injection', 'cream', 'ointment', 'drops', 'inhaler', 'patch', 'suppository', 'other']),
  frequency: z.number().min(1, 'Frequency must be at least 1').max(10, 'Frequency cannot exceed 10'),
  timings: z.array(z.string()).min(1, 'At least one timing is required'),
  instructions: z.string().optional(),
  doctorId: z.string().min(1, 'Doctor is required'),
  pharmacyId: z.string().min(1, 'Pharmacy is required'),
  prescriptionDate: z.string().min(1, 'Prescription date is required'),
  expiryDate: z.string().min(1, 'Expiry date is required'),
  repeatsRemaining: z.number().min(0, 'Repeats cannot be negative'),
  totalRepeats: z.number().min(0, 'Total repeats cannot be negative'),
  quantityPerFill: z.number().min(1, 'Quantity per fill must be at least 1'),
  currentQuantity: z.number().min(0, 'Current quantity cannot be negative'),
  cost: z.number().min(0, 'Cost cannot be negative'),
  totalDispensingsPurchased: z.number().min(0, 'Total dispensings purchased cannot be negative'),
  notes: z.string().optional(),
})

type MedicationFormData = z.infer<typeof medicationSchema>

const medicationForms: { value: MedicationForm; label: string }[] = [
  { value: 'tablet', label: 'Tablet' },
  { value: 'capsule', label: 'Capsule' },
  { value: 'liquid', label: 'Liquid' },
  { value: 'injection', label: 'Injection' },
  { value: 'cream', label: 'Cream' },
  { value: 'ointment', label: 'Ointment' },
  { value: 'drops', label: 'Drops' },
  { value: 'inhaler', label: 'Inhaler' },
  { value: 'patch', label: 'Patch' },
  { value: 'suppository', label: 'Suppository' },
  { value: 'other', label: 'Other' },
]

const commonTimings = [
  'Morning',
  'Afternoon',
  'Evening',
  'Before breakfast',
  'After breakfast',
  'Before lunch',
  'After lunch',
  'Before dinner',
  'After dinner',
  'Bedtime',
  'With food',
  'Without food',
  'As needed'
]

export function AddMedication() {
  const navigate = useNavigate()
  const { addMedication, doctors, pharmacies } = useMedicationStore()
  const [selectedTimings, setSelectedTimings] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch
  } = useForm<MedicationFormData>({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      frequency: 1,
      repeatsRemaining: 5,
      totalRepeats: 5,
      quantityPerFill: 30,
      currentQuantity: 30,
      cost: 0,
      totalDispensingsPurchased: 0,
      timings: [],
    }
  })

  const totalRepeats = watch('totalRepeats')
  const totalDispensingsPurchased = watch('totalDispensingsPurchased')
  const cost = watch('cost')

  // Calculate derived values
  const totalNumberOfDispensings = (totalRepeats || 0) + 1
  const remainingDispensings = totalNumberOfDispensings - (totalDispensingsPurchased || 0)
  const totalAmountForPurchase = (totalDispensingsPurchased || 0) * (cost || 0)

  const handleTimingChange = (timing: string, checked: boolean) => {
    let newTimings: string[]
    if (checked) {
      newTimings = [...selectedTimings, timing]
    } else {
      newTimings = selectedTimings.filter(t => t !== timing)
    }
    setSelectedTimings(newTimings)
    setValue('timings', newTimings)
  }

  const onSubmit = async (data: MedicationFormData) => {
    try {
      addMedication({
        ...data,
        prescriptionDate: new Date(data.prescriptionDate),
        expiryDate: new Date(data.expiryDate),
        isActive: true,
      })
      
      toast.success('Medication added successfully!')
      navigate('/medications')
    } catch (error) {
      toast.error('Failed to add medication. Please try again.')
    }
  }

  if (doctors.length === 0 || pharmacies.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Setup Required</h2>
          <p className="text-gray-600 mb-6">
            Before adding medications, you need to add at least one doctor and one pharmacy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {doctors.length === 0 && (
              <button
                onClick={() => navigate('/doctors')}
                className="btn-primary"
              >
                Add Doctor
              </button>
            )}
            {pharmacies.length === 0 && (
              <button
                onClick={() => navigate('/pharmacies')}
                className="btn-primary"
              >
                Add Pharmacy
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/medications')}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Medications
        </button>
        <h1 className="page-title">Add New Medication</h1>
        <p className="page-subtitle">Enter the details for your new prescription medication</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="label">Medication Name *</label>
              <input
                type="text"
                {...register('name')}
                className="input-field"
                placeholder="e.g., Lisinopril"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="label">Dosage *</label>
              <input
                type="text"
                {...register('dosage')}
                className="input-field"
                placeholder="e.g., 10mg"
              />
              {errors.dosage && (
                <p className="mt-1 text-sm text-red-600">{errors.dosage.message}</p>
              )}
            </div>

            <div>
              <label className="label">Form *</label>
              <select {...register('form')} className="input-field">
                <option value="">Select form</option>
                {medicationForms.map((form) => (
                  <option key={form.value} value={form.value}>
                    {form.label}
                  </option>
                ))}
              </select>
              {errors.form && (
                <p className="mt-1 text-sm text-red-600">{errors.form.message}</p>
              )}
            </div>

            <div>
              <label className="label">Frequency (times per day) *</label>
              <input
                type="number"
                min="1"
                max="10"
                {...register('frequency', { valueAsNumber: true })}
                className="input-field"
              />
              {errors.frequency && (
                <p className="mt-1 text-sm text-red-600">{errors.frequency.message}</p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <label className="label">Timing Instructions *</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-2">
              {commonTimings.map((timing) => (
                <label key={timing} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedTimings.includes(timing)}
                    onChange={(e) => handleTimingChange(timing, e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{timing}</span>
                </label>
              ))}
            </div>
            {errors.timings && (
              <p className="mt-1 text-sm text-red-600">{errors.timings.message}</p>
            )}
          </div>

          <div className="mt-6">
            <label className="label">Special Instructions</label>
            <textarea
              {...register('instructions')}
              rows={3}
              className="input-field"
              placeholder="Any special instructions for taking this medication..."
            />
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Healthcare Providers</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="label">Prescribing Doctor *</label>
              <select {...register('doctorId')} className="input-field">
                <option value="">Select doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} - {doctor.specialty}
                  </option>
                ))}
              </select>
              {errors.doctorId && (
                <p className="mt-1 text-sm text-red-600">{errors.doctorId.message}</p>
              )}
            </div>

            <div>
              <label className="label">Pharmacy *</label>
              <select {...register('pharmacyId')} className="input-field">
                <option value="">Select pharmacy</option>
                {pharmacies.map((pharmacy) => (
                  <option key={pharmacy.id} value={pharmacy.id}>
                    {pharmacy.name}
                  </option>
                ))}
              </select>
              {errors.pharmacyId && (
                <p className="mt-1 text-sm text-red-600">{errors.pharmacyId.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Prescription Details</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="label">Prescription Date *</label>
              <input
                type="date"
                {...register('prescriptionDate')}
                className="input-field"
              />
              {errors.prescriptionDate && (
                <p className="mt-1 text-sm text-red-600">{errors.prescriptionDate.message}</p>
              )}
            </div>

            <div>
              <label className="label">Expiry Date *</label>
              <input
                type="date"
                {...register('expiryDate')}
                className="input-field"
              />
              {errors.expiryDate && (
                <p className="mt-1 text-sm text-red-600">{errors.expiryDate.message}</p>
              )}
            </div>

            <div>
              <label className="label">Repeats Remaining *</label>
              <input
                type="number"
                min="0"
                {...register('repeatsRemaining', { valueAsNumber: true })}
                className="input-field"
              />
              {errors.repeatsRemaining && (
                <p className="mt-1 text-sm text-red-600">{errors.repeatsRemaining.message}</p>
              )}
            </div>

            <div>
              <label className="label">Total Repeats *</label>
              <input
                type="number"
                min="0"
                {...register('totalRepeats', { valueAsNumber: true })}
                className="input-field"
              />
              {errors.totalRepeats && (
                <p className="mt-1 text-sm text-red-600">{errors.totalRepeats.message}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="label">Total Number of Dispensings</label>
              <input
                type="number"
                value={totalNumberOfDispensings}
                className="input-field bg-gray-100"
                disabled
                readOnly
              />
              <p className="mt-1 text-sm text-gray-500">Automatically calculated: Total Repeats + 1</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quantity & Cost</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="label">Quantity per Fill *</label>
              <input
                type="number"
                min="1"
                {...register('quantityPerFill', { valueAsNumber: true })}
                className="input-field"
              />
              {errors.quantityPerFill && (
                <p className="mt-1 text-sm text-red-600">{errors.quantityPerFill.message}</p>
              )}
            </div>

            <div>
              <label className="label">Current Quantity *</label>
              <input
                type="number"
                min="0"
                {...register('currentQuantity', { valueAsNumber: true })}
                className="input-field"
              />
              {errors.currentQuantity && (
                <p className="mt-1 text-sm text-red-600">{errors.currentQuantity.message}</p>
              )}
            </div>

            <div>
              <label className="label">Cost per Fill (A$)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                {...register('cost', { valueAsNumber: true })}
                className="input-field"
                placeholder="0.00"
              />
              {errors.cost && (
                <p className="mt-1 text-sm text-red-600">{errors.cost.message}</p>
              )}
            </div>

            <div>
              <label className="label">Total Dispensings Purchased</label>
              <input
                type="number"
                min="0"
                max={totalNumberOfDispensings}
                {...register('totalDispensingsPurchased', { valueAsNumber: true })}
                className="input-field"
                placeholder="0"
              />
              {errors.totalDispensingsPurchased && (
                <p className="mt-1 text-sm text-red-600">{errors.totalDispensingsPurchased.message}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Remaining dispensings: {remainingDispensings}
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className="label">Total Amount For This Purchase</label>
              <input
                type="text"
                value={`A$${totalAmountForPurchase.toFixed(2)}`}
                className="input-field bg-gray-100"
                disabled
                readOnly
              />
              <p className="mt-1 text-sm text-gray-500">
                Automatically calculated: Total Dispensings Purchased × Cost per Fill
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Notes</h2>
          <textarea
            {...register('notes')}
            rows={4}
            className="input-field"
            placeholder="Any additional notes about this medication..."
          />
        </div>

        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/medications')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary inline-flex items-center"
          >
            {isSubmitting ? (
              <>
                <div className="loading-spinner mr-2" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="h-5 w-5 mr-2" />
                Add Medication
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

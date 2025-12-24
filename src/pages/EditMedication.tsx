import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMedicationStore } from '../store/medicationStore'
import { MedicationForm } from '../types'
import { ArrowLeft, Save, Edit3, Check, X, Calculator, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

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
  purchaseDate: z.string().min(1, 'Purchase date is required'), // New field
  isActive: z.boolean(),
  notes: z.string().optional(),
  yearlyTotalCost: z.number().min(0, 'Yearly total cost cannot be negative').default(0),
  lastYearlyResetDate: z.string().optional(),
})

// Helper function to get current year total and check if reset is needed
const getCurrentYearlyTotal = (medication: any) => {
  const currentYear = new Date().getFullYear()
  const lastResetYear = medication.lastYearlyResetDate 
    ? new Date(medication.lastYearlyResetDate).getFullYear()
    : currentYear - 1 // If no reset date, assume it needs reset

  // If we're in a new year, reset the total
  if (currentYear > lastResetYear) {
    return 0
  }
  
  return medication.yearlyTotalCost || 0
}

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

export function EditMedication() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { getMedication, updateMedication, addPurchaseHistory, doctors, pharmacies } = useMedicationStore()
  const [selectedTimings, setSelectedTimings] = useState<string[]>([])
  const [baseYearlyTotal, setBaseYearlyTotal] = useState<number>(0)
  
  // New state for yearly total editing
  const [isEditingYearlyTotal, setIsEditingYearlyTotal] = useState(false)
  const [manualYearlyTotal, setManualYearlyTotal] = useState<string>('')
  const [useManualYearlyTotal, setUseManualYearlyTotal] = useState(false)
  
  const medication = id ? getMedication(id) : null

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
    watch
  } = useForm<MedicationFormData>({
    resolver: zodResolver(medicationSchema),
  })

  const totalRepeats = watch('totalRepeats')
  const totalDispensingsPurchased = watch('totalDispensingsPurchased')
  const cost = watch('cost')
  const purchaseDate = watch('purchaseDate')

  // Calculate derived values
  const totalNumberOfDispensings = (totalRepeats || 0) + 1
  const remainingDispensings = totalNumberOfDispensings - (totalDispensingsPurchased || 0)
  const totalAmountForPurchase = (totalDispensingsPurchased || 0) * (cost || 0)

  // Calculate the yearly total to display
  const calculatedYearlyTotal = baseYearlyTotal + totalAmountForPurchase
  const displayYearlyTotal = useManualYearlyTotal 
    ? parseFloat(manualYearlyTotal) || 0 
    : calculatedYearlyTotal

  useEffect(() => {
    if (medication) {
      const formData = {
        ...medication,
        prescriptionDate: format(new Date(medication.prescriptionDate), 'yyyy-MM-dd'),
        expiryDate: format(new Date(medication.expiryDate), 'yyyy-MM-dd'),
        purchaseDate: format(new Date(), 'yyyy-MM-dd'), // Default to today's date
        yearlyTotalCost: medication.yearlyTotalCost || 0,
        lastYearlyResetDate: medication.lastYearlyResetDate || new Date().toISOString(),
        cost: 0, // Always start with cost at 0
      }
      reset(formData)
      setSelectedTimings(medication.timings)
      
      const yearlyTotal = getCurrentYearlyTotal(medication)
      setBaseYearlyTotal(yearlyTotal)
      setManualYearlyTotal(yearlyTotal.toString())
    }
  }, [medication, reset])

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

  const handleEditYearlyTotal = () => {
    setIsEditingYearlyTotal(true)
    setManualYearlyTotal(displayYearlyTotal.toString())
  }

  const handleSaveYearlyTotal = () => {
    const value = parseFloat(manualYearlyTotal)
    if (isNaN(value) || value < 0) {
      toast.error('Please enter a valid amount')
      return
    }
    setUseManualYearlyTotal(true)
    setIsEditingYearlyTotal(false)
    toast.success('Yearly total updated')
  }

  const handleCancelYearlyTotal = () => {
    setIsEditingYearlyTotal(false)
    setManualYearlyTotal(displayYearlyTotal.toString())
  }

  const handleUseCalculatedTotal = () => {
    setUseManualYearlyTotal(false)
    setManualYearlyTotal(calculatedYearlyTotal.toString())
    setIsEditingYearlyTotal(false)
    toast.success('Switched to calculated total')
  }

  const onSubmit = async (data: MedicationFormData) => {
    if (!id) return

    try {
      const currentYear = new Date().getFullYear()

      // Use manual total if set, otherwise use calculated total
      const finalYearlyTotal = useManualYearlyTotal 
        ? parseFloat(manualYearlyTotal) || 0
        : calculatedYearlyTotal

      // Add purchase history if there's an amount to record
      if (totalAmountForPurchase > 0 && data.purchaseDate) {
        addPurchaseHistory({
          medicationId: id,
          amount: totalAmountForPurchase,
          purchaseDate: data.purchaseDate,
        })
      }

      updateMedication(id, {
        ...data,
        prescriptionDate: new Date(data.prescriptionDate),
        expiryDate: new Date(data.expiryDate),
        yearlyTotalCost: finalYearlyTotal,
        lastYearlyResetDate: new Date(currentYear, 0, 1).toISOString(),
        cost: 0, // Reset cost to 0 after saving
      })
      
      // Reset the cost field in the form to 0 after successful save
      setValue('cost', 0)
      
      toast.success('Medication updated successfully!')
      navigate('/medications')
    } catch (error) {
      toast.error('Failed to update medication. Please try again.')
    }
  }

  if (!medication) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Medication Not Found</h2>
          <p className="text-gray-600 mb-6">
            The medication you're looking for doesn't exist or may have been deleted.
          </p>
          <button
            onClick={() => navigate('/medications')}
            className="btn-primary"
          >
            Back to Medications
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </button>
        <h1 className="page-title">Edit Medication</h1>
        <p className="page-subtitle">Update the details for {medication.name}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information Section */}
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

        {/* Healthcare Providers Section */}
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

        {/* Prescription Details Section */}
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
              <label className="label">Repeats Remaining as per the last Repeat Authorisation *</label>
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
              <label className="label">Total Repeats as per the Doctors Script *</label>
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

        {/* Quantity & Cost Section */}
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
              <label className="label">Cost per Fill ($)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-700 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  {...register('cost', { valueAsNumber: true })}
                  className="input-field pl-7"
                  placeholder="0.00"
                />
              </div>
              {errors.cost && (
                <p className="mt-1 text-sm text-red-600">{errors.cost.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                This field resets to $0 after Saving Changes.
              </p>
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
                Remaining dispensings: {watch('repeatsRemaining') || 0}
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className="label">Total Amount For This Purchase</label>
              <input
                type="text"
                value={`${totalAmountForPurchase.toFixed(2)}`}
                className="input-field bg-gray-100"
                disabled
                readOnly
              />
              <p className="mt-1 text-sm text-gray-500">
                Automatically calculated: Total Dispensings Purchased × Cost per Fill
              </p>
            </div>

            {/* NEW: Purchase Date Field */}
            <div className="sm:col-span-2">
              <label className="label">Medication Purchase Date *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  {...register('purchaseDate')}
                  className="input-field pl-10"
                />
              </div>
              {errors.purchaseDate && (
                <p className="mt-1 text-sm text-red-600">{errors.purchaseDate.message}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                This date will be used to track your monthly spending on the Reports chart.
              </p>
            </div>

            {/* Updated Yearly total section with editing capability */}
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <label className="label mb-0">Total Amount For This Medication In This Year</label>
                <div className="flex items-center gap-2">
                  {!useManualYearlyTotal && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      <Calculator className="h-3 w-3 mr-1" />
                      Auto-calculated
                    </span>
                  )}
                  {useManualYearlyTotal && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      <Edit3 className="h-3 w-3 mr-1" />
                      Manual
                    </span>
                  )}
                </div>
              </div>
              
              <div className="relative">
                {isEditingYearlyTotal ? (
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-700 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={manualYearlyTotal}
                        onChange={(e) => setManualYearlyTotal(e.target.value)}
                        className="input-field pl-7"
                        placeholder="0.00"
                        autoFocus
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSaveYearlyTotal}
                      className="flex items-center justify-center w-10 h-10 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors"
                      title="Save manual total"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelYearlyTotal}
                      className="flex items-center justify-center w-10 h-10 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                      title="Cancel editing"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={`${displayYearlyTotal.toFixed(2)}`}
                      className={`input-field flex-1 ${useManualYearlyTotal ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'}`}
                      disabled
                      readOnly
                    />
                    <button
                      type="button"
                      onClick={handleEditYearlyTotal}
                      className="flex items-center justify-center w-10 h-10 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                      title="Edit yearly total manually"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    {useManualYearlyTotal && (
                      <button
                        type="button"
                        onClick={handleUseCalculatedTotal}
                        className="flex items-center justify-center w-10 h-10 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                        title="Switch back to calculated total"
                      >
                        <Calculator className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              <div className="mt-2 space-y-1">
                {useManualYearlyTotal ? (
                  <p className="text-sm text-blue-600">
                    Using manual total: ${displayYearlyTotal.toFixed(2)}
                  </p>
                ) : (
                  <p className="text-sm text-green-600">
                    Previous total: ${baseYearlyTotal.toFixed(2)} + This purchase: ${totalAmountForPurchase.toFixed(2)}
                  </p>
                )}
                <p className="text-sm text-gray-500">
                  Resets to $0.00 on January 1st each year. Click the edit icon to manually adjust if needed.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Status & Notes Section */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Status & Notes</h2>
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('isActive')}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">Medication is active</span>
            </label>
          </div>
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
            onClick={() => navigate(-1)}
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
                Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

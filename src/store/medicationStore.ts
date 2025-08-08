import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Medication, Doctor, Pharmacy, Reminder, MedicationLog, FinancialRecord, DailyMedicationTaken } from '../types'

interface MedicationStore {
  medications: Medication[]
  doctors: Doctor[]
  pharmacies: Pharmacy[]
  reminders: Reminder[]
  logs: MedicationLog[]
  financialRecords: FinancialRecord[]
  dailyMedicationTaken: DailyMedicationTaken[]
  
  // Medication actions
  addMedication: (medication: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateMedication: (id: string, updates: Partial<Medication>) => void
  deleteMedication: (id: string) => void
  getMedication: (id: string) => Medication | undefined
  
  // Doctor actions
  addDoctor: (doctor: Omit<Doctor, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateDoctor: (id: string, updates: Partial<Doctor>) => void
  deleteDoctor: (id: string) => void
  
  // Pharmacy actions
  addPharmacy: (pharmacy: Omit<Pharmacy, 'id' | 'createdAt' | 'updatedAt'>) => void
  updatePharmacy: (id: string, updates: Partial<Pharmacy>) => void
  deletePharmacy: (id: string) => void
  
  // Reminder actions
  addReminder: (reminder: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateReminder: (id: string, updates: Partial<Reminder>) => void
  deleteReminder: (id: string) => void
  
  // Log actions
  addLog: (log: Omit<MedicationLog, 'id'>) => void
  
  // Financial actions
  addFinancialRecord: (record: Omit<FinancialRecord, 'id'>) => void
  
  // Daily medication tracking
  markMedicationTaken: (medicationId: string, timing: string, date: string) => void
  getDailyMedicationStatus: (medicationId: string, date: string) => string[]
  
  // Auto-reduce stock daily
  processDailyStockReduction: () => void
}

const generateId = () => Math.random().toString(36).substr(2, 9)

export const useMedicationStore = create<MedicationStore>()(
  persist(
    (set, get) => ({
      medications: [],
      doctors: [],
      pharmacies: [],
      reminders: [],
      logs: [],
      financialRecords: [],
      dailyMedicationTaken: [],
      
      addMedication: (medication) => {
        const now = new Date()
        const newMedication: Medication = {
          ...medication,
          id: generateId(),
          totalDispensingsPurchased: medication.totalDispensingsPurchased || 0,
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({
          medications: [...state.medications, newMedication]
        }))
      },
      
      updateMedication: (id, updates) => {
        set((state) => ({
          medications: state.medications.map((med) =>
            med.id === id ? { ...med, ...updates, updatedAt: new Date() } : med
          )
        }))
      },
      
      deleteMedication: (id) => {
        set((state) => ({
          medications: state.medications.filter((med) => med.id !== id),
          reminders: state.reminders.filter((reminder) => reminder.medicationId !== id),
          logs: state.logs.filter((log) => log.medicationId !== id),
          financialRecords: state.financialRecords.filter((record) => record.medicationId !== id),
          dailyMedicationTaken: state.dailyMedicationTaken.filter((record) => record.medicationId !== id),
        }))
      },
      
      getMedication: (id) => {
        return get().medications.find((med) => med.id === id)
      },
      
      addDoctor: (doctor) => {
        const now = new Date()
        const newDoctor: Doctor = {
          ...doctor,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({
          doctors: [...state.doctors, newDoctor]
        }))
      },
      
      updateDoctor: (id, updates) => {
        set((state) => ({
          doctors: state.doctors.map((doctor) =>
            doctor.id === id ? { ...doctor, ...updates, updatedAt: new Date() } : doctor
          )
        }))
      },
      
      deleteDoctor: (id) => {
        set((state) => ({
          doctors: state.doctors.filter((doctor) => doctor.id !== id)
        }))
      },
      
      addPharmacy: (pharmacy) => {
        const now = new Date()
        const newPharmacy: Pharmacy = {
          ...pharmacy,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({
          pharmacies: [...state.pharmacies, newPharmacy]
        }))
      },
      
      updatePharmacy: (id, updates) => {
        set((state) => ({
          pharmacies: state.pharmacies.map((pharmacy) =>
            pharmacy.id === id ? { ...pharmacy, ...updates, updatedAt: new Date() } : pharmacy
          )
        }))
      },
      
      deletePharmacy: (id) => {
        set((state) => ({
          pharmacies: state.pharmacies.filter((pharmacy) => pharmacy.id !== id)
        }))
      },
      
      addReminder: (reminder) => {
        const now = new Date()
        const newReminder: Reminder = {
          ...reminder,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({
          reminders: [...state.reminders, newReminder]
        }))
      },
      
      updateReminder: (id, updates) => {
        set((state) => ({
          reminders: state.reminders.map((reminder) =>
            reminder.id === id ? { ...reminder, ...updates, updatedAt: new Date() } : reminder
          )
        }))
      },
      
      deleteReminder: (id) => {
        set((state) => ({
          reminders: state.reminders.filter((reminder) => reminder.id !== id)
        }))
      },
      
      addLog: (log) => {
        const newLog: MedicationLog = {
          ...log,
          id: generateId(),
        }
        set((state) => ({
          logs: [...state.logs, newLog]
        }))
      },
      
      addFinancialRecord: (record) => {
        const newRecord: FinancialRecord = {
          ...record,
          id: generateId(),
        }
        set((state) => ({
          financialRecords: [...state.financialRecords, newRecord]
        }))
      },
      
      markMedicationTaken: (medicationId, timing, date) => {
        const state = get()
        const existingRecord = state.dailyMedicationTaken.find(
          record => record.medicationId === medicationId && record.date === date
        )
        
        if (existingRecord) {
          set((state) => ({
            dailyMedicationTaken: state.dailyMedicationTaken.map(record =>
              record.id === existingRecord.id
                ? { ...record, timingsTaken: [...record.timingsTaken, timing] }
                : record
            )
          }))
        } else {
          const newRecord: DailyMedicationTaken = {
            id: generateId(),
            medicationId,
            date,
            timingsTaken: [timing],
            createdAt: new Date(),
          }
          set((state) => ({
            dailyMedicationTaken: [...state.dailyMedicationTaken, newRecord]
          }))
        }
        
        // Reduce medication stock
        const medication = state.medications.find(med => med.id === medicationId)
        if (medication) {
          get().updateMedication(medicationId, {
            currentQuantity: Math.max(0, medication.currentQuantity - 1)
          })
        }
      },
      
      getDailyMedicationStatus: (medicationId, date) => {
        const record = get().dailyMedicationTaken.find(
          record => record.medicationId === medicationId && record.date === date
        )
        return record ? record.timingsTaken : []
      },
      
      processDailyStockReduction: () => {
        const today = new Date().toISOString().split('T')[0]
        const state = get()
        
        state.medications.forEach(medication => {
          if (medication.isActive) {
            const takenToday = state.dailyMedicationTaken.find(
              record => record.medicationId === medication.id && record.date === today
            )
            
            // If medication wasn't taken today, still reduce stock by frequency
            if (!takenToday) {
              get().updateMedication(medication.id, {
                currentQuantity: Math.max(0, medication.currentQuantity - medication.frequency)
              })
            }
          }
        })
      },
    }),
    {
      name: 'prescription-manager-storage',
      version: 1,
    }
  )
)

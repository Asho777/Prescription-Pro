export interface Medication {
  id: string
  name: string
  dosage: string
  form: MedicationForm
  frequency: number
  timings: string[]
  instructions?: string
  doctorId: string
  pharmacyId: string
  prescriptionDate: Date
  expiryDate: Date
  repeatsRemaining: number
  totalRepeats: number
  quantityPerFill: number
  currentQuantity: number
  cost: number
  totalDispensingsPurchased: number
  isActive: boolean
  notes?: string
  yearlyTotalCost: number
  lastYearlyResetDate?: string
  createdAt: Date
  updatedAt: Date
}

export interface PurchaseHistory {
  id: string
  medicationId: string
  amount: number
  purchaseDate: string // ISO date string
  createdAt: Date
}

export interface Doctor {
  id: string
  name: string
  specialty: string
  phone: string
  email?: string
  address: string
  bookingUrl?: string
  mobileAppName?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface Pharmacy {
  id: string
  name: string
  address: string
  phone: string
  email?: string
  website?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface Reminder {
  id: string
  medicationId: string
  type: ReminderType
  time: string
  isActive: boolean
  lastTriggered?: Date
  createdAt: Date
  updatedAt: Date
}

export interface MedicationLog {
  id: string
  medicationId: string
  action: LogAction
  timestamp: Date
  quantity?: number
  notes?: string
}

export interface FinancialRecord {
  id: string
  medicationId: string
  amount: number
  date: Date
  type: 'purchase' | 'insurance_claim' | 'pbs_benefit'
  description?: string
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  password: string
  createdAt: Date
}

export interface DailyMedicationTaken {
  id: string
  medicationId: string
  date: string // YYYY-MM-DD format
  timingsTaken: string[]
  createdAt: Date
}

export type MedicationForm = 
  | 'tablet' 
  | 'capsule' 
  | 'liquid' 
  | 'injection' 
  | 'cream' 
  | 'ointment' 
  | 'drops' 
  | 'inhaler' 
  | 'patch' 
  | 'suppository'
  | 'other'

export type ReminderType = 
  | 'medication_time' 
  | 'refill_needed' 
  | 'doctor_appointment' 
  | 'prescription_expiry'

export type LogAction = 
  | 'taken' 
  | 'missed' 
  | 'refilled' 
  | 'prescribed' 
  | 'discontinued'

export interface DashboardStats {
  totalMedications: number
  activeMedications: number
  medicationsLow: number
  upcomingRefills: number
  yearlySpending: number
  adherenceRate: number
}

export interface NotificationSettings {
  medicationReminders: boolean
  refillAlerts: boolean
  appointmentReminders: boolean
  soundEnabled: boolean
  vibrationEnabled: boolean
  reminderAdvanceTime: number // minutes before
}

export interface AppSettings {
  notifications: NotificationSettings
  currency: string
  dateFormat: string
  timeFormat: '12h' | '24h'
  theme: 'light' | 'dark'
  language: string
  backupEnabled: boolean
  biometricAuth: boolean
}

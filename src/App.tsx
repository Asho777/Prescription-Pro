import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useUserStore } from './store/userStore'
import { useMedicationStore } from './store/medicationStore'
import { Layout } from './components/Layout'
import { AuthContainer } from './components/AuthContainer'
import { Dashboard } from './pages/Dashboard'
import { Medications } from './pages/Medications'
import { AddMedication } from './pages/AddMedication'
import { EditMedication } from './pages/EditMedication'
import { Reminders } from './pages/Reminders'
import { Reports } from './pages/Reports'
import { Settings } from './pages/Settings'
import { Doctors } from './pages/Doctors'
import { Pharmacies } from './pages/Pharmacies'

function App() {
  const { isAuthenticated } = useUserStore()
  const { processDailyStockReduction } = useMedicationStore()

  useEffect(() => {
    // Process daily stock reduction on app load
    processDailyStockReduction()
    
    // Set up daily stock reduction at midnight
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    
    const msUntilMidnight = tomorrow.getTime() - now.getTime()
    
    const timeoutId = setTimeout(() => {
      processDailyStockReduction()
      
      // Set up daily interval after first midnight
      setInterval(processDailyStockReduction, 24 * 60 * 60 * 1000)
    }, msUntilMidnight)
    
    return () => clearTimeout(timeoutId)
  }, [processDailyStockReduction])

  if (!isAuthenticated) {
    return <AuthContainer />
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/medications" element={<Medications />} />
        <Route path="/medications/add" element={<AddMedication />} />
        <Route path="/medications/edit/:id" element={<EditMedication />} />
        <Route path="/reminders" element={<Reminders />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/pharmacies" element={<Pharmacies />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  )
}

export default App

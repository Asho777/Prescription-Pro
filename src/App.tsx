import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useUserStore } from './store/userStore'
import { useMedicationStore } from './store/medicationStore'
import { Layout } from './components/Layout'
import { AuthContainer } from './components/AuthContainer'
import { Home } from './pages/Home'
import { Dashboard } from './pages/Dashboard'
import { Medications } from './pages/Medications'
import { AddMedication } from './pages/AddMedication'
import { EditMedication } from './pages/EditMedication'
import { Reminders } from './pages/Reminders'
import { Reports } from './pages/Reports'
import { Settings } from './pages/Settings'
import { Doctors } from './pages/Doctors'
import { Pharmacies } from './pages/Pharmacies'
import { WidgetDemo } from './pages/WidgetDemo'

function App() {
  const { isAuthenticated } = useUserStore()
  const { processDailyStockReduction } = useMedicationStore()

useEffect(() => {
  // Set up daily stock reduction at midnight (but don't run immediately on app load)
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
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/medications" element={<Medications />} />
        <Route path="/medications/add" element={<AddMedication />} />
        <Route path="/medications/edit/:id" element={<EditMedication />} />
        <Route path="/reminders" element={<Reminders />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/pharmacies" element={<Pharmacies />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/widget-demo" element={<WidgetDemo />} />
      </Routes>
    </Layout>
  )
}

export default App

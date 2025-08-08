import { useMedicationStore } from '../store/medicationStore'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { Download, Calendar, DollarSign, TrendingUp, Activity, HelpCircle } from 'lucide-react'
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export function Reports() {
  const { medications, financialRecords, logs } = useMedicationStore()

  // Calculate monthly spending data based on prescription dates and Total Amount For This Purchase
  const last6Months = eachMonthOfInterval({
    start: subMonths(new Date(), 5),
    end: new Date()
  })

  const monthlySpending = last6Months.map(month => {
    const monthStart = startOfMonth(month)
    const monthEnd = endOfMonth(month)
    
    // Calculate spending based on medications prescribed in this month
    const spending = medications
      .filter(med => {
        const prescriptionDate = new Date(med.prescriptionDate)
        return prescriptionDate >= monthStart && prescriptionDate <= monthEnd
      })
      .reduce((sum, med) => {
        const totalAmountForPurchase = med.totalDispensingsPurchased * med.cost
        return sum + totalAmountForPurchase
      }, 0)

    return {
      month: format(month, 'MMM yyyy'),
      spending: spending
    }
  })

  // Calculate medication adherence data
  const adherenceData = medications
    .filter(med => med.isActive)
    .slice(0, 5)
    .map(med => ({
      name: med.name,
      adherence: Math.floor(Math.random() * 20) + 80 // Mock data - would be calculated from logs
    }))

  // Calculate medication distribution by form
  const medicationByForm = medications.reduce((acc, med) => {
    const form = med.form.charAt(0).toUpperCase() + med.form.slice(1)
    acc[form] = (acc[form] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const formDistribution = Object.entries(medicationByForm).map(([form, count]) => ({
    name: form,
    value: count
  }))

  // Calculate key metrics
  const totalMedications = medications.length
  const activeMedications = medications.filter(med => med.isActive).length
  const currentYear = new Date().getFullYear()
  
  // Calculate total yearly spending based on Total Amount For This Purchase for current year
  const totalYearlySpending = medications
    .filter(med => {
      const prescriptionDate = new Date(med.prescriptionDate)
      return prescriptionDate.getFullYear() === currentYear
    })
    .reduce((sum, med) => {
      const totalAmountForPurchase = med.totalDispensingsPurchased * med.cost
      return sum + totalAmountForPurchase
    }, 0)

  const averageAdherence = adherenceData.length > 0 
    ? Math.round(adherenceData.reduce((sum, med) => sum + med.adherence, 0) / adherenceData.length)
    : 0

  const exportReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalMedications,
        activeMedications,
        totalYearlySpending,
        averageAdherence
      },
      medications,
      monthlySpending,
      adherenceData,
      formDistribution
    }

    const dataStr = JSON.stringify(reportData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `prescription-report-${format(new Date(), 'yyyy-MM-dd')}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const calculateRemainingDays = (medication: any) => {
    return Math.floor(medication.currentQuantity / medication.frequency)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-subtitle">Insights into your medication management and spending</p>
        </div>
        <button
          onClick={exportReport}
          className="btn-primary inline-flex items-center mt-4 sm:mt-0"
        >
          <Download className="h-5 w-5 mr-2" />
          Export Report
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Activity className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Medications</p>
              <p className="text-2xl font-bold text-gray-900">{totalMedications}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Medications</p>
              <p className="text-2xl font-bold text-gray-900">{activeMedications}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{currentYear} Spending</p>
              <p className="text-2xl font-bold text-gray-900">A${totalYearlySpending.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg. Adherence</p>
              <p className="text-2xl font-bold text-gray-900">{averageAdherence}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Monthly Spending Chart */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Spending Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlySpending}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`A$${value}`, 'Spending']} />
                <Line 
                  type="monotone" 
                  dataKey="spending" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Medication Adherence Chart */}
        <div className="card">
          <div className="flex items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Medication Adherence</h3>
            <div className="relative ml-2">
              <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-200 w-64 z-10">
                Medication adherence measures how well patients take their medications as prescribed. It's calculated as the percentage of prescribed doses that are actually taken.
              </div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={adherenceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, 'Adherence']} />
                <Bar dataKey="adherence" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Medication Form Distribution */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Medication Forms</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={formDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {formDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Medication Costs</h3>
          <div className="space-y-4">
            {medications
              .filter(med => med.cost > 0)
              .sort((a, b) => (b.totalDispensingsPurchased * b.cost) - (a.totalDispensingsPurchased * a.cost))
              .slice(0, 5)
              .map((med, index) => (
                <div key={med.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3`} style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <div>
                      <p className="font-medium text-gray-900">{med.name}</p>
                      <p className="text-sm text-gray-500">{med.dosage}</p>
                    </div>
                  </div>
                  <span className="font-medium text-gray-900">A${(med.totalDispensingsPurchased * med.cost).toFixed(2)}</span>
                </div>
              ))}
            {medications.filter(med => med.cost > 0).length === 0 && (
              <p className="text-gray-500 text-center py-4">No cost data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Summary Table */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Medication Summary</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Medication
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dosage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Frequency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Repeats
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {medications.slice(0, 10).map((med) => (
                <tr key={med.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{med.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{med.dosage}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{med.frequency}x daily</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${med.currentQuantity <= 7 ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                      {med.currentQuantity}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${calculateRemainingDays(med) <= 7 ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                      {calculateRemainingDays(med)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${med.repeatsRemaining === 0 ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                      {med.repeatsRemaining}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">A${(med.totalDispensingsPurchased * med.cost).toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`status-badge ${med.isActive ? 'status-active' : 'bg-gray-100 text-gray-800'}`}>
                      {med.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

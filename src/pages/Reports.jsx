import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { Calendar, TrendingUp, Pill, Clock } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function Reports() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMedications();
    }
  }, [user]);

  const fetchMedications = async () => {
    try {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setMedications(data || []);
    } catch (error) {
      console.error('Error fetching medications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMedicationClick = (medicationId) => {
    navigate(`/medications/edit/${medicationId}`);
  };

  // Medication Forms Data
  const getFormData = () => {
    const formCounts = {};
    medications.forEach(med => {
      const form = med.form || 'Unknown';
      formCounts[form] = (formCounts[form] || 0) + 1;
    });

    return Object.entries(formCounts).map(([form, count]) => ({
      name: form,
      value: count
    }));
  };

  // Monthly Medication Trends
  const getMonthlyTrends = () => {
    const last6Months = eachMonthOfInterval({
      start: subMonths(new Date(), 5),
      end: new Date()
    });

    return last6Months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const activeMeds = medications.filter(med => {
        const startDate = med.start_date ? parseISO(med.start_date) : null;
        const endDate = med.end_date ? parseISO(med.end_date) : null;
        
        if (!startDate) return false;
        
        const isActive = startDate <= monthEnd && (!endDate || endDate >= monthStart);
        return isActive;
      });

      return {
        month: format(month, 'MMM yyyy'),
        count: activeMeds.length
      };
    });
  };

  const formData = getFormData();
  const monthlyData = getMonthlyTrends();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
      </div>

      {medications.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
            <TrendingUp className="h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
          <p className="text-gray-500">Add some medications to see your reports and analytics.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Medication Forms Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Pill className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Medication Forms</h2>
            </div>
            
            <div className="h-64 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={formData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {formData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Forms Legend */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Forms Used:</h3>
              {formData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2 text-sm">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-gray-600">{entry.name}: {entry.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Trends Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Monthly Medication Trends</h2>
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Medication Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Medication Summary</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {medications.map((medication) => (
                <div key={medication.id} className="border border-gray-200 rounded-lg p-4">
                  <button
                    onClick={() => handleMedicationClick(medication.id)}
                    className="text-left w-full hover:bg-gray-50 rounded p-2 -m-2 transition-colors"
                  >
                    <h3 className="font-medium text-blue-600 hover:text-blue-800 mb-1">
                      {medication.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{medication.dosage}</p>
                    <div className="space-y-1 text-xs text-gray-500">
                      {medication.form && (
                        <p>Form: {medication.form}</p>
                      )}
                      {medication.frequency && (
                        <p>Frequency: {medication.frequency}</p>
                      )}
                      {medication.start_date && (
                        <p>Started: {format(parseISO(medication.start_date), 'MMM d, yyyy')}</p>
                      )}
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

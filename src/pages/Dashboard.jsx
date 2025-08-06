import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { format, parseISO, isToday, isTomorrow, addDays, differenceInDays, isAfter } from 'date-fns';
import { Calendar, Clock, AlertTriangle, Pill, Users, Building2, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [medications, setMedications] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [medicationsResult, doctorsResult, pharmaciesResult] = await Promise.all([
        supabase.from('medications').select('*').eq('user_id', user.id),
        supabase.from('doctors').select('*').eq('user_id', user.id),
        supabase.from('pharmacies').select('*').eq('user_id', user.id)
      ]);

      if (medicationsResult.error) throw medicationsResult.error;
      if (doctorsResult.error) throw doctorsResult.error;
      if (pharmaciesResult.error) throw pharmaciesResult.error;

      setMedications(medicationsResult.data || []);
      setDoctors(doctorsResult.data || []);
      setPharmacies(pharmaciesResult.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMedicationClick = (medicationId) => {
    navigate(`/medications/edit/${medicationId}`);
  };

  // Get today's medications (simplified - assuming all active medications are taken daily)
  const getTodaysMedications = () => {
    return medications.filter(med => {
      if (!med.start_date) return false;
      
      const startDate = parseISO(med.start_date);
      const endDate = med.end_date ? parseISO(med.end_date) : null;
      const today = new Date();
      
      const isActive = startDate <= today && (!endDate || endDate >= today);
      return isActive;
    });
  };

  // Get medications expiring soon
  const getExpiringMedications = () => {
    const today = new Date();
    return medications.filter(med => {
      if (!med.end_date) return false;
      
      const endDate = parseISO(med.end_date);
      const daysUntilExpiry = differenceInDays(endDate, today);
      
      return daysUntilExpiry >= 0 && daysUntilExpiry <= 7;
    });
  };

  const todaysMedications = getTodaysMedications();
  const expiringMedications = getExpiringMedications();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your medication overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Pill className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Medications</p>
              <p className="text-2xl font-semibold text-gray-900">{medications.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Doctors</p>
              <p className="text-2xl font-semibold text-gray-900">{doctors.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Building2 className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pharmacies</p>
              <p className="text-2xl font-semibold text-gray-900">{pharmacies.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Expiring Soon</p>
              <p className="text-2xl font-semibold text-gray-900">{expiringMedications.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Medications */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Today's Medications</h2>
          </div>
          
          {todaysMedications.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No medications scheduled for today</p>
          ) : (
            <div className="space-y-3">
              {todaysMedications.map((medication) => (
                <button
                  key={medication.id}
                  onClick={() => handleMedicationClick(medication.id)}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-blue-600 hover:text-blue-800">
                        {medication.name}
                      </h3>
                      <p className="text-sm text-gray-600">{medication.dosage}</p>
                      {medication.frequency && (
                        <p className="text-xs text-gray-500">{medication.frequency}</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Expiring Medications */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <h2 className="text-lg font-semibold text-gray-900">Expiring Soon</h2>
          </div>
          
          {expiringMedications.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No medications expiring soon</p>
          ) : (
            <div className="space-y-3">
              {expiringMedications.map((medication) => {
                const endDate = parseISO(medication.end_date);
                const daysLeft = differenceInDays(endDate, new Date());
                
                return (
                  <div key={medication.id} className="p-3 rounded-lg border border-yellow-200 bg-yellow-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{medication.name}</h3>
                        <p className="text-sm text-gray-600">{medication.dosage}</p>
                      </div>
                      <span className="text-xs font-medium text-yellow-800 bg-yellow-200 px-2 py-1 rounded">
                        {daysLeft === 0 ? 'Expires today' : `${daysLeft} days left`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/medications')}
            className="p-4 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Pill className="h-6 w-6 text-blue-600 mb-2" />
            <h3 className="font-medium text-gray-900">Manage Medications</h3>
            <p className="text-sm text-gray-500">Add, edit, or view your medications</p>
          </button>
          
          <button
            onClick={() => navigate('/doctors')}
            className="p-4 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Users className="h-6 w-6 text-green-600 mb-2" />
            <h3 className="font-medium text-gray-900">Manage Doctors</h3>
            <p className="text-sm text-gray-500">Keep track of your healthcare providers</p>
          </button>
          
          <button
            onClick={() => navigate('/reports')}
            className="p-4 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <TrendingUp className="h-6 w-6 text-purple-600 mb-2" />
            <h3 className="font-medium text-gray-900">View Reports</h3>
            <p className="text-sm text-gray-500">Analyze your medication trends</p>
          </button>
        </div>
      </div>
    </div>
  );
}

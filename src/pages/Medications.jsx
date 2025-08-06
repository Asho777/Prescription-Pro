import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Edit, Trash2, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { format, parseISO, differenceInDays, isAfter } from 'date-fns';
import MedicationModal from '../components/MedicationModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

export default function Medications() {
  const { user } = useAuth();
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMedication, setEditingMedication] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, medication: null });

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
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      setMedications(data || []);
    } catch (error) {
      console.error('Error fetching medications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (medication) => {
    setEditingMedication(medication);
    setShowModal(true);
  };

  const handleDelete = (medication) => {
    setDeleteModal({ show: true, medication });
  };

  const confirmDelete = async () => {
    try {
      const { error } = await supabase
        .from('medications')
        .delete()
        .eq('id', deleteModal.medication.id);

      if (error) throw error;
      
      setMedications(medications.filter(med => med.id !== deleteModal.medication.id));
      setDeleteModal({ show: false, medication: null });
    } catch (error) {
      console.error('Error deleting medication:', error);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingMedication(null);
    fetchMedications();
  };

  const getStatusColor = (medication) => {
    if (!medication.end_date) return 'bg-green-100 text-green-800';
    
    const endDate = parseISO(medication.end_date);
    const today = new Date();
    const daysUntilEnd = differenceInDays(endDate, today);
    
    if (isAfter(today, endDate)) return 'bg-red-100 text-red-800';
    if (daysUntilEnd <= 7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (medication) => {
    if (!medication.end_date) return 'Ongoing';
    
    const endDate = parseISO(medication.end_date);
    const today = new Date();
    const daysUntilEnd = differenceInDays(endDate, today);
    
    if (isAfter(today, endDate)) return 'Expired';
    if (daysUntilEnd <= 7) return `${daysUntilEnd} days left`;
    return 'Active';
  };

  const calculateRepeatsRemaining = (medication) => {
    if (!medication.repeats_allowed || !medication.start_date) return null;
    
    const startDate = parseISO(medication.start_date);
    const today = new Date();
    const daysPassed = differenceInDays(today, startDate);
    
    // Assuming each repeat lasts 30 days (adjust based on your business logic)
    const repeatsUsed = Math.floor(daysPassed / 30);
    const remaining = Math.max(0, medication.repeats_allowed - repeatsUsed);
    
    return remaining;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Medications</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Medication
        </button>
      </div>

      {medications.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No medications found</h3>
          <p className="text-gray-500 mb-4">Get started by adding your first medication.</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            Add Medication
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {medications.map((medication) => {
            const repeatsRemaining = calculateRepeatsRemaining(medication);
            
            return (
              <div key={medication.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{medication.name}</h3>
                    <p className="text-gray-600">{medication.dosage}</p>
                    {medication.form && (
                      <p className="text-sm text-gray-500">Form: {medication.form}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(medication)}`}>
                      {getStatusText(medication)}
                    </span>
                    <button
                      onClick={() => handleEdit(medication)}
                      className="p-2 text-gray-400 hover:text-blue-600"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(medication)}
                      className="p-2 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      {medication.frequency || 'As needed'}
                    </span>
                  </div>
                  
                  {medication.start_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        Started: {format(parseISO(medication.start_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}

                  {repeatsRemaining !== null && (
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        {repeatsRemaining} repeats remaining
                      </span>
                    </div>
                  )}
                </div>

                {medication.notes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{medication.notes}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <MedicationModal
          medication={editingMedication}
          onClose={handleModalClose}
        />
      )}

      {deleteModal.show && (
        <DeleteConfirmModal
          title="Delete Medication"
          message={`Are you sure you want to delete "${deleteModal.medication?.name}"? This action cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteModal({ show: false, medication: null })}
        />
      )}
    </div>
  );
}

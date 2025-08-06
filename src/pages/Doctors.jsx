import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Edit, Trash2, Phone, Mail, MapPin } from 'lucide-react';
import DoctorModal from '../components/DoctorModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

export default function Doctors() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, doctor: null });

  useEffect(() => {
    if (user) {
      fetchDoctors();
    }
  }, [user]);

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      setDoctors(data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (doctor) => {
    setEditingDoctor(doctor);
    setShowModal(true);
  };

  const handleDelete = (doctor) => {
    setDeleteModal({ show: true, doctor });
  };

  const confirmDelete = async () => {
    try {
      const { error } = await supabase
        .from('doctors')
        .delete()
        .eq('id', deleteModal.doctor.id);

      if (error) throw error;
      
      setDoctors(doctors.filter(doc => doc.id !== deleteModal.doctor.id));
      setDeleteModal({ show: false, doctor: null });
    } catch (error) {
      console.error('Error deleting doctor:', error);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingDoctor(null);
    fetchDoctors();
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
        <h1 className="text-2xl font-bold text-gray-900">Doctors</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Doctor
        </button>
      </div>

      {doctors.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors found</h3>
          <p className="text-gray-500 mb-4">Get started by adding your first doctor.</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            Add Doctor
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{doctor.name}</h3>
                  {doctor.specialty && (
                    <p className="text-gray-600">{doctor.specialty}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(doctor)}
                    className="p-2 text-gray-400 hover:text-blue-600"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(doctor)}
                    className="p-2 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {doctor.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{doctor.phone}</span>
                  </div>
                )}
                
                {doctor.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{doctor.email}</span>
                  </div>
                )}

                {doctor.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{doctor.address}</span>
                  </div>
                )}
              </div>

              {doctor.notes && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{doctor.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <DoctorModal
          doctor={editingDoctor}
          onClose={handleModalClose}
        />
      )}

      {deleteModal.show && (
        <DeleteConfirmModal
          title="Delete Doctor"
          message={`Are you sure you want to delete "${deleteModal.doctor?.name}"? This action cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteModal({ show: false, doctor: null })}
        />
      )}
    </div>
  );
}

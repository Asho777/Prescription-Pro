import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Edit, Trash2, Phone, Mail, MapPin, Clock } from 'lucide-react';
import PharmacyModal from '../components/PharmacyModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

export default function Pharmacies() {
  const { user } = useAuth();
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPharmacy, setEditingPharmacy] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, pharmacy: null });

  useEffect(() => {
    if (user) {
      fetchPharmacies();
    }
  }, [user]);

  const fetchPharmacies = async () => {
    try {
      const { data, error } = await supabase
        .from('pharmacies')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      setPharmacies(data || []);
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (pharmacy) => {
    setEditingPharmacy(pharmacy);
    setShowModal(true);
  };

  const handleDelete = (pharmacy) => {
    setDeleteModal({ show: true, pharmacy });
  };

  const confirmDelete = async () => {
    try {
      const { error } = await supabase
        .from('pharmacies')
        .delete()
        .eq('id', deleteModal.pharmacy.id);

      if (error) throw error;
      
      setPharmacies(pharmacies.filter(pharm => pharm.id !== deleteModal.pharmacy.id));
      setDeleteModal({ show: false, pharmacy: null });
    } catch (error) {
      console.error('Error deleting pharmacy:', error);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingPharmacy(null);
    fetchPharmacies();
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
        <h1 className="text-2xl font-bold text-gray-900">Pharmacies</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Pharmacy
        </button>
      </div>

      {pharmacies.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 7h10M7 11h6m-6 4h6" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No pharmacies found</h3>
          <p className="text-gray-500 mb-4">Get started by adding your first pharmacy.</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            Add Pharmacy
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {pharmacies.map((pharmacy) => (
            <div key={pharmacy.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{pharmacy.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(pharmacy)}
                    className="p-2 text-gray-400 hover:text-blue-600"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(pharmacy)}
                    className="p-2 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {pharmacy.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{pharmacy.phone}</span>
                  </div>
                )}
                
                {pharmacy.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{pharmacy.email}</span>
                  </div>
                )}

                {pharmacy.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{pharmacy.address}</span>
                  </div>
                )}

                {pharmacy.hours && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{pharmacy.hours}</span>
                  </div>
                )}
              </div>

              {pharmacy.notes && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{pharmacy.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <PharmacyModal
          pharmacy={editingPharmacy}
          onClose={handleModalClose}
        />
      )}

      {deleteModal.show && (
        <DeleteConfirmModal
          title="Delete Pharmacy"
          message={`Are you sure you want to delete "${deleteModal.pharmacy?.name}"? This action cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteModal({ show: false, pharmacy: null })}
        />
      )}
    </div>
  );
}

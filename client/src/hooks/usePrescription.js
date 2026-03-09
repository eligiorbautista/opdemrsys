import { useState, useEffect } from 'react';
import prescriptionService from '../services/prescriptionService';

export function usePrescriptions(params = {}) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPrescriptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await prescriptionService.getAll(params);
      setPrescriptions(response.data || response);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrescriptions();
  }, [JSON.stringify(params)]);

  return {
    prescriptions,
    loading,
    error,
    refresh: loadPrescriptions
  };
}

export function useMedications() {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMedications = async () => {
      try {
        const response = await prescriptionService.getMedications();
        setMedications(response.data || response);
      } catch (err) {
        console.error('Failed to load medications:', err);
      } finally {
        setLoading(false);
      }
    };
    loadMedications();
  }, []);

  return { medications, loading };
}

export function usePrescription(id) {
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      loadPrescription();
    }
  }, [id]);

  const loadPrescription = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await prescriptionService.getById(id);
      setPrescription(response.data || response);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load prescription');
    } finally {
      setLoading(false);
    }
  };

  return {
    prescription,
    loading,
    error,
    refresh: loadPrescription
  };
}

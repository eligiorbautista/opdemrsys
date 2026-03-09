import { useState, useEffect } from 'react';
import patientService from '../services/patientService';

export function usePatients(params = {}) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const loadPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await patientService.getAll(params);
      setPatients(response.data || response);
      setPagination(response.pagination || null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const searchPatients = async (query, filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await patientService.search(query, filters);
      setPatients(response.data || response);
      setPagination(response.pagination || null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to search patients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, [JSON.stringify(params)]);

  return {
    patients,
    loading,
    error,
    pagination,
    refresh: loadPatients,
    search: searchPatients
  };
}

export function usePatient(id) {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      loadPatient();
    }
  }, [id]);

  const loadPatient = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await patientService.getById(id);
      setPatient(response.data || response);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load patient');
    } finally {
      setLoading(false);
    }
  };

  return {
    patient,
    loading,
    error,
    refresh: loadPatient
  };
}

import { useState, useEffect } from 'react';
import consultationService from '../services/consultationService';

export function useConsultations(params = {}) {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadConsultations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await consultationService.getAll(params);
      setConsultations(response.data || response);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load consultations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConsultations();
  }, [JSON.stringify(params)]);

  return {
    consultations,
    loading,
    error,
    refresh: loadConsultations
  };
}

export function useConsultation(id) {
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      loadConsultation();
    }
  }, [id]);

  const loadConsultation = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await consultationService.getById(id);
      setConsultation(response.data || response);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load consultation');
    } finally {
      setLoading(false);
    }
  };

  return {
    consultation,
    loading,
    error,
    refresh: loadConsultation
  };
}

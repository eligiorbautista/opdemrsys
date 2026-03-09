import { useState, useEffect } from 'react';
import nurseService from '../services/nurseService';

export function useNurseDocumentations(params = {}) {
  const [documentations, setDocumentations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDocumentations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await nurseService.getAll(params);
      setDocumentations(response.data || response);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load documentations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocumentations();
  }, [JSON.stringify(params)]);

  return {
    documentations,
    loading,
    error,
    refresh: loadDocumentations
  };
}

export function useNurseDocumentation(id) {
  const [documentation, setDocumentation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      loadDocumentation();
    }
  }, [id]);

  const loadDocumentation = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await nurseService.getById(id);
      setDocumentation(response.data || response);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load documentation');
    } finally {
      setLoading(false);
    }
  };

  return {
    documentation,
    loading,
    error,
    refresh: loadDocumentation
  };
}

import { useState, useEffect } from 'react';
import visitService from '../services/visitService';

export function useVisits(params = {}) {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const loadVisits = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await visitService.getAll(params);
      setVisits(response.data || response);
      setPagination(response.pagination || null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load visits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVisits();
  }, [JSON.stringify(params)]);

  return {
    visits,
    loading,
    error,
    pagination,
    refresh: loadVisits
  };
}

export function useVisit(id) {
  const [visit, setVisit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      loadVisit();
    }
  }, [id]);

  const loadVisit = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await visitService.getById(id);
      setVisit(response.data || response);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load visit');
    } finally {
      setLoading(false);
    }
  };

  const startVisit = async () => {
    try {
      const response = await visitService.startVisit(id);
      setVisit(response.data || response);
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const endVisit = async () => {
    try {
      const response = await visitService.endVisit(id);
      setVisit(response.data || response);
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  return {
    visit,
    loading,
    error,
    refresh: loadVisit,
    startVisit,
    endVisit
  };
}

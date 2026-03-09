import { useState, useEffect } from 'react';
import queueService from '../services/queueService';

export function useQueue(params = {}) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadQueue = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await queueService.getAll(params);
      setEntries(response.data || response);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
    const interval = setInterval(loadQueue, 30000);
    return () => clearInterval(interval);
  }, [JSON.stringify(params)]);

  return {
    entries,
    loading,
    error,
    refresh: loadQueue
  };
}

export function useQueueStats(params = {}) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      const response = await queueService.getStats(params);
      setStats(response.stats || {});
    } catch (err) {
      console.error('Failed to load queue stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, [JSON.stringify(params)]);

  return {
    stats,
    loading,
    refresh: loadStats
  };
}

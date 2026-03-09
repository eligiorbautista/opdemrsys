import { useState, useEffect } from 'react';
import reportService from '../services/reportService';

export function useReports() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const response = await reportService.getOverview();
        setOverview(response.overview || {});
      } catch (err) {
        console.error('Failed to load overview:', err);
      } finally {
        setLoading(false);
      }
    };
    loadOverview();
  }, []);

  return { overview, loading };
}

export function useDailySummary(date) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReport = async () => {
      try {
        const response = await reportService.getDailySummary(date);
        setReport(response.report || {});
      } catch (err) {
        console.error('Failed to load daily summary:', err);
      } finally {
        setLoading(false);
      }
    };
    if (date) {
      loadReport();
    }
  }, [date]);

  return { report, loading };
}

export function usePatientStats(startDate, endDate) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReport = async () => {
      try {
        const response = await reportService.getPatientStatistics(startDate, endDate);
        setReport(response.report || {});
      } catch (err) {
        console.error('Failed to load patient stats:', err);
      } finally {
        setLoading(false);
      }
    };
    loadReport();
  }, [startDate, endDate]);

  return { report, loading };
}

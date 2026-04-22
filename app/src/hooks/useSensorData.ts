'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  SensorReading,
  SensorLabel,
  SensorInfo,
  BoardLabel,
  fetchAllLatest,
  fetchReadings,
  fetchBoards,
  fetchLabels,
  fetchBoardLabels,
  upsertLabel as apiUpsertLabel,
  upsertBoardLabel as apiUpsertBoardLabel,
} from '@/lib/api';

interface SensorDataState {
  /** All sensors with their latest reading + label, grouped by board */
  sensorsByBoard: Record<string, SensorInfo[]>;
  /** All boards seen */
  boards: string[];
  /** All labels */
  labels: SensorLabel[];
  /** All board aliases */
  boardLabels: BoardLabel[];
  /** Readings for a selected sensor (for trend chart) */
  selectedReadings: SensorReading[];
  /** Currently selected sensor key */
  selectedSensor: { boardId: string; sensorId: number } | null;
  /** Overall stats across all sensors */
  overallStats: {
    totalSensors: number;
    totalBoards: number;
    needWater: number;
    avgMoisture: number;
    worstPercent: number | null;
  };
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => void;
  selectSensor: (boardId: string, sensorId: number) => void;
  clearSelection: () => void;
  updateLabel: (boardId: string, sensorId: number, label: string) => Promise<void>;
  updateBoardLabel: (boardId: string, alias: string) => Promise<void>;
}

export function useSensorData(pollInterval: number = 30000): SensorDataState {
  const [latestReadings, setLatestReadings] = useState<SensorReading[]>([]);
  const [boards, setBoards] = useState<string[]>([]);
  const [labels, setLabels] = useState<SensorLabel[]>([]);
  const [boardLabels, setBoardLabels] = useState<BoardLabel[]>([]);
  const [selectedReadings, setSelectedReadings] = useState<SensorReading[]>([]);
  const [selectedSensor, setSelectedSensor] = useState<{ boardId: string; sensorId: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [latestData, boardsData, labelsData, boardLabelsData] = await Promise.all([
        fetchAllLatest(),
        fetchBoards(),
        fetchLabels(),
        fetchBoardLabels(),
      ]);
      const normalizedLatest = Array.isArray(latestData) ? latestData : [];
      setLatestReadings(normalizedLatest);
      // If /boards endpoint isn't available (old API), derive boards from readings
      const normalizedBoards = Array.isArray(boardsData) && boardsData.length > 0
        ? boardsData
        : [...new Set(normalizedLatest.map(r => r.boardId))];
      setBoards(normalizedBoards);
      setLabels(Array.isArray(labelsData) ? labelsData : []);
      setBoardLabels(Array.isArray(boardLabelsData) ? boardLabelsData : []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch readings for selected sensor
  const fetchSelectedSensorReadings = useCallback(async (boardId: string, sensorId: number) => {
    const data = await fetchReadings(24, boardId, sensorId);
    setSelectedReadings(data);
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(), pollInterval);
    return () => clearInterval(interval);
  }, [fetchData, pollInterval]);

  // Re-fetch selected sensor readings when selection changes or data refreshes
  useEffect(() => {
    if (selectedSensor) {
      fetchSelectedSensorReadings(selectedSensor.boardId, selectedSensor.sensorId);
    }
  }, [selectedSensor, latestReadings, fetchSelectedSensorReadings]);

  const refresh = useCallback(() => fetchData(true), [fetchData]);

  const selectSensor = useCallback((boardId: string, sensorId: number) => {
    setSelectedSensor({ boardId, sensorId });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedSensor(null);
    setSelectedReadings([]);
  }, []);

  const updateLabel = useCallback(async (boardId: string, sensorId: number, label: string) => {
    const result = await apiUpsertLabel(boardId, sensorId, label);
    if (result) {
      // Update local labels state
      setLabels(prev => {
        const existing = prev.findIndex(l => l.boardId === boardId && l.sensorId === sensorId);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = result;
          return updated;
        }
        return [...prev, result];
      });
    }
  }, []);

  const updateBoardLabel = useCallback(async (boardId: string, alias: string) => {
    const result = await apiUpsertBoardLabel(boardId, alias);
    if (result) {
      // Update local boardLabels state
      setBoardLabels(prev => {
        const existing = prev.findIndex(l => l.boardId === boardId);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = result;
          return updated;
        }
        return [...prev, result];
      });
    }
  }, []);

  // Build sensors grouped by board
  const sensorsByBoard: Record<string, SensorInfo[]> = {};
  for (const reading of latestReadings) {
    if (!sensorsByBoard[reading.boardId]) {
      sensorsByBoard[reading.boardId] = [];
    }
    const label = labels.find(l => l.boardId === reading.boardId && l.sensorId === reading.sensorId);
    sensorsByBoard[reading.boardId].push({
      boardId: reading.boardId,
      sensorId: reading.sensorId,
      label: label?.label || '',
      latestReading: reading,
    });
  }
  // Sort sensors within each board by sensorId
  for (const board of Object.keys(sensorsByBoard)) {
    sensorsByBoard[board].sort((a, b) => a.sensorId - b.sensorId);
  }

  // Compute overall stats
  const allPercents = latestReadings.map(r => r.moisturePercent);
  const overallStats = {
    totalSensors: latestReadings.length,
    totalBoards: boards.length,
    needWater: allPercents.filter(p => p < 30).length,
    avgMoisture: allPercents.length > 0
      ? Math.round(allPercents.reduce((a, b) => a + b, 0) / allPercents.length)
      : 0,
    worstPercent: allPercents.length > 0 ? Math.min(...allPercents) : null,
  };

  return {
    sensorsByBoard,
    boards,
    labels,
    boardLabels,
    selectedReadings,
    selectedSensor,
    overallStats,
    loading,
    refreshing,
    error,
    refresh,
    selectSensor,
    clearSelection,
    updateLabel,
    updateBoardLabel,
  };
}

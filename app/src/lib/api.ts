const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.68.128:5050';

// ─── Types ────────────────────────────────────────────────────

export interface SensorReading {
  id: number;
  boardId: string;
  sensorId: number;
  moisturePercent: number;
  timestamp: string;
}

export interface SensorLabel {
  id: number;
  boardId: string;
  sensorId: number;
  label: string;
}

export interface BoardLabel {
  id: number;
  boardId: string;
  alias: string;
}

/** Aggregated view of a single sensor with its latest reading + label */
export interface SensorInfo {
  boardId: string;
  sensorId: number;
  label: string;
  latestReading: SensorReading | null;
}

// ─── API Fetchers ─────────────────────────────────────────────

/**
 * Normalize a reading from the old API format (no boardId/sensorId)
 * to the new format. This ensures backward compatibility with the
 * API currently running on the Pi.
 */
function normalizeReading(r: Record<string, unknown>): SensorReading {
  return {
    id: (r.id as number) ?? 0,
    boardId: (r.boardId as string) || 'default',
    sensorId: (r.sensorId as number) ?? 0,
    moisturePercent: (r.moisturePercent as number) ?? 0,
    timestamp: (r.timestamp as string) || new Date().toISOString(),
  };
}

/** Get the latest reading for EVERY unique (boardId, sensorId) pair */
export async function fetchAllLatest(): Promise<SensorReading[]> {
  try {
    const res = await fetch(`${API_URL}/api/sensor-data/latest`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    // Old API returns a single object; new API returns an array
    if (Array.isArray(data)) {
      return data.map(normalizeReading);
    }
    // Single object → wrap in array
    if (data && typeof data === 'object') {
      return [normalizeReading(data)];
    }
    return [];
  } catch {
    return [];
  }
}

/** Get readings with optional filters */
export async function fetchReadings(
  limit: number = 24,
  boardId?: string,
  sensorId?: number
): Promise<SensorReading[]> {
  try {
    const params = new URLSearchParams({ limit: String(limit) });
    if (boardId) params.set('boardId', boardId);
    if (sensorId !== undefined) params.set('sensorId', String(sensorId));
    const res = await fetch(`${API_URL}/api/sensor-data?${params}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map(normalizeReading);
  } catch {
    return [];
  }
}

/** Get all unique board IDs */
export async function fetchBoards(): Promise<string[]> {
  try {
    const res = await fetch(`${API_URL}/api/sensor-data/boards`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

/** Get all sensor labels */
export async function fetchLabels(): Promise<SensorLabel[]> {
  try {
    const res = await fetch(`${API_URL}/api/sensor-labels`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

/** Create or update a sensor label */
export async function upsertLabel(boardId: string, sensorId: number, label: string): Promise<SensorLabel | null> {
  try {
    const res = await fetch(`${API_URL}/api/sensor-labels`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ boardId, sensorId, label }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Get all board labels */
export async function fetchBoardLabels(): Promise<BoardLabel[]> {
  try {
    const res = await fetch(`${API_URL}/api/board-labels`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

/** Create or update a board label */
export async function upsertBoardLabel(boardId: string, alias: string): Promise<BoardLabel | null> {
  try {
    const res = await fetch(`${API_URL}/api/board-labels`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ boardId, alias }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ─── Helpers ──────────────────────────────────────────────────

export function getMoistureColor(percent: number): string {
  if (percent < 30) return 'var(--accent-rose)';
  if (percent < 60) return 'var(--accent-amber)';
  return 'var(--accent-emerald)';
}

export function getMoistureAccent(percent: number): 'rose' | 'amber' | 'emerald' {
  if (percent < 30) return 'rose';
  if (percent < 60) return 'amber';
  return 'emerald';
}

export function getMoistureRawColor(percent: number): string {
  if (percent < 30) return '#ef4444';
  if (percent < 60) return '#f59e0b';
  return '#10b981';
}

export function getTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 0) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/** Generate a sensor display name from label or fallback */
export function getSensorDisplayName(label: string | undefined, sensorId: number): string {
  return label || `Sensor ${sensorId}`;
}

/** Generate a board display name from alias or fallback */
export function getBoardDisplayName(boardId: string, boardLabels: BoardLabel[]): string {
  const labelObj = boardLabels.find(l => l.boardId === boardId);
  return labelObj?.alias || boardId || 'Unknown Board';
}

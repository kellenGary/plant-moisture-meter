'use client';

import { useState } from 'react';
import { SensorInfo, BoardLabel, getBoardDisplayName } from '@/lib/api';
import SensorCard from './SensorCard';

interface SensorGridProps {
  sensorsByBoard: Record<string, SensorInfo[]>;
  boardLabels: BoardLabel[];
  selectedSensor: { boardId: string; sensorId: number } | null;
  onSelectSensor: (boardId: string, sensorId: number) => void;
  onUpdateLabel: (boardId: string, sensorId: number, label: string) => Promise<void>;
  onUpdateBoardLabel: (boardId: string, alias: string) => Promise<void>;
}

export default function SensorGrid({
  sensorsByBoard,
  boardLabels,
  selectedSensor,
  onSelectSensor,
  onUpdateLabel,
  onUpdateBoardLabel,
}: SensorGridProps) {
  const boardIds = Object.keys(sensorsByBoard).sort();

  if (boardIds.length === 0) {
    return (
      <div className="glass-panel animate-slide-up stagger-3">
        <div className="panel-header">
          <span className="panel-title">Sensor Network</span>
        </div>
        <div className="panel-body" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '48px 22px' }}>
          No sensors detected yet. Waiting for ESP32 boards to report data...
        </div>
      </div>
    );
  }

  return (
    <div className="sensor-grid-container animate-slide-up stagger-3">
      {boardIds.map((boardId) => (
        <BoardGroup
          key={boardId}
          boardId={boardId}
          sensors={sensorsByBoard[boardId]}
          boardLabels={boardLabels}
          selectedSensor={selectedSensor}
          onSelectSensor={onSelectSensor}
          onUpdateLabel={onUpdateLabel}
          onUpdateBoardLabel={onUpdateBoardLabel}
        />
      ))}
    </div>
  );
}

function BoardGroup({
  boardId,
  sensors,
  boardLabels,
  selectedSensor,
  onSelectSensor,
  onUpdateLabel,
  onUpdateBoardLabel,
}: {
  boardId: string;
  sensors: SensorInfo[];
  boardLabels: BoardLabel[];
  selectedSensor: { boardId: string; sensorId: number } | null;
  onSelectSensor: (boardId: string, sensorId: number) => void;
  onUpdateLabel: (boardId: string, sensorId: number, label: string) => Promise<void>;
  onUpdateBoardLabel: (boardId: string, alias: string) => Promise<void>;
}) {
  const currentAlias = getBoardDisplayName(boardId, boardLabels);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(currentAlias);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (editValue.trim() === currentAlias) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    await onUpdateBoardLabel(boardId, editValue.trim());
    setIsSaving(false);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setEditValue(currentAlias);
      setIsEditing(false);
    }
  };

  return (
    <div className="board-group">
      <div className="board-group-header">
        <div className="board-group-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="status-dot online" />
          {isEditing ? (
            <input
              className="sensor-label-input"
              style={{ fontSize: '1.25rem', fontWeight: 600, padding: '4px 8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: '4px', color: 'var(--text-main)', width: '250px' }}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              autoFocus
              disabled={isSaving}
              placeholder={boardId}
            />
          ) : (
            <>
              <span>{currentAlias}</span>
              <button
                className="sensor-edit-btn"
                style={{ opacity: 1, background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px' }}
                onClick={() => {
                  setEditValue(currentAlias);
                  setIsEditing(true);
                }}
                title="Rename board"
              >
                ✏️
              </button>
            </>
          )}
        </div>
        <span className="board-group-count">
          {sensors.length} sensor{sensors.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="sensor-cards-grid">
        {sensors.map((sensor) => (
          <SensorCard
            key={`${sensor.boardId}-${sensor.sensorId}`}
            sensor={sensor}
            isSelected={
              selectedSensor?.boardId === sensor.boardId &&
              selectedSensor?.sensorId === sensor.sensorId
            }
            onSelect={onSelectSensor}
            onUpdateLabel={onUpdateLabel}
          />
        ))}
      </div>
    </div>
  );
}

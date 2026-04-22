'use client';

import { useState } from 'react';
import { SensorInfo, getMoistureColor, getMoistureRawColor, getTimeAgo, getSensorDisplayName } from '@/lib/api';

interface SensorCardProps {
  sensor: SensorInfo;
  isSelected: boolean;
  onSelect: (boardId: string, sensorId: number) => void;
  onUpdateLabel: (boardId: string, sensorId: number, label: string) => Promise<void>;
}

export default function SensorCard({ sensor, isSelected, onSelect, onUpdateLabel }: SensorCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(sensor.label);
  const [isSaving, setIsSaving] = useState(false);

  const percent = sensor.latestReading?.moisturePercent ?? null;
  const hasData = percent !== null;
  const color = hasData ? getMoistureColor(percent) : 'var(--text-dim)';
  const rawColor = hasData ? getMoistureRawColor(percent) : '#334155';
  const displayName = getSensorDisplayName(sensor.label || undefined, sensor.sensorId);

  // Mini gauge calculations
  const size = 64;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - ((percent ?? 0) / 100) * circumference;

  const handleSave = async () => {
    if (editValue.trim() === sensor.label) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    await onUpdateLabel(sensor.boardId, sensor.sensorId, editValue.trim());
    setIsSaving(false);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setEditValue(sensor.label);
      setIsEditing(false);
    }
  };

  return (
    <div
      className={`sensor-card ${isSelected ? 'selected' : ''}`}
      style={{ '--card-accent': rawColor } as React.CSSProperties}
      onClick={() => onSelect(sensor.boardId, sensor.sensorId)}
      id={`sensor-${sensor.boardId}-${sensor.sensorId}`}
    >
      {/* Mini Gauge */}
      <div className="sensor-card-gauge">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="var(--bg-tertiary)" strokeWidth={strokeWidth}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" strokeWidth={strokeWidth} strokeLinecap="round"
            style={{
              stroke: color,
              strokeDasharray: circumference,
              strokeDashoffset: progress,
              transition: 'stroke-dashoffset 0.8s ease, stroke 0.4s ease',
              opacity: hasData ? 1 : 0.2,
              filter: `drop-shadow(0 0 3px ${rawColor}44)`,
            }}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
          <text
            x={size / 2} y={size / 2 + 1}
            textAnchor="middle" dominantBaseline="middle"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '16px',
              fontWeight: 700,
              fill: color,
            }}
          >
            {hasData ? `${percent}%` : '--'}
          </text>
        </svg>
      </div>

      {/* Info */}
      <div className="sensor-card-info">
        {isEditing ? (
          <input
            className="sensor-label-input"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            autoFocus
            disabled={isSaving}
            onClick={(e) => e.stopPropagation()}
            placeholder={`Sensor ${sensor.sensorId}`}
          />
        ) : (
          <div className="sensor-card-name">
            <span>{displayName}</span>
            <button
              className="sensor-edit-btn"
              onClick={(e) => {
                e.stopPropagation();
                setEditValue(sensor.label);
                setIsEditing(true);
              }}
              title="Rename sensor"
            >
              ✏️
            </button>
          </div>
        )}
        <div className="sensor-card-meta">
          <span className="sensor-card-pin">Pin {sensor.sensorId}</span>
          {sensor.latestReading && (
            <span className="sensor-card-time">{getTimeAgo(sensor.latestReading.timestamp)}</span>
          )}
        </div>
      </div>
    </div>
  );
}

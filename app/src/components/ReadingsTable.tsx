'use client';

import { SensorReading, getMoistureColor, getMoistureAccent, getTimeAgo, getSensorDisplayName } from '@/lib/api';
import type { SensorLabel } from '@/lib/api';

interface ReadingsTableProps {
  readings: SensorReading[];
  labels?: SensorLabel[];
  showSensorColumn?: boolean;
}

export default function ReadingsTable({ readings, labels = [], showSensorColumn = true }: ReadingsTableProps) {
  const displayReadings = readings.slice(0, 8);

  const getLabel = (boardId: string, sensorId: number) => {
    const label = labels.find(l => l.boardId === boardId && l.sensorId === sensorId);
    return getSensorDisplayName(label?.label, sensorId);
  };

  return (
    <div className="glass-panel animate-slide-up stagger-5">
      <div className="panel-header">
        <span className="panel-title">Recent Readings</span>
        <span className="panel-badge">{readings.length} total</span>
      </div>
      <div className="panel-body" style={{ padding: 0 }}>
        {displayReadings.length === 0 ? (
          <div className="table-empty">No readings recorded yet</div>
        ) : (
          <table className="readings-table">
            <thead>
              <tr>
                {showSensorColumn && <th>Sensor</th>}
                <th>Moisture</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {displayReadings.map((reading) => {
                const color = getMoistureColor(reading.moisturePercent);
                const accent = getMoistureAccent(reading.moisturePercent);
                const statusLabel = accent === 'emerald' ? 'Healthy' : accent === 'amber' ? 'Drying' : 'Critical';
                return (
                  <tr key={reading.id}>
                    {showSensorColumn && (
                      <td>
                        <span className="reading-sensor-name">
                          {getLabel(reading.boardId, reading.sensorId)}
                        </span>
                        <span className="reading-board-badge">{reading.boardId}</span>
                      </td>
                    )}
                    <td>
                      <span className="reading-value" style={{ color }}>
                        <span className="reading-dot" style={{ backgroundColor: color }} />
                        {reading.moisturePercent}%
                      </span>
                    </td>
                    <td>
                      <span style={{ color, fontSize: '12px', fontWeight: 500 }}>
                        {statusLabel}
                      </span>
                    </td>
                    <td>
                      <span className="reading-time">{getTimeAgo(reading.timestamp)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

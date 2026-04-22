'use client';

import { SensorReading, getMoistureColor, formatTimestamp, getSensorDisplayName } from '@/lib/api';

interface TrendChartProps {
  data: SensorReading[];
  sensorLabel?: string;
  sensorId?: number;
}

export default function TrendChart({ data, sensorLabel, sensorId }: TrendChartProps) {
  const chartData = data.slice(0, 12).reverse();
  const title = sensorLabel || (sensorId !== undefined ? `Sensor ${sensorId}` : 'Moisture Trend');

  if (chartData.length === 0) {
    return (
      <div className="glass-panel chart-container animate-slide-up stagger-4">
        <div className="panel-header">
          <span className="panel-title">{title} — Trend</span>
          <span className="panel-badge">12h window</span>
        </div>
        <div className="chart-empty">
          {sensorId !== undefined ? 'Select a sensor to view its trend' : 'No historical data available'}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel chart-container animate-slide-up stagger-4">
      <div className="panel-header">
        <span className="panel-title">{title} — Trend</span>
        <span className="panel-badge">Last {chartData.length} readings</span>
      </div>
      <div className="chart-body">
        <div className="chart-bars">
          {chartData.map((reading) => {
            const height = Math.max((reading.moisturePercent / 100) * 100, 3);
            const color = getMoistureColor(reading.moisturePercent);
            return (
              <div key={reading.id} className="chart-bar-wrapper">
                <div
                  className="chart-bar"
                  style={{
                    height: `${height}%`,
                    background: `linear-gradient(to top, ${color}, ${color}dd)`,
                    boxShadow: `0 0 8px ${color}33`,
                  }}
                >
                  <div className="chart-bar-tooltip">
                    {reading.moisturePercent}% — {formatTimestamp(reading.timestamp)}
                  </div>
                </div>
                <span className="chart-time-label">
                  {formatTimestamp(reading.timestamp)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

'use client';

interface StatusBannerProps {
  worstPercent: number | null;
  needWaterCount: number;
  totalSensors: number;
}

export default function StatusBanner({ worstPercent, needWaterCount, totalSensors }: StatusBannerProps) {
  if (totalSensors === 0) {
    return (
      <div className="status-banner no-data animate-fade-in">
        <span className="status-icon">❓</span>
        <div className="status-info">
          <div className="status-title">No Sensors Detected</div>
          <div className="status-description">Waiting for ESP32 boards to report sensor data...</div>
        </div>
      </div>
    );
  }

  if (needWaterCount > 0) {
    return (
      <div className="status-banner critical animate-fade-in">
        <span className="status-icon">🔴</span>
        <div className="status-info">
          <div className="status-title">
            {needWaterCount} sensor{needWaterCount !== 1 ? 's' : ''} need{needWaterCount === 1 ? 's' : ''} water!
          </div>
          <div className="status-description">
            Driest sensor at {worstPercent}% — check your plants soon.
          </div>
        </div>
      </div>
    );
  }

  if (worstPercent !== null && worstPercent < 60) {
    return (
      <div className="status-banner warning animate-fade-in">
        <span className="status-icon">🟡</span>
        <div className="status-info">
          <div className="status-title">Some Sensors Getting Dry</div>
          <div className="status-description">
            Lowest moisture at {worstPercent}% across {totalSensors} sensor{totalSensors !== 1 ? 's' : ''}.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="status-banner healthy animate-fade-in">
      <span className="status-icon">🟢</span>
      <div className="status-info">
        <div className="status-title">All Plants Happy</div>
        <div className="status-description">
          All {totalSensors} sensor{totalSensors !== 1 ? 's' : ''} reporting healthy moisture levels.
        </div>
      </div>
    </div>
  );
}

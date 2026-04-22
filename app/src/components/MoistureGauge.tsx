'use client';

import { getMoistureColor } from '@/lib/api';

interface MoistureGaugeProps {
  percent: number | null;
}

export default function MoistureGauge({ percent }: MoistureGaugeProps) {
  const size = 200;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const hasData = percent !== null;
  const displayPercent = hasData ? percent : 0;
  const progress = circumference - (displayPercent / 100) * circumference;

  const color = hasData ? getMoistureColor(displayPercent) : 'var(--text-dim)';

  return (
    <div className="gauge-container glass-panel">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="gauge-svg"
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="gauge-bg-track"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="gauge-progress"
          style={{
            stroke: color,
            strokeDasharray: circumference,
            strokeDashoffset: progress,
            opacity: hasData ? 1 : 0.2,
          }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        {/* Center value */}
        <text
          x={size / 2}
          y={size / 2 - 6}
          className="gauge-center-value"
          style={{ fill: color }}
        >
          {hasData ? `${percent}%` : '--'}
        </text>
        {/* Label */}
        <text
          x={size / 2}
          y={size / 2 + 22}
          className="gauge-center-label"
        >
          MOISTURE
        </text>
      </svg>
    </div>
  );
}

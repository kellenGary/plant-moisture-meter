'use client';

interface StatCardProps {
  label: string;
  value: string;
  subtitle: string;
  accent: 'cyan' | 'emerald' | 'amber' | 'rose';
  stagger?: number;
}

export default function StatCard({ label, value, subtitle, accent, stagger = 0 }: StatCardProps) {
  return (
    <div
      className={`stat-card animate-slide-up ${stagger > 0 ? `stagger-${stagger}` : ''}`}
      data-accent={accent}
    >
      <div className="stat-label">{label}</div>
      <div className="stat-value" data-accent={accent}>{value}</div>
      <div className="stat-sub">{subtitle}</div>
    </div>
  );
}

'use client';

import { BoardLabel, getBoardDisplayName } from '@/lib/api';

interface SidebarProps {
  isConnected: boolean;
  boards: string[];
  sensorCounts: Record<string, number>;
  boardLabels: BoardLabel[];
}

export default function Sidebar({ isConnected, boards, sensorCounts, boardLabels }: SidebarProps) {
  return (
    <aside className="sidebar">
      {/* Logo / Brand */}
      <div className="sidebar-header">
        <div className="sidebar-logo">🌿</div>
        <div>
          <div className="sidebar-title">Plant Monitor</div>
          <div className="sidebar-subtitle">ESP32 Sensor Hub</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Overview</div>
        <a className="sidebar-link active" href="#" id="nav-dashboard">
          <span className="sidebar-link-icon">📊</span>
          Dashboard
        </a>

        {/* Dynamic board list */}
        {boards.length > 0 && (
          <>
            <div className="sidebar-section-label">Boards</div>
            {boards.sort().map((boardId) => (
              <a key={boardId} className="sidebar-link" href="#" id={`nav-board-${boardId}`}>
                <span className="sidebar-link-icon">📡</span>
                <span className="sidebar-link-text">{getBoardDisplayName(boardId, boardLabels)}</span>
                <span className="sidebar-link-badge">{sensorCounts[boardId] ?? 0}</span>
              </a>
            ))}
          </>
        )}

        <div className="sidebar-section-label">System</div>
        <a className="sidebar-link" href="#" id="nav-alerts">
          <span className="sidebar-link-icon">🔔</span>
          Alerts
        </a>
        <a className="sidebar-link" href="#" id="nav-settings">
          <span className="sidebar-link-icon">⚙️</span>
          Settings
        </a>
      </nav>

      {/* Footer / Status */}
      <div className="sidebar-footer">
        <div className="sidebar-status">
          <span className={`status-dot ${isConnected ? 'online' : 'offline'}`} />
          <span>{isConnected ? 'API Connected' : 'API Offline'}</span>
        </div>
        {boards.length > 0 && (
          <div className="sidebar-status" style={{ marginTop: '6px' }}>
            <span className="status-dot online" />
            <span>{boards.length} board{boards.length !== 1 ? 's' : ''} active</span>
          </div>
        )}
      </div>
    </aside>
  );
}

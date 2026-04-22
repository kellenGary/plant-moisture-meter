'use client';

import React, { useState } from 'react';
import { useSensorData } from '@/hooks/useSensorData';
import { getSensorDisplayName } from '@/lib/api';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { EditableText } from '@/components/EditableText';

import { 
  Droplets, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Thermometer,
  Activity,
  Settings,
  Bell,
  ChevronRight,
  MapPin,
  Cpu,
  RefreshCw,
  Sun
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, trend, icon }) => {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs text-muted-foreground">{subtitle}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default function DashboardPage() {
  const {
    sensorsByBoard,
    boards,
    labels,
    boardLabels,
    selectedReadings,
    selectedSensor,
    overallStats,
    loading,
    refreshing,
    refresh,
    selectSensor,
    clearSelection,
    updateLabel,
    updateBoardLabel,
  } = useSensorData();

  const isConnected = overallStats.totalSensors > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <RefreshCw className="h-10 w-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-mono">Initializing sensor network...</p>
      </div>
    );
  }

  // Flatten sensors for easier mapping
  const allSensors = Object.entries(sensorsByBoard).flatMap(([boardId, sensors]) => 
    sensors.map(s => ({ ...s, boardId }))
  );

  const getMoistureColor = (moisture: number) => {
    if (moisture >= 60) return 'bg-green-500';
    if (moisture >= 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusFromMoisture = (moisture: number) => {
    if (moisture >= 60) return { label: 'Optimal', color: 'bg-green-500/10 text-green-500 border-green-500/20' };
    if (moisture >= 30) return { label: 'Warning', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' };
    return { label: 'Critical', color: 'bg-red-500/10 text-red-500 border-red-500/20' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-10">
      <div className="container mx-auto p-6 space-y-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Droplets className="h-6 w-6 text-primary" />
              </div>
              Soil Moisture Monitor
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Sun className="h-4 w-4" />
              {isConnected
                ? `Monitoring ${overallStats.totalSensors} sensor${overallStats.totalSensors !== 1 ? 's' : ''} across ${overallStats.totalBoards} board${overallStats.totalBoards !== 1 ? 's' : ''}`
                : 'Awaiting sensor connections...'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`py-1 px-3 ${isConnected ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
              <span className={`h-2 w-2 rounded-full mr-2 ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
              {isConnected ? 'LIVE' : 'OFFLINE'}
            </Badge>
            <Button variant="outline" size="icon" onClick={refresh} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Active Boards"
            value={overallStats.totalBoards}
            subtitle="Connected ESP32s"
            icon={<Cpu className="h-4 w-4" />}
          />
          <StatCard
            title="Total Sensors"
            value={overallStats.totalSensors}
            subtitle="Active probes"
            icon={<Activity className="h-4 w-4" />}
          />
          <StatCard
            title="Average Moisture"
            value={overallStats.avgMoisture > 0 ? `${overallStats.avgMoisture}%` : '--'}
            subtitle="Across all sensors"
            icon={<Droplets className="h-4 w-4" />}
          />
          <StatCard
            title="Need Water"
            value={overallStats.needWater}
            subtitle="Below 30% moisture"
            icon={<AlertTriangle className={`h-4 w-4 ${overallStats.needWater > 0 ? 'text-red-500' : ''}`} />}
          />
        </div>

        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allSensors.map((sensor) => {
                const displayName = getSensorDisplayName(sensor.label || undefined, sensor.sensorId);
                const boardName = boardLabels.find(b => b.boardId === sensor.boardId)?.alias || sensor.boardId;
                const status = getStatusFromMoisture(sensor.latestReading?.moisturePercent || 0);

                return (
                  <Card key={`${sensor.boardId}-${sensor.sensorId}`} className="border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 group">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <EditableText 
                              value={displayName}
                              onSave={(newLabel) => updateLabel(sensor.boardId, sensor.sensorId, newLabel)}
                              className="max-w-[200px]"
                              textClassName="font-bold"
                            />
                            <Badge variant="outline" className={status.color}>
                              {status.label}
                            </Badge>
                          </CardTitle>
                          <CardDescription className="flex items-center gap-1 font-mono text-xs text-muted-foreground w-fit">
                            <Cpu className="h-3 w-3" />
                            <EditableText 
                              value={boardName}
                              onSave={(newAlias) => updateBoardLabel(sensor.boardId, newAlias)}
                              className="max-w-[150px]"
                            />
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-2">
                            <Droplets className="h-4 w-4" />
                            Soil Moisture
                          </span>
                          <span className="font-semibold text-foreground">{sensor.latestReading?.moisturePercent || 0}%</span>
                        </div>
                        <Progress value={sensor.latestReading?.moisturePercent || 0} className="h-2" indicatorClassName={getMoistureColor(sensor.latestReading?.moisturePercent || 0)} />
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-border/50">
                        <span className="text-xs text-muted-foreground font-mono">
                          ID: {sensor.sensorId}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            {allSensors.length === 0 && (
              <div className="text-center py-20 border border-dashed border-border/50 rounded-xl bg-card/20">
                <AlertTriangle className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No Sensors Found</h3>
                <p className="text-muted-foreground">Waiting for ESP32 boards to connect and send data...</p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

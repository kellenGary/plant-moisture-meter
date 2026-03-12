import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import Svg, { Circle, G, Text as SvgText } from "react-native-svg";

interface SensorReading {
  id: number;
  moisturePercent: number;
  timestamp: string;
}

const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://raspberrypi.tail96d0e0.ts.net";
const { width } = Dimensions.get("window");

// Circular Gauge Component
const MoistureGauge = ({ percent }: { percent: number | null }) => {
  const size = Math.min(width * 0.55, 220);
  const strokeWidth = 15;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // If no data (percent is null), we show 0 progress but grey color
  const hasData = percent !== null;
  const displayPercent = hasData ? percent : 0;
  const progress = (displayPercent / 100) * circumference;

  const getColor = (p: number) => {
    if (!hasData) return "#444"; // Grey for no data
    if (p < 30) return "#e74c3c";
    if (p < 60) return "#f39c12";
    return "#27ae60";
  };

  return (
    <View style={styles.gaugeContainer}>
      <Svg width={size} height={size}>
        <G rotation="-90" originX={size / 2} originY={size / 2}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#2a2a4a"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={getColor(displayPercent)}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${progress} ${circumference}`}
            strokeLinecap="round"
            opacity={hasData ? 1 : 0.3}
          />
        </G>
        {/* Center text */}
        <SvgText
          x={size / 2}
          y={size / 2 - 10}
          textAnchor="middle"
          fontSize={48}
          fontWeight="bold"
          fill={getColor(displayPercent)}
        >
          {hasData ? `${percent}%` : "--"}
        </SvgText>
        <SvgText
          x={size / 2}
          y={size / 2 + 25}
          textAnchor="middle"
          fontSize={14}
          fill="#888"
        >
          MOISTURE
        </SvgText>
      </Svg>
    </View>
  );
};

// Status Card Component
const StatusCard = ({
  title,
  value,
  subtitle,
  color,
}: {
  title: string;
  value: string;
  subtitle: string;
  color: string;
}) => (
  <View style={[styles.statusCard, { borderLeftColor: color }]}>
    <Text style={styles.statusTitle}>{title}</Text>
    <Text style={[styles.statusValue, { color }]}>{value}</Text>
    <Text style={styles.statusSubtitle}>{subtitle}</Text>
  </View>
);

// Simple Bar Chart Component (web-compatible)
const SimpleBarChart = ({ data }: { data: SensorReading[] }) => {
  const chartData = data.slice(0, 12).reverse();
  const maxValue = 100;
  const barWidth = (width - 80) / Math.max(chartData.length, 1) - 4;

  const getColor = (p: number) => {
    if (p < 30) return "#e74c3c";
    if (p < 60) return "#f39c12";
    return "#27ae60";
  };

  if (data.length === 0) {
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Moisture Trend</Text>
        <View
          style={[
            styles.chartWrapper,
            { justifyContent: "center", alignItems: "center" },
          ]}
        >
          <Text style={{ color: "#666" }}>No historical data available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Moisture Trend (Last 12 readings)</Text>
      <View style={styles.chartWrapper}>
        {/* Y-axis labels */}
        <View style={styles.yAxis}>
          <Text style={styles.axisLabel}>100%</Text>
          <Text style={styles.axisLabel}>50%</Text>
          <Text style={styles.axisLabel}>0%</Text>
        </View>
        {/* Bars */}
        <View style={styles.barsContainer}>
          {chartData.map((reading, index) => (
            <View key={reading.id} style={styles.barWrapper}>
              <View
                style={[
                  styles.bar,
                  {
                    height: `${(reading.moisturePercent / maxValue) * 100}%`,
                    backgroundColor: getColor(reading.moisturePercent),
                    width: Math.max(barWidth, 8),
                  },
                ]}
              />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default function App() {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [latest, setLatest] = useState<SensorReading | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [latestRes, allRes] = await Promise.all([
        fetch(`${API_URL}/api/sensor-data/latest`),
        fetch(`${API_URL}/api/sensor-data?limit=24`),
      ]);

      if (latestRes.ok) {
        setLatest(await latestRes.json());
      } else {
        setLatest(null); // Handle 404 or other errors
      }
      if (allRes.ok) {
        setReadings(await allRes.json());
      } else {
        setReadings([]);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      // Don't clear data on transient error effectively, or maybe show error state
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const getMoistureStatus = (percent: number) => {
    if (percent < 30)
      return { text: "Needs Water!", emoji: "💧", color: "#e74c3c" };
    if (percent < 60)
      return { text: "Getting Dry", emoji: "🌤️", color: "#f39c12" };
    return { text: "Happy Plant", emoji: "🌱", color: "#27ae60" };
  };

  const getTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getStats = () => {
    if (readings.length === 0) return { avg: 0, min: 0, max: 0 };
    const values = readings.map((r) => r.moisturePercent);
    return {
      avg: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
      min: Math.min(...values),
      max: Math.max(...values),
    };
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#27ae60" />
        <Text style={styles.loadingText}>Loading sensor data...</Text>
      </View>
    );
  }

  const status = latest
    ? getMoistureStatus(latest.moisturePercent)
    : { text: "No Data", emoji: "❓", color: "#666" };
  const stats = getStats();
  const hasData = !!latest;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#27ae60"
        />
      }
    >
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🌿 Plant Monitor</Text>
        {latest ? (
          <Text style={styles.lastUpdate}>
            Updated {getTimeAgo(latest.timestamp)}
          </Text>
        ) : (
          <Text style={styles.lastUpdate}>Waiting for data...</Text>
        )}
      </View>

      {/* Main Gauge */}
      <>
        <MoistureGauge percent={latest ? latest.moisturePercent : null} />

        {/* Status Banner */}
        <View
          style={[
            styles.statusBanner,
            { backgroundColor: status?.color + "20" },
          ]}
        >
          <Text style={styles.statusEmoji}>{status?.emoji}</Text>
          <Text style={[styles.statusText, { color: status?.color }]}>
            {status?.text}
          </Text>
        </View>
      </>

      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <StatusCard
          title="Average"
          value={hasData ? `${stats.avg}%` : "--"}
          subtitle="Last 24h"
          color="#3498db"
        />
        <StatusCard
          title="Low"
          value={hasData ? `${stats.min}%` : "--"}
          subtitle="Minimum"
          color="#e74c3c"
        />
        <StatusCard
          title="High"
          value={hasData ? `${stats.max}%` : "--"}
          subtitle="Maximum"
          color="#27ae60"
        />
      </View>

      {/* Chart */}
      <SimpleBarChart data={readings} />

      {/* Recent Readings */}
      <View style={styles.recentContainer}>
        <Text style={styles.recentTitle}>Recent Readings</Text>
        {readings.length === 0 ? (
          <Text style={{ color: "#666", fontStyle: "italic" }}>
            No recent readings recorded.
          </Text>
        ) : (
          readings.slice(0, 5).map((reading) => (
            <View key={reading.id} style={styles.readingRow}>
              <View
                style={[
                  styles.readingDot,
                  {
                    backgroundColor: getMoistureStatus(reading.moisturePercent)
                      .color,
                  },
                ]}
              />
              <Text style={styles.readingPercent}>
                {reading.moisturePercent}%
              </Text>
              <Text style={styles.readingTime}>
                {getTimeAgo(reading.timestamp)}
              </Text>
            </View>
          ))
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f1a",
  },
  contentContainer: {
    maxWidth: 600,
    alignSelf: "center",
    width: "100%",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f0f1a",
  },
  loadingText: {
    color: "#fff",
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 10,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  lastUpdate: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  gaugeContainer: {
    alignItems: "center",
    marginVertical: 10,
  },
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  statusEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  statusText: {
    fontSize: 18,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 15,
    gap: 10,
  },
  statusCard: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 3,
  },
  statusTitle: {
    fontSize: 11,
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  statusValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 4,
  },
  statusSubtitle: {
    fontSize: 11,
    color: "#555",
  },
  chartContainer: {
    marginTop: 25,
    marginHorizontal: 20,
    backgroundColor: "#1a1a2e",
    borderRadius: 16,
    padding: 15,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 15,
  },
  chartWrapper: {
    flexDirection: "row",
    height: 150,
  },
  yAxis: {
    width: 40,
    justifyContent: "space-between",
    paddingRight: 8,
  },
  axisLabel: {
    fontSize: 10,
    color: "#666",
    textAlign: "right",
  },
  barsContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#333",
    paddingLeft: 4,
  },
  barWrapper: {
    flex: 1,
    height: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 2,
  },
  bar: {
    borderRadius: 4,
    minHeight: 4,
  },
  recentContainer: {
    marginTop: 25,
    marginHorizontal: 20,
    backgroundColor: "#1a1a2e",
    borderRadius: 16,
    padding: 15,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 15,
  },
  readingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a4a",
  },
  readingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  readingPercent: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    flex: 1,
  },
  readingTime: {
    fontSize: 13,
    color: "#666",
  },
});

#include <WiFi.h>
#include <HTTPClient.h>

// Credentials loaded from secrets.h
const char* ssid = WIFI_SSID;
const char* password = WIFI_PASSWORD;
const char* apiEndpoint = API_ENDPOINT;

struct SensorCluster {
  int gndPin;
  int vccPin;
  int sigPin;
};

// Map of the 5 available "Direct Plug" clusters
SensorCluster clusters[] = {
  { -1, 13, 12 }, // Sensor 1: GND, D13, D12
  { 14, 27, 26 }, // Sensor 2: D14, D27, D26
  { 25, 33, 32 }, // Sensor 3: D25, D33, D32
  { -1, 2,  15 }, // Sensor 4: GND, D2 (VCC/LED), D15 (SIGNAL) - SWAPPED
  { 17, 16, 4  }  // Sensor 5: D17, D16, D4
};

const int NUM_SENSORS = 5;
int readings[NUM_SENSORS];

#define uS_TO_S_FACTOR 1000000ULL 
#define TIME_TO_SLEEP  3600 
#define TEST_MODE true

void uploadToApi(int sensorId, int moisturePercent) {
  HTTPClient http;
  http.begin(apiEndpoint);
  http.addHeader("Content-Type", "application/json");
  String payload = "{\"boardId\":\"" + String(BOARD_ID) + "\", \"sensorId\":" + String(sensorId) + ", \"moisturePercent\":" + String(moisturePercent) + "}";
  http.POST(payload);
  http.end();
}

void readAllSensors() {
  Serial.println("\n--- WiFi OFF: Reading Sensors ---");
  WiFi.disconnect();
  WiFi.mode(WIFI_OFF);
  delay(200); // Give radio time to fully stop

  for (int i = 0; i < NUM_SENSORS; i++) {
    if (clusters[i].gndPin != -1) {
      pinMode(clusters[i].gndPin, OUTPUT);
      digitalWrite(clusters[i].gndPin, LOW);
    }
    pinMode(clusters[i].vccPin, OUTPUT);
    digitalWrite(clusters[i].vccPin, HIGH);
    
    // INCREASED DELAY: Give capacitive sensors more time to stabilize
    delay(500); 
    
    int rawValue = analogRead(clusters[i].sigPin);
    
    // Calibrate dry value to ~3100 and wet to ~1500
    int moisturePercent = map(rawValue, 3150, 1450, 0, 100); 
    readings[i] = constrain(moisturePercent, 0, 100);
    
    digitalWrite(clusters[i].vccPin, LOW);
    Serial.printf("Sensor %d (Pin %d): %d%% (Raw: %d)\n", i+1, clusters[i].sigPin, readings[i], rawValue);
  }
}

void connectWiFi() {
  Serial.print("Connecting to WiFi");
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  if (WiFi.status() == WL_CONNECTED) Serial.println(" Connected!");
  else Serial.println(" Failed!");
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  if (!TEST_MODE) {
    readAllSensors();
    connectWiFi();
    if(WiFi.status() == WL_CONNECTED) {
      for (int i = 0; i < NUM_SENSORS; i++) {
        uploadToApi(i + 1, readings[i]);
      }
    }
    esp_sleep_enable_timer_wakeup(TIME_TO_SLEEP * uS_TO_S_FACTOR);
    esp_deep_sleep_start();
  }
}

void loop() {
  if (TEST_MODE) {
    readAllSensors();
    connectWiFi();
    if (WiFi.status() == WL_CONNECTED) {
      for (int i = 0; i < NUM_SENSORS; i++) {
        uploadToApi(i + 1, readings[i]);
      }
    }
    Serial.println("Next reading in 10 seconds...");
    delay(10000); 
  }
}
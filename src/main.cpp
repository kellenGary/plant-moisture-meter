#include <WiFi.h>
#include <HTTPClient.h>

// Credentials loaded from secrets.h (not committed to git)
const char* ssid = WIFI_SSID;
const char* password = WIFI_PASSWORD;
const char* apiEndpoint = API_ENDPOINT;

const int SENSOR_PIN = 32;
const int SENSOR_VCC_PIN = 33;  // Power pin for sensor
const int SENSOR_GND_PIN = 25;  // Ground pin for sensor

#define uS_TO_S_FACTOR 1000000ULL 
#define TIME_TO_SLEEP  3600 // Sleep for 1 hour

// Set to true for testing (prints every second), false for production (deep sleep)
#define TEST_MODE true

void uploadToApi(int moisturePercent) {
  HTTPClient http;
  http.begin(apiEndpoint);
  http.addHeader("Content-Type", "application/json");
  
  String payload = "{\"moisturePercent\":" + String(moisturePercent) + "}";
  
  Serial.print(" -> Uploading to API... ");
  int httpCode = http.POST(payload);
  
  if(httpCode == 201) {
    Serial.println("OK!");
  } else {
    Serial.println("Error " + String(httpCode));
  }
  
  http.end();
}

void setup() {
  Serial.begin(115200);
  delay(1000); // Wait for serial to initialize
  Serial.println("\n--- Plant Water Monitor Started ---");

  // Configure power pins for sensor
  pinMode(SENSOR_VCC_PIN, OUTPUT);
  pinMode(SENSOR_GND_PIN, OUTPUT);
  digitalWrite(SENSOR_VCC_PIN, HIGH);  // 3.3V power
  digitalWrite(SENSOR_GND_PIN, LOW);   // Ground
  delay(100); // Let sensor stabilize

  // Connect to WiFi
  Serial.print("Connecting to WiFi");
  WiFi.begin(ssid, password);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if(WiFi.status() == WL_CONNECTED) {
    Serial.println(" Connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println(" Failed to connect");
  }
}

// Counter for test mode uploads
int loopCount = 0;

void loop() {
  // Read Sensor
  int rawValue = analogRead(SENSOR_PIN);
  int moisturePercent = map(rawValue, 3200, 1500, 0, 100); 
  moisturePercent = constrain(moisturePercent, 0, 100);

  Serial.print("Raw: ");
  Serial.print(rawValue);
  Serial.print(" | Moisture: ");
  Serial.print(moisturePercent);
  Serial.print("%");

  #if TEST_MODE
    loopCount++;
    // Upload every 15 seconds (15 loops)
    if(loopCount >= 15) {
      loopCount = 0;
      if(WiFi.status() == WL_CONNECTED) {
        uploadToApi(moisturePercent);
      } else {
        Serial.println(" -> WiFi disconnected");
      }
    } else {
      Serial.println();
    }
    delay(1000);
  #else
    Serial.println();
    // Production mode: send to API and sleep
    if(WiFi.status() == WL_CONNECTED) {
      uploadToApi(moisturePercent);
    }
    esp_sleep_enable_timer_wakeup(TIME_TO_SLEEP * uS_TO_S_FACTOR);
    esp_deep_sleep_start();
  #endif
}
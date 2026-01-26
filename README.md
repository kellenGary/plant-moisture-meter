# plant-moisture-meter

## Getting Started

This project consists of three main parts: a Mobile App (Frontend), an API (Backend), and Firmware for the ESP32.

### Frontend (Mobile App)

The mobile app is built with React Native and Expo.

**Location:** `app/`

**Commands:**

- **Install Dependencies:**
  ```bash
  cd app && npm install
  ```

- **Start Development Server:**
  ```bash
  cd app && npm start
  ```

- **Run on Android:**
  ```bash
  cd app && npm run android
  ```

- **Run on iOS:**
  ```bash
  cd app && npm run ios
  ```

- **Run on Web:**
  ```bash
  cd app && npm run web
  ```

### Backend (API)

The backend is a .NET Web API.

**Location:** `api/`

**Commands:**

- **Restore Dependencies:**
  ```bash
  cd api && dotnet restore
  ```

- **Run the API:**
  ```bash
  cd api && dotnet run
  ```

- **Watch Mode (Hot Reload):**
  ```bash
  cd api && dotnet watch run
  ```

### Firmware (ESP32)

The firmware is built using PlatformIO.

**Commands:**

- **Build Firmware:**
  ```bash
  pio run
  ```

- **Upload to Device:**
  ```bash
  pio run --target upload
  ```

- **Monitor Serial Output:**
  ```bash
  pio device monitor
  ```
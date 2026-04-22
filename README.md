# plant-moisture-meter

## Getting Started

This project consists of three main parts: a Web Dashboard (Frontend), an API (Backend), and Firmware for the ESP32.

### Frontend (Web Dashboard)

The dashboard is built with Next.js, TypeScript, and vanilla CSS.

**Location:** `app/`

**Commands:**

- **Install Dependencies:**
  ```bash
  cd app && npm install
  ```

- **Start Development Server:**
  ```bash
  cd app && npm run dev
  ```
  Opens at [http://localhost:3000](http://localhost:3000)

- **Production Build:**
  ```bash
  cd app && npm run build
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
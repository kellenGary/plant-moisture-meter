import serial
import time
import json

# Configuration
PORT = '/dev/cu.usbserial-0001' # Your ESP32 port
BAUD = 115200

def monitor():
    print(f"--- Starting Sensor Monitor on {PORT} ---")
    try:
        with serial.Serial(PORT, BAUD, timeout=1) as ser:
            time.sleep(2) # Wait for connection
            while True:
                if ser.in_waiting > 0:
                    line = ser.readline().decode('utf-8', errors='ignore').strip()
                    if line:
                        print(f"[ESP32] {line}")
                        
                        # If we see the API payload in the logs, highlight it
                        if '{"sensorId"' in line:
                            print(" >>> DATA TRANSMITTED TO API <<<")
                
                time.sleep(0.1)
    except KeyboardInterrupt:
        print("\nStopping monitor...")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    monitor()

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Plant Monitor — Dashboard",
  description: "Real-time soil moisture monitoring dashboard for ESP32 plant sensors. Track moisture levels, view trends, and keep your plants healthy.",
  keywords: ["plant monitor", "soil moisture", "ESP32", "IoT", "dashboard"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body>
        <div className="app-layout">
          {children}
        </div>
      </body>
    </html>
  );
}

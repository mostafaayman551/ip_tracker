"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Particles from "./components/Particles";

interface NetworkInfo {
  connectionType: string;
  effectiveType: string;
  downlink: string;
  rtt: string;
}

interface LocationData {
  lat: number | null;
  long: number | null;
  country: string;
  countryCode: string;
  city: string;
  region: string;
  regionCode: string;
  postal: string;
  ip: string;
  timezone: string;
  isp: string;
  asn: string;
  currency: string;
  currencySymbol: string;
  callingCode: string;
}

interface DeviceInfo {
  os: string;
  browser: string;
  screen: string;
  cpu: string;
  deviceType: string;
  language: string;
  platform: string;
  vendor: string;
  colorDepth: string;
  pixelRatio: string;
}

export default function Home() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [visitorCount, setVisitorCount] = useState<number>(0);

  useEffect(() => {
    // Get device info
    const getDeviceInfo = () => {
      const ua = navigator.userAgent;
      let os = "Unknown";
      let browser = "Unknown";
      let deviceType = "Desktop";

      // Detect OS
      if (ua.includes("Windows")) os = "Windows";
      else if (ua.includes("Mac")) os = "macOS";
      else if (ua.includes("Linux")) os = "Linux";
      else if (ua.includes("Android")) os = "Android";
      else if (ua.includes("iOS")) os = "iOS";

      // Detect Browser
      if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Chrome";
      else if (ua.includes("Firefox")) browser = "Firefox";
      else if (ua.includes("Safari") && !ua.includes("Chrome"))
        browser = "Safari";
      else if (ua.includes("Edg")) browser = "Edge";

      // Detect Device Type
      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          ua
        );
      const isTablet = /iPad|Android/i.test(ua) && !/Mobile/i.test(ua);

      if (isTablet) deviceType = "Tablet";
      else if (isMobile) deviceType = "Mobile";

      // Screen info
      const screen = `${window.screen.width}x${window.screen.height}`;
      const availScreen = `${window.screen.availWidth}x${window.screen.availHeight}`;

      // CPU cores
      const cpu = navigator.hardwareConcurrency
        ? `${navigator.hardwareConcurrency} cores`
        : "Unknown";

      // Additional device info
      const language = navigator.language || "Unknown";
      const platform = navigator.platform || "Unknown";
      const vendor = navigator.vendor || "Unknown";
      const colorDepth = `${
        screen.colorDepth || window.screen.colorDepth || "Unknown"
      } bit`;
      const pixelRatio = window.devicePixelRatio
        ? window.devicePixelRatio.toFixed(2)
        : "1.00";

      setDeviceInfo({
        os,
        browser,
        screen: `${screen} (avail: ${availScreen})`,
        cpu,
        deviceType,
        language,
        platform,
        vendor,
        colorDepth,
        pixelRatio,
      });
    };

    // Get network info
    const getNetworkInfo = () => {
      const connection =
        (navigator as any).connection ||
        (navigator as any).mozConnection ||
        (navigator as any).webkitConnection;

      if (connection) {
        setNetworkInfo({
          connectionType: connection.type || "Unknown",
          effectiveType: connection.effectiveType || "Unknown",
          downlink: connection.downlink
            ? `${connection.downlink} Mbps`
            : "Unknown",
          rtt: connection.rtt ? `${connection.rtt} ms` : "Unknown",
        });
      }
    };

    // Get battery info
    const getBatteryInfo = async () => {
      if ((navigator as any).getBattery) {
        try {
          const battery = await (navigator as any).getBattery();
          setBatteryLevel(Math.round(battery.level * 100));

          battery.addEventListener("levelchange", () => {
            setBatteryLevel(Math.round(battery.level * 100));
          });
        } catch (e) {
          console.log("Battery API not available");
        }
      }
    };

    // Get IP and location from server (Vercel headers)
    const getLocationData = async () => {
      try {
        // Fetch from our API route which gets IP from request headers
        const response = await fetch("/api/ip");
        if (!response.ok) {
          throw new Error("Failed to fetch IP data");
        }
        const data = await response.json();

        setLocationData({
          ip: data.ip || "Unknown",
          country: data.country || "Unknown",
          countryCode: data.countryCode || "Unknown",
          city: data.city || "Unknown",
          region: data.region || "Unknown",
          regionCode: data.regionCode || "Unknown",
          postal: data.postal || "Unknown",
          lat: data.lat || null,
          long: data.long || null,
          timezone: data.timezone || "Unknown",
          isp: data.isp || "Unknown",
          asn: data.asn || "Unknown",
          currency: data.currency || "Unknown",
          currencySymbol: data.currencySymbol || "Unknown",
          callingCode: data.callingCode || "Unknown",
        });
      } catch (error) {
        console.error("Error fetching location:", error);
        // Set fallback data so cards still show
        setLocationData({
          ip: "Loading...",
          country: "Loading...",
          countryCode: "Loading...",
          city: "Loading...",
          region: "Loading...",
          regionCode: "Loading...",
          postal: "Loading...",
          lat: null,
          long: null,
          timezone: "Loading...",
          isp: "Loading...",
          asn: "Loading...",
          currency: "Loading...",
          currencySymbol: "Loading...",
          callingCode: "Loading...",
        });
      }
    };

    // Get visitor count from localStorage
    const count = localStorage.getItem("visitorCount");
    const newCount = count ? parseInt(count) + 1 : 1;
    localStorage.setItem("visitorCount", newCount.toString());
    setVisitorCount(newCount);

    getDeviceInfo();
    getNetworkInfo();
    getBatteryInfo();
    getLocationData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0.3, y: 20, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const InfoCard = ({
    icon,
    title,
    children,
    accentColor = "blue",
  }: {
    icon: string;
    title: string;
    children: React.ReactNode;
    accentColor?:
      | "blue"
      | "purple"
      | "pink"
      | "green"
      | "yellow"
      | "orange"
      | "cyan"
      | "indigo";
  }) => (
    <motion.div
      variants={itemVariants}
      className={`glass-card p-10 sm:p-12 md:p-14 lg:p-16 relative card-${accentColor}`}
      style={{ zIndex: 100, position: "relative", backgroundColor: "#ffffff" }}
    >
      <div className="relative z-10" style={{ backgroundColor: "transparent" }}>
        <div className="flex items-center gap-4 mb-6">
          <span
            className="text-4xl"
            style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}
          >
            {icon}
          </span>
          <h3 className="text-xl font-bold" style={{ color: "#000000", fontWeight: 800, textShadow: "none" }}>
            {title}
          </h3>
        </div>
        <div className="space-y-2" style={{ color: "#000000", backgroundColor: "transparent" }}>
          {children}
        </div>
      </div>
    </motion.div>
  );

  const InfoRow = ({
    label,
    value,
    highlight = false,
  }: {
    label: string;
    value: string;
    highlight?: boolean;
  }) => (
    <div className="flex justify-between items-center py-3 px-2 border-b border-gray-300 last:border-0">
      <span
        className="text-sm font-semibold"
        style={{ color: "#000000", fontWeight: 700, textShadow: "none" }}
      >
        {label}
      </span>
      <span
        className={`text-sm font-bold ${
          highlight ? "font-mono text-base" : ""
        }`}
        style={{ color: "#000000", fontWeight: 800, textShadow: "none" }}
      >
        {value}
      </span>
    </div>
  );

  return (
    <div className="relative min-h-screen w-full">
      <Particles />
      <div
        className="relative min-h-screen py-8 sm:py-12 md:py-16"
        style={{ zIndex: 50 }}
      >
        <div
          className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16"
          style={{ marginLeft: "auto", marginRight: "auto" }}
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="text-center mb-12 sm:mb-16 md:mb-20"
          >
            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-6xl md:text-7xl font-bold mb-4 gradient-text"
            >
              IPScout
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-xl md:text-2xl font-medium"
              style={{ color: "#ffffff" }}
            >
              Discover your digital footprint in real-time
            </motion.p>
          </motion.div>

          {/* Main Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10 mb-12 sm:mb-16 md:mb-20 relative"
            style={{
              zIndex: 100,
              width: "100%",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            {/* IP + Country */}
            <InfoCard icon="🌍" title="IP & Location" accentColor="blue">
              {locationData ? (
                <>
                  <InfoRow
                    label="IP Address"
                    value={locationData.ip}
                    highlight
                  />
                  <InfoRow
                    label="Country"
                    value={`${locationData.country} (${locationData.countryCode})`}
                  />
                  <InfoRow label="Region" value={locationData.region} />
                  <InfoRow label="City" value={locationData.city} />
                  <InfoRow label="Postal Code" value={locationData.postal} />
                  <InfoRow label="Timezone" value={locationData.timezone} />
                </>
              ) : (
                <div
                  className="text-center py-12 font-medium"
                  style={{ color: "#000000" }}
                >
                  Loading location data...
                </div>
              )}
            </InfoCard>

            {/* Location Coordinates */}
            <InfoCard icon="📍" title="Coordinates" accentColor="green">
              {locationData ? (
                <>
                  {locationData.lat && locationData.long ? (
                    <>
                      <InfoRow
                        label="Latitude"
                        value={locationData.lat.toFixed(6)}
                        highlight
                      />
                      <InfoRow
                        label="Longitude"
                        value={locationData.long.toFixed(6)}
                        highlight
                      />
                      <InfoRow
                        label="Region Code"
                        value={locationData.regionCode}
                      />
                      <a
                        href={`https://www.google.com/maps?q=${locationData.lat},${locationData.long}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mt-6 text-center text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 py-3 px-4 rounded-lg border border-blue-500/20 hover:border-blue-500/40"
                      >
                        View on Maps →
                      </a>
                    </>
                  ) : (
                    <div
                      className="text-center py-12 font-medium"
                      style={{ color: "#000000" }}
                    >
                      Location data unavailable
                    </div>
                  )}
                </>
              ) : (
                <div
                  className="text-center py-12 font-medium"
                  style={{ color: "#000000" }}
                >
                  Loading coordinates...
                </div>
              )}
            </InfoCard>

            {/* ISP & Network Provider */}
            <InfoCard icon="🌐" title="ISP & Network" accentColor="orange">
              {locationData ? (
                <>
                  <InfoRow label="ISP" value={locationData.isp} highlight />
                  <InfoRow label="ASN" value={locationData.asn} />
                  <InfoRow
                    label="Currency"
                    value={`${locationData.currency} (${locationData.currencySymbol})`}
                  />
                  <InfoRow
                    label="Calling Code"
                    value={`+${locationData.callingCode}`}
                  />
                </>
              ) : (
                <div
                  className="text-center py-12 font-medium"
                  style={{ color: "#000000" }}
                >
                  Loading network data...
                </div>
              )}
            </InfoCard>

            {/* Device Info */}
            <InfoCard icon="💻" title="Device Info" accentColor="purple">
              {deviceInfo ? (
                <>
                  <InfoRow label="Operating System" value={deviceInfo.os} />
                  <InfoRow label="Platform" value={deviceInfo.platform} />
                  <InfoRow label="Browser" value={deviceInfo.browser} />
                  <InfoRow label="Vendor" value={deviceInfo.vendor} />
                  <InfoRow
                    label="Screen Resolution"
                    value={deviceInfo.screen}
                  />
                  <InfoRow label="Color Depth" value={deviceInfo.colorDepth} />
                  <InfoRow label="Pixel Ratio" value={deviceInfo.pixelRatio} />
                  <InfoRow label="Language" value={deviceInfo.language} />
                  <InfoRow label="CPU Cores" value={deviceInfo.cpu} />
                </>
              ) : (
                <div
                  className="text-center py-12 font-medium"
                  style={{ color: "#000000" }}
                >
                  Loading device info...
                </div>
              )}
            </InfoCard>

            {/* Battery */}
            <InfoCard icon="🔋" title="Battery Status" accentColor="yellow">
              {batteryLevel !== null ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <motion.div
                      key={batteryLevel}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      className="text-5xl font-bold mb-4"
                    >
                      {batteryLevel}%
                    </motion.div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden border border-gray-300">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${batteryLevel}%` }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      className={`h-full rounded-full ${
                        batteryLevel > 60
                          ? "bg-gradient-to-r from-green-400 to-emerald-500"
                          : batteryLevel > 30
                          ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                          : "bg-gradient-to-r from-red-400 to-pink-500"
                      } shadow-lg`}
                    />
                  </div>
                </div>
              ) : (
                <div
                  className="text-center py-12 font-medium"
                  style={{ color: "#000000" }}
                >
                  Battery API not available
                </div>
              )}
            </InfoCard>

            {/* Network Info */}
            <InfoCard icon="📡" title="Network" accentColor="indigo">
              {networkInfo ? (
                <>
                  <InfoRow
                    label="Connection Type"
                    value={networkInfo.connectionType}
                  />
                  <InfoRow
                    label="Effective Type"
                    value={networkInfo.effectiveType}
                  />
                  <InfoRow
                    label="Downlink Speed"
                    value={networkInfo.downlink}
                  />
                  <InfoRow label="Round Trip Time" value={networkInfo.rtt} />
                </>
              ) : (
                <div
                  className="text-center py-12 font-medium"
                  style={{ color: "#000000" }}
                >
                  Network API not available
                </div>
              )}
            </InfoCard>

            {/* Device Type */}
            <InfoCard icon="📱" title="Device Type" accentColor="pink">
              {deviceInfo ? (
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 15,
                      delay: 0.2,
                    }}
                    className={`inline-block px-8 py-4 rounded-2xl text-xl font-bold shadow-lg ${
                      deviceInfo.deviceType === "Mobile"
                        ? "bg-gradient-to-r from-purple-500 to-pink-500"
                        : deviceInfo.deviceType === "Tablet"
                        ? "bg-gradient-to-r from-blue-500 to-cyan-500"
                        : "bg-gradient-to-r from-green-500 to-emerald-500"
                    }`}
                  >
                    {deviceInfo.deviceType}
                  </motion.div>
                </div>
              ) : (
                <div
                  className="text-center py-12 font-medium"
                  style={{ color: "#000000" }}
                >
                  Loading...
                </div>
              )}
            </InfoCard>

            {/* Visitor Analytics */}
            <InfoCard icon="🕵️" title="Visitor Analytics" accentColor="cyan">
              <div className="space-y-6">
                <div className="text-center py-6">
                  <motion.span
                    key={visitorCount}
                    initial={{ scale: 1.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-6xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
                  >
                    {visitorCount}
                  </motion.span>
                  <div
                    className="text-sm mt-4 font-semibold"
                    style={{ color: "#000000" }}
                  >
                    Total Visits
                  </div>
                </div>
                <div
                  className="text-xs text-center pt-4 border-t border-gray-300"
                  style={{ color: "#000000" }}
                >
                  This counter tracks your visits to this page
                </div>
              </div>
            </InfoCard>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center text-sm mt-16 mb-8"
          >
            <p className="font-light" style={{ color: "#ffffff" }}>
              Built with Next.js, Framer Motion & Tailwind CSS
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

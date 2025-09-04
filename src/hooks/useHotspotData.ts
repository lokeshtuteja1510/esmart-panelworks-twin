import { useState, useEffect } from 'react';

// Mock live data generator for hotspot sensors
const generateHotspotData = () => {
  const now = new Date().toISOString();
  const baseTime = Date.now();
  
  return {
    'panel.busbar.r.temp_c': {
      value: 65 + Math.sin(baseTime * 0.001) * 8 + Math.random() * 3,
      timestamp: now,
      trend: (Math.random() - 0.5) * 2
    },
    'panel.busbar.y.temp_c': {
      value: 63 + Math.sin(baseTime * 0.0012) * 7 + Math.random() * 3,
      timestamp: now,
      trend: (Math.random() - 0.5) * 2
    },
    'panel.busbar.b.temp_c': {
      value: 67 + Math.sin(baseTime * 0.0008) * 9 + Math.random() * 3,
      timestamp: now,
      trend: (Math.random() - 0.5) * 2
    },
    'panel.main_feeder.current_a': {
      value: 320 + Math.sin(baseTime * 0.002) * 40 + Math.random() * 20,
      timestamp: now,
      trend: (Math.random() - 0.5) * 5
    },
    'panel.power.factor': {
      value: 0.94 + Math.sin(baseTime * 0.0015) * 0.06 + Math.random() * 0.02,
      timestamp: now,
      trend: (Math.random() - 0.5) * 0.1
    },
    'panel.cooling.fan_rpm': {
      value: 1400 + Math.sin(baseTime * 0.0025) * 200 + Math.random() * 100,
      timestamp: now,
      trend: (Math.random() - 0.5) * 50
    },
    'panel.ambient.temp_c': {
      value: 32 + Math.sin(baseTime * 0.0005) * 6 + Math.random() * 2,
      timestamp: now,
      trend: (Math.random() - 0.5) * 1
    },
    'panel.ambient.rh_pct': {
      value: 55 + Math.sin(baseTime * 0.0008) * 15 + Math.random() * 5,
      timestamp: now,
      trend: (Math.random() - 0.5) * 3
    },
    'panel.safety.smoke': {
      value: Math.random() > 0.95 ? 1 : 0, // 5% chance of smoke alarm
      timestamp: now,
      trend: 0
    },
    'panel.safety.door_open': {
      value: Math.random() > 0.98 ? 1 : 0, // 2% chance of door open
      timestamp: now,
      trend: 0
    },
    'panel.vfd.heatsink_c': {
      value: 58 + Math.sin(baseTime * 0.003) * 12 + Math.random() * 4,
      timestamp: now,
      trend: (Math.random() - 0.5) * 3
    },
    'panel.psu.v_out': {
      value: 24.1 + Math.sin(baseTime * 0.01) * 0.3 + Math.random() * 0.1,
      timestamp: now,
      trend: (Math.random() - 0.5) * 0.2
    },
    'panel.plc.link_ok': {
      value: Math.random() > 0.99 ? 0 : 1, // 1% chance of communication failure
      timestamp: now,
      trend: 0
    }
  };
};

export const useHotspotData = () => {
  const [data, setData] = useState(generateHotspotData());

  useEffect(() => {
    const interval = setInterval(() => {
      setData(generateHotspotData());
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);

  return data;
};
import { useState, useEffect } from 'react';
import { useHotspotData } from './useHotspotData';

type AlertLevel = 'OK' | 'WARN' | 'ALARM' | 'NO_SIGNAL';

const MESH_TO_TAG_MAP: Record<string, string> = {
  'busbar_phase_r': 'panel.busbar.r.temp_c',
  'busbar_phase_y': 'panel.busbar.y.temp_c', 
  'busbar_phase_b': 'panel.busbar.b.temp_c',
  'mccb_main': 'panel.main_feeder.current_a',
  'vfd_01': 'panel.vfd.heatsink_c',
  'psu_24v': 'panel.psu.v_out',
  'plc_cpu': 'panel.plc.link_ok',
  'fan_top': 'panel.cooling.fan_rpm',
  'smoke_sensor': 'panel.safety.smoke',
  'door_switch': 'panel.safety.door_open'
};

const THRESHOLDS = {
  'panel.busbar.r.temp_c': { warn: 70, alarm: 80 },
  'panel.busbar.y.temp_c': { warn: 70, alarm: 80 },
  'panel.busbar.b.temp_c': { warn: 70, alarm: 80 },
  'panel.main_feeder.current_a': { warn: 350, alarm: 400 },
  'panel.vfd.heatsink_c': { warn: 70, alarm: 85 },
  'panel.psu.v_out': { warn: 23.4, alarm: 22.8, direction: 'outside_band', band: [23.8, 24.4] },
  'panel.plc.link_ok': { alarm: 0, type: 'binary' },
  'panel.cooling.fan_rpm': { warn: 1200, alarm: 800, direction: 'below' },
  'panel.safety.smoke': { alarm: 1, type: 'binary' },
  'panel.safety.door_open': { alarm: 1, type: 'binary' }
};

const evaluateAlertLevel = (value: any, thresholds: any): AlertLevel => {
  if (value === undefined || value === null) return 'NO_SIGNAL';
  
  if (thresholds.type === 'binary') {
    return value === thresholds.alarm ? 'ALARM' : 'OK';
  }
  
  if (thresholds.direction === 'below') {
    if (value <= thresholds.alarm) return 'ALARM';
    if (value <= thresholds.warn) return 'WARN';
  } else if (thresholds.direction === 'outside_band' && thresholds.band) {
    const [min, max] = thresholds.band;
    if (value < min || value > max) return 'ALARM';
    const margin = (max - min) * 0.1;
    if (value < min + margin || value > max - margin) return 'WARN';
  } else {
    // Default: above
    if (value >= thresholds.alarm) return 'ALARM';
    if (value >= thresholds.warn) return 'WARN';
  }
  
  return 'OK';
};

export const useAlertState = () => {
  const hotspotData = useHotspotData();
  const [alertStates, setAlertStates] = useState<Record<string, AlertLevel>>({});

  useEffect(() => {
    const newAlertStates: Record<string, AlertLevel> = {};
    
    Object.entries(MESH_TO_TAG_MAP).forEach(([meshName, tag]) => {
      const data = hotspotData[tag];
      const thresholds = THRESHOLDS[tag];
      
      if (data && thresholds) {
        newAlertStates[meshName] = evaluateAlertLevel(data.value, thresholds);
      } else {
        newAlertStates[meshName] = 'NO_SIGNAL';
      }
    });
    
    setAlertStates(newAlertStates);
  }, [hotspotData]);

  return alertStates;
};
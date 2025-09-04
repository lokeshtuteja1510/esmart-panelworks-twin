import React, { useState } from 'react';
import { Html } from '@react-three/drei';
import { Vector3 } from 'three';
import { HotspotPin } from './HotspotPin';
import { HotspotTooltip } from './HotspotTooltip';
import { useHotspotData } from '@/hooks/useHotspotData';

const HOTSPOT_DEFINITIONS = [
  { id: "hs_busbar_temp_r", label: "Busbar Temp R", position: [-0.3, 0.7, 0.15], tag: "panel.busbar.r.temp_c", thresholds: { warn: 70, alarm: 80 }, unit: "°C" },
  { id: "hs_busbar_temp_y", label: "Busbar Temp Y", position: [-0.3, 0.6, 0.15], tag: "panel.busbar.y.temp_c", thresholds: { warn: 70, alarm: 80 }, unit: "°C" },
  { id: "hs_busbar_temp_b", label: "Busbar Temp B", position: [-0.3, 0.5, 0.15], tag: "panel.busbar.b.temp_c", thresholds: { warn: 70, alarm: 80 }, unit: "°C" },
  { id: "hs_main_current", label: "Main Current", position: [-0.4, 0.3, 0.1], tag: "panel.main_feeder.current_a", thresholds: { warn: 350, alarm: 400 }, unit: "A" },
  { id: "hs_pf", label: "Power Factor", position: [-0.4, 0.15, 0.1], tag: "panel.power.factor", thresholds: { warn: 0.92, alarm: 0.88, direction: "below" }, unit: "pf" },
  { id: "hs_fan_rpm", label: "Cooling Fan RPM", position: [0, 0.85, 0.15], tag: "panel.cooling.fan_rpm", thresholds: { warn: 1200, alarm: 800, direction: "below" }, unit: "rpm" },
  { id: "hs_panel_temp", label: "Panel Ambient T", position: [0.4, -0.6, 0.05], tag: "panel.ambient.temp_c", thresholds: { warn: 38, alarm: 45 }, unit: "°C" },
  { id: "hs_panel_rh", label: "Panel RH", position: [0.4, -0.5, 0.05], tag: "panel.ambient.rh_pct", thresholds: { warn: 70, alarm: 80 }, unit: "%" },
  { id: "hs_smoke", label: "Smoke Sensor", position: [0, 0.8, -0.15], tag: "panel.safety.smoke", thresholds: { alarm: 1, type: "binary" }, unit: "state" },
  { id: "hs_door", label: "Door Interlock", position: [0.55, 0, 0.1], tag: "panel.safety.door_open", thresholds: { alarm: 1, type: "binary" }, unit: "state" },
  { id: "hs_vfd_temp", label: "VFD Heatsink T", position: [0.2, 0.1, 0.1], tag: "panel.vfd.heatsink_c", thresholds: { warn: 70, alarm: 85 }, unit: "°C" },
  { id: "hs_psu_24v", label: "PSU 24V", position: [0.2, -0.4, 0.1], tag: "panel.psu.v_out", thresholds: { warn: 23.4, alarm: 22.8, direction: "outside_band", band: [23.8, 24.4] }, unit: "V" },
  { id: "hs_plc_comm", label: "PLC Comms", position: [-0.3, -0.2, 0.1], tag: "panel.plc.link_ok", thresholds: { alarm: 0, type: "binary" }, unit: "state" }
];

export const HotspotManager: React.FC = () => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<Vector3>(new Vector3());
  const hotspotData = useHotspotData();

  const handleHotspotClick = (hotspotId: string, position: Vector3) => {
    setActiveTooltip(activeTooltip === hotspotId ? null : hotspotId);
    setTooltipPosition(position);
  };

  const handleHotspotHover = (hotspotId: string, position: Vector3) => {
    if (!activeTooltip) {
      setActiveTooltip(hotspotId);
      setTooltipPosition(position);
    }
  };

  const handleHotspotLeave = () => {
    if (activeTooltip && !tooltipPosition) {
      setActiveTooltip(null);
    }
  };

  return (
    <>
      {HOTSPOT_DEFINITIONS.map((hotspot) => {
        const data = hotspotData[hotspot.tag];
        const position = new Vector3(...hotspot.position);
        
        return (
          <HotspotPin
            key={hotspot.id}
            position={position}
            label={hotspot.label}
            data={data}
            thresholds={hotspot.thresholds}
            onClick={() => handleHotspotClick(hotspot.id, position)}
            onHover={() => handleHotspotHover(hotspot.id, position)}
            onLeave={handleHotspotLeave}
          />
        );
      })}
      
      {activeTooltip && (
        <Html position={tooltipPosition}>
          <HotspotTooltip
            hotspot={HOTSPOT_DEFINITIONS.find(h => h.id === activeTooltip)!}
            data={hotspotData[HOTSPOT_DEFINITIONS.find(h => h.id === activeTooltip)!.tag]}
            onClose={() => setActiveTooltip(null)}
          />
        </Html>
      )}
    </>
  );
};
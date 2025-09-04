import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, BoxGeometry, MeshStandardMaterial, Group } from 'three';
import { useAlertState } from '@/hooks/useAlertState';

interface ControlPanelProps {
  position?: [number, number, number];
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ position = [0, 0, 0] }) => {
  const groupRef = useRef<Group>(null);
  const alertStates = useAlertState();
  
  // Create materials with proper theming
  const materials = useMemo(() => ({
    shell: new MeshStandardMaterial({ 
      color: '#e5e7eb', 
      roughness: 0.3, 
      metalness: 0.1 
    }),
    busbarR: new MeshStandardMaterial({ 
      color: '#dc2626', 
      roughness: 0.1, 
      metalness: 0.8 
    }),
    busbarY: new MeshStandardMaterial({ 
      color: '#eab308', 
      roughness: 0.1, 
      metalness: 0.8 
    }),
    busbarB: new MeshStandardMaterial({ 
      color: '#2563eb', 
      roughness: 0.1, 
      metalness: 0.8 
    }),
    component: new MeshStandardMaterial({ 
      color: '#374151', 
      roughness: 0.4, 
      metalness: 0.2 
    }),
    alert: new MeshStandardMaterial({
      color: '#FF3B30',
      emissive: '#FF3B30',
      emissiveIntensity: 0.3,
      roughness: 0.2,
      metalness: 0.1
    })
  }), []);

  // Animation for alert blinking
  useFrame((state) => {
    if (!groupRef.current) return;
    
    const time = state.clock.getElapsedTime();
    const blinkRate = 1.25; // Hz
    const blinkValue = Math.sin(time * blinkRate * Math.PI * 2) * 0.5 + 0.5;
    
    // Apply blinking to alert materials
    Object.entries(alertStates).forEach(([meshName, alertLevel]) => {
      const mesh = groupRef.current?.getObjectByName(meshName) as Mesh;
      if (mesh && alertLevel === 'ALARM') {
        const alertMaterial = materials.alert.clone();
        alertMaterial.emissiveIntensity = 0.3 + (blinkValue * 0.4);
        mesh.material = alertMaterial;
      }
    });
  });

  const getComponentMaterial = (meshName: string) => {
    const alertLevel = alertStates[meshName];
    if (alertLevel === 'ALARM') return materials.alert;
    if (alertLevel === 'WARN') {
      const warnMaterial = materials.component.clone();
      warnMaterial.color.setHex(0x00A389); // PRIMARY_ACCENT
      return warnMaterial;
    }
    return materials.component;
  };

  return (
    <group ref={groupRef} position={position}>
      {/* Main Enclosure Shell */}
      <mesh name="shell_main" material={materials.shell} receiveShadow castShadow>
        <boxGeometry args={[1.2, 1.8, 0.4]} />
      </mesh>
      
      {/* Door */}
      <mesh name="door_outer" position={[0.61, 0, 0]} material={materials.shell} receiveShadow castShadow>
        <boxGeometry args={[0.02, 1.8, 0.4]} />
      </mesh>
      
      {/* Busbars */}
      <mesh name="busbar_phase_r" position={[-0.3, 0.7, 0.15]} material={materials.busbarR} castShadow>
        <boxGeometry args={[0.5, 0.05, 0.02]} />
      </mesh>
      <mesh name="busbar_phase_y" position={[-0.3, 0.6, 0.15]} material={materials.busbarY} castShadow>
        <boxGeometry args={[0.5, 0.05, 0.02]} />
      </mesh>
      <mesh name="busbar_phase_b" position={[-0.3, 0.5, 0.15]} material={materials.busbarB} castShadow>
        <boxGeometry args={[0.5, 0.05, 0.02]} />
      </mesh>
      
      {/* Main MCCB */}
      <mesh name="mccb_main" position={[-0.4, 0.3, 0.1]} material={getComponentMaterial('mccb_main')} castShadow>
        <boxGeometry args={[0.25, 0.35, 0.15]} />
      </mesh>
      
      {/* Outgoing MCCBs */}
      {Array.from({ length: 4 }, (_, i) => (
        <mesh 
          key={i}
          name={`mccb_outgoing_0${i + 1}`} 
          position={[-0.1 + (i * 0.15), 0.3, 0.1]} 
          material={getComponentMaterial(`mccb_outgoing_0${i + 1}`)} 
          castShadow
        >
          <boxGeometry args={[0.12, 0.2, 0.1]} />
        </mesh>
      ))}
      
      {/* VFD */}
      <mesh name="vfd_01" position={[0.2, 0.1, 0.1]} material={getComponentMaterial('vfd_01')} castShadow>
        <boxGeometry args={[0.3, 0.4, 0.12]} />
      </mesh>
      
      {/* PSU 24V */}
      <mesh name="psu_24v" position={[0.2, -0.4, 0.1]} material={getComponentMaterial('psu_24v')} castShadow>
        <boxGeometry args={[0.25, 0.15, 0.1]} />
      </mesh>
      
      {/* PLC CPU */}
      <mesh name="plc_cpu" position={[-0.3, -0.2, 0.1]} material={getComponentMaterial('plc_cpu')} castShadow>
        <boxGeometry args={[0.15, 0.25, 0.08]} />
      </mesh>
      
      {/* PLC I/O Modules */}
      <mesh name="plc_ai" position={[-0.1, -0.2, 0.1]} material={getComponentMaterial('plc_ai')} castShadow>
        <boxGeometry args={[0.1, 0.25, 0.08]} />
      </mesh>
      <mesh name="plc_di" position={[0.05, -0.2, 0.1]} material={getComponentMaterial('plc_di')} castShadow>
        <boxGeometry args={[0.1, 0.25, 0.08]} />
      </mesh>
      
      {/* Cooling Fan */}
      <mesh name="fan_top" position={[0, 0.85, 0.15]} material={getComponentMaterial('fan_top')} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.04, 8]} />
      </mesh>
      
      {/* Sensors */}
      <mesh name="temp_probe_panel" position={[0.4, -0.6, 0.05]} material={getComponentMaterial('temp_probe_panel')} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.08, 8]} />
      </mesh>
      
      <mesh name="smoke_sensor" position={[0, 0.8, -0.15]} material={getComponentMaterial('smoke_sensor')} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.03, 8]} />
      </mesh>
      
      <mesh name="door_switch" position={[0.55, 0, 0.1]} material={getComponentMaterial('door_switch')} castShadow>
        <boxGeometry args={[0.03, 0.06, 0.04]} />
      </mesh>
    </group>
  );
};
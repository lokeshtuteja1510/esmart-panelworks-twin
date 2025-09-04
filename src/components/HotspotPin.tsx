import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, Mesh, MeshBasicMaterial } from 'three';
import { Html } from '@react-three/drei';

interface HotspotPinProps {
  position: Vector3;
  label: string;
  data?: any;
  thresholds: any;
  onClick: () => void;
  onHover: () => void;
  onLeave: () => void;
}

export const HotspotPin: React.FC<HotspotPinProps> = ({
  position,
  label,
  data,
  thresholds,
  onClick,
  onHover,
  onLeave
}) => {
  const meshRef = useRef<Mesh>(null);
  const { camera } = useThree();
  
  const alertLevel = useMemo(() => {
    if (!data || data.value === undefined) return 'NO_SIGNAL';
    
    const value = data.value;
    
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
  }, [data, thresholds]);

  const pinColor = useMemo(() => {
    switch (alertLevel) {
      case 'ALARM': return '#FF3B30';
      case 'WARN': return '#00A389';
      case 'NO_SIGNAL': return '#6B7280';
      default: return '#00A389';
    }
  }, [alertLevel]);

  const material = useMemo(() => {
    return new MeshBasicMaterial({ 
      color: pinColor,
      transparent: true,
      opacity: alertLevel === 'ALARM' ? 1 : 0.8
    });
  }, [pinColor, alertLevel]);

  // Animation for blinking alarms
  useFrame((state) => {
    if (!meshRef.current) return;
    
    if (alertLevel === 'ALARM') {
      const time = state.clock.getElapsedTime();
      const blinkRate = 1.25;
      const opacity = 0.6 + (Math.sin(time * blinkRate * Math.PI * 2) * 0.4);
      material.opacity = opacity;
    } else if (alertLevel === 'WARN') {
      const time = state.clock.getElapsedTime();
      const pulseRate = 0.5;
      const opacity = 0.6 + (Math.sin(time * pulseRate * Math.PI * 2) * 0.2);
      material.opacity = opacity;
    }
    
    // Billboard effect - always face camera
    meshRef.current.lookAt(camera.position);
  });

  return (
    <group position={position}>
      {/* Pin marker */}
      <mesh
        ref={meshRef}
        material={material}
        onClick={onClick}
        onPointerOver={onHover}
        onPointerOut={onLeave}
      >
        <circleGeometry args={[0.02, 16]} />
      </mesh>
      
      {/* Label */}
      <Html
        position={[0.05, 0.02, 0]}
        style={{
          pointerEvents: 'none',
          userSelect: 'none'
        }}
      >
        <div className="text-xs font-mono text-muted-foreground bg-background/80 px-1 py-0.5 rounded backdrop-blur-sm border">
          {label}
        </div>
      </Html>
      
      {/* Leader line to component */}
      <mesh position={[0.02, 0, 0]}>
        <boxGeometry args={[0.04, 0.001, 0.001]} />
        <meshBasicMaterial color={pinColor} transparent opacity={0.5} />
      </mesh>
    </group>
  );
};
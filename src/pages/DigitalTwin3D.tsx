import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import { ControlPanel } from '@/components/ControlPanel3D';
import { HotspotManager } from '@/components/HotspotManager';

export const DigitalTwin3D = () => {
  return (
    <div className="fixed inset-0 bg-background">
      <Canvas
        shadows
        className="w-full h-full"
        gl={{ 
          antialias: true, 
          alpha: false,
          powerPreference: "high-performance"
        }}
      >
        <PerspectiveCamera makeDefault position={[2, 1, 2]} fov={45} />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={0.5}
          maxDistance={8}
          maxPolarAngle={Math.PI * 0.8}
          enableDamping={true}
          dampingFactor={0.1}
        />
        
        <Environment preset="warehouse" />
        
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={0.8}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <directionalLight
          position={[-5, 2, -5]}
          intensity={0.3}
        />
        
        <ControlPanel />
        <HotspotManager />
      </Canvas>
    </div>
  );
};
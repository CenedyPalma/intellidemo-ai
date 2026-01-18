import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Generate particles once outside component (static data)
const generateParticles = (count: number) => {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    // Use deterministic pattern based on index
    const theta = (i / count) * Math.PI * 20;
    const phi = (i / count) * Math.PI * 10;
    const radius = 8 + (i % 5) * 2;
    
    positions[i3] = Math.cos(theta) * Math.sin(phi) * radius;
    positions[i3 + 1] = Math.sin(theta) * Math.sin(phi) * radius;
    positions[i3 + 2] = Math.cos(phi) * radius - 5;

    // Static colors
    const t = i / count;
    colors[i3] = 0.1 + t * 0.4;
    colors[i3 + 1] = 0.4 + t * 0.3;
    colors[i3 + 2] = 0.7 + t * 0.3;
  }

  return { positions, colors };
};

const PARTICLE_DATA = generateParticles(200); // Reduced from 800 to 200

function Particles() {
  const mesh = useRef<THREE.Points>(null);

  useFrame(({ clock }) => {
    if (mesh.current) {
      // Very slow rotation for subtle movement
      mesh.current.rotation.y = clock.getElapsedTime() * 0.01;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[PARTICLE_DATA.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[PARTICLE_DATA.colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
}

export default function ParticleBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none opacity-30">
      <Canvas 
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 1.5]} // Limit pixel ratio for performance
        performance={{ min: 0.5 }} // Allow frame drops
      >
        <Particles />
      </Canvas>
    </div>
  );
}

import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, Stars, OrbitControls } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

function FloatingBooks() {
  const group = useRef();
  useFrame((state) => {
    group.current.rotation.y = state.mouse.x * 0.3;
    group.current.rotation.x = state.mouse.y * 0.2;
  });

  return (
    <group ref={group}>
      {[...Array(5)].map((_, i) => (
        <Float key={i} speed={2} rotationIntensity={0.5} floatIntensity={1}>
          <mesh position={[i * 1.5 - 3, 0, 0]}>
            <boxGeometry args={[0.6, 1.2, 0.1]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#8b5cf6' : '#06b6d4'} metalness={0.3} roughness={0.4} />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

export default function HeroScene() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} />
      <Stars radius={100} depth={50} count={2000} factor={4} fade />
      <FloatingBooks />
      <OrbitControls enableZoom={false} enablePan={false} />
      <Environment preset="city" />
    </Canvas>
  );
}
import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Floating Cross component
function FloatingCross({ position, scale = 1, rotationSpeed = 0.2 }: { position: [number, number, number], scale?: number, rotationSpeed?: number }) {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * rotationSpeed;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={meshRef} position={position} scale={scale}>
        {/* Vertical bar */}
        <mesh>
          <boxGeometry args={[0.08, 0.5, 0.08]} />
          <meshStandardMaterial 
            color="#c9a55c" 
            metalness={0.8} 
            roughness={0.2}
            emissive="#c9a55c"
            emissiveIntensity={0.1}
          />
        </mesh>
        {/* Horizontal bar */}
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[0.35, 0.08, 0.08]} />
          <meshStandardMaterial 
            color="#c9a55c" 
            metalness={0.8} 
            roughness={0.2}
            emissive="#c9a55c"
            emissiveIntensity={0.1}
          />
        </mesh>
      </group>
    </Float>
  );
}

// Glowing orb particles
function GlowingParticles() {
  const count = 50;
  const mesh = useRef<THREE.InstancedMesh>(null);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 20;
      const y = (Math.random() - 0.5) * 15;
      const z = (Math.random() - 0.5) * 10 - 5;
      const scale = Math.random() * 0.03 + 0.01;
      temp.push({ position: [x, y, z] as [number, number, number], scale });
    }
    return temp;
  }, []);

  useFrame((state) => {
    if (mesh.current) {
      const matrix = new THREE.Matrix4();
      particles.forEach((particle, i) => {
        const y = particle.position[1] + Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.2;
        matrix.setPosition(particle.position[0], y, particle.position[2]);
        matrix.scale(new THREE.Vector3(particle.scale, particle.scale, particle.scale));
        mesh.current!.setMatrixAt(i, matrix);
      });
      mesh.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial 
        color="#c9a55c" 
        emissive="#c9a55c"
        emissiveIntensity={0.5}
        transparent
        opacity={0.6}
      />
    </instancedMesh>
  );
}

// Main 3D scene
function Scene() {
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#c9a55c" />
      <pointLight position={[-10, -10, -10]} intensity={0.3} color="#8b7355" />
      
      <Stars 
        radius={50} 
        depth={50} 
        count={1000} 
        factor={3} 
        saturation={0} 
        fade 
        speed={0.5}
      />
      
      <GlowingParticles />
      
      {/* Floating crosses at different positions */}
      <FloatingCross position={[-4, 2, -5]} scale={0.8} rotationSpeed={0.15} />
      <FloatingCross position={[4, -1, -6]} scale={0.6} rotationSpeed={0.2} />
      <FloatingCross position={[0, 3, -8]} scale={0.5} rotationSpeed={0.1} />
      <FloatingCross position={[-3, -2, -4]} scale={0.4} rotationSpeed={0.25} />
      <FloatingCross position={[5, 1, -7]} scale={0.7} rotationSpeed={0.12} />
    </>
  );
}

export function Background3D() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Scene />
      </Canvas>
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-background/30 to-background pointer-events-none" />
    </div>
  );
}

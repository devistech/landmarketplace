import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sphere, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

function FloatingGrid() {
  const meshRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const count = 600;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.1;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#4a7c59"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

function GlobeShape() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
      <Sphere ref={meshRef} args={[2.2, 64, 64]} position={[3.5, 0, -2]}>
        <MeshDistortMaterial
          color="#3d6b4f"
          transparent
          opacity={0.15}
          distort={0.3}
          speed={1.5}
          wireframe
        />
      </Sphere>
    </Float>
  );
}

function SmallSphere({ position, color, size }: { position: [number, number, number]; color: string; size: number }) {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1.2}>
      <Sphere args={[size, 32, 32]} position={position}>
        <MeshDistortMaterial
          color={color}
          transparent
          opacity={0.2}
          distort={0.4}
          speed={2}
        />
      </Sphere>
    </Float>
  );
}

function TerrainMesh() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.03;
    }
  });

  return (
    <Float speed={0.8} floatIntensity={0.4}>
      <mesh ref={meshRef} position={[-3.5, -1, -3]} rotation={[-0.5, 0, 0]}>
        <torusKnotGeometry args={[1.2, 0.3, 128, 32]} />
        <meshStandardMaterial
          color="#5a8f6e"
          transparent
          opacity={0.1}
          wireframe
        />
      </mesh>
    </Float>
  );
}

export default function HeroBackground3D() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={0.3} />
        <FloatingGrid />
        <GlobeShape />
        <TerrainMesh />
        <SmallSphere position={[-4, 2, -1]} color="#6b9e7a" size={0.6} />
        <SmallSphere position={[4.5, -2.5, -1.5]} color="#8ab89a" size={0.4} />
        <SmallSphere position={[-2, -2, 0]} color="#4a7c59" size={0.3} />
        <SmallSphere position={[1.5, 3, -2]} color="#3d6b4f" size={0.5} />
      </Canvas>
    </div>
  );
}

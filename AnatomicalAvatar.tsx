import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, ThreeElements } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars, Float, Text, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Extend the global JSX namespace to include Three.js elements from @react-three/fiber
// This resolves "Property 'mesh' does not exist on type 'JSX.IntrinsicElements'" errors.
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

interface BoneProps {
  start: [number, number, number];
  end: [number, number, number];
  highlighted?: boolean;
}

const Bone: React.FC<BoneProps> = ({ start, end, highlighted }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const points = useMemo(() => [
    new THREE.Vector3(...start),
    new THREE.Vector3(...end)
  ], [start, end]);

  const height = points[0].distanceTo(points[1]);
  const position = new THREE.Vector3().addVectors(points[0], points[1]).multiplyScalar(0.5);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3().subVectors(points[1], points[0]).normalize()
  );

  return (
    <mesh position={position} quaternion={quaternion} ref={meshRef}>
      <cylinderGeometry args={[0.04, 0.04, height, 8]} />
      <meshStandardMaterial 
        color={highlighted ? "#06B6D4" : "#1e293b"} 
        emissive={highlighted ? "#06B6D4" : "#000000"}
        emissiveIntensity={highlighted ? 2 : 0}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
};

const Joint: React.FC<{ position: [number, number, number], label?: string, highlighted?: boolean }> = ({ position, label, highlighted }) => (
  <group position={position}>
    <mesh>
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshStandardMaterial 
        color={highlighted ? "#06B6D4" : "#334155"} 
        emissive={highlighted ? "#06B6D4" : "#000000"}
        emissiveIntensity={highlighted ? 4 : 0}
      />
    </mesh>
    {highlighted && label && (
      <Text
        position={[0.3, 0, 0]}
        fontSize={0.12}
        color="#06B6D4"
        font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyeMZhrib2Bg-4.ttf"
      >
        {label.toUpperCase()}
      </Text>
    )}
  </group>
);

const HumanSkeleton: React.FC<{ highlightArea?: string }> = ({ highlightArea }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Anatomik Koordinat Sistemi
  const joints = {
    head: [0, 1.8, 0] as [number, number, number],
    neck: [0, 1.5, 0] as [number, number, number],
    lShoulder: [-0.4, 1.4, 0] as [number, number, number],
    rShoulder: [0.4, 1.4, 0] as [number, number, number],
    lElbow: [-0.45, 0.9, 0.1] as [number, number, number],
    rElbow: [0.45, 0.9, 0.1] as [number, number, number],
    lWrist: [-0.5, 0.4, 0.2] as [number, number, number],
    rWrist: [0.5, 0.4, 0.2] as [number, number, number],
    pelvis: [0, 0.8, 0] as [number, number, number],
    lHip: [-0.2, 0.75, 0] as [number, number, number],
    rHip: [0.2, 0.75, 0] as [number, number, number],
    lKnee: [-0.22, 0.2, 0.1] as [number, number, number],
    rKnee: [0.22, 0.2, 0.1] as [number, number, number],
    lAnkle: [-0.25, -0.4, 0] as [number, number, number],
    rAnkle: [0.25, -0.4, 0] as [number, number, number],
  };

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  const isHighlighted = (area: string) => {
    if (!highlightArea) return false;
    return highlightArea.toLowerCase().includes(area.toLowerCase());
  };

  return (
    <group ref={groupRef}>
      {/* Spine & Head */}
      <Bone start={joints.head} end={joints.neck} highlighted={isHighlighted('cervical')} />
      <Bone start={joints.neck} end={joints.pelvis} highlighted={isHighlighted('spine') || isHighlighted('lumbar')} />
      
      {/* Arms */}
      <Bone start={joints.neck} end={joints.lShoulder} />
      <Bone start={joints.neck} end={joints.rShoulder} />
      <Bone start={joints.lShoulder} end={joints.lElbow} highlighted={isHighlighted('shoulder')} />
      <Bone start={joints.rShoulder} end={joints.rElbow} highlighted={isHighlighted('shoulder')} />
      <Bone start={joints.lElbow} end={joints.lWrist} />
      <Bone start={joints.rElbow} end={joints.rWrist} />

      {/* Legs */}
      <Bone start={joints.pelvis} end={joints.lHip} highlighted={isHighlighted('pelvis') || isHighlighted('hip')} />
      <Bone start={joints.pelvis} end={joints.rHip} highlighted={isHighlighted('pelvis') || isHighlighted('hip')} />
      <Bone start={joints.lHip} end={joints.lKnee} highlighted={isHighlighted('knee')} />
      <Bone start={joints.rHip} end={joints.rKnee} highlighted={isHighlighted('knee')} />
      <Bone start={joints.lKnee} end={joints.lAnkle} highlighted={isHighlighted('ankle')} />
      <Bone start={joints.rKnee} end={joints.rAnkle} highlighted={isHighlighted('ankle')} />

      {/* Joints */}
      {Object.entries(joints).map(([name, pos]) => (
        <Joint key={name} position={pos} label={name} highlighted={isHighlighted(name)} />
      ))}
    </group>
  );
};

export const AnatomicalAvatar: React.FC<{ targetArea?: string }> = ({ targetArea }) => {
  return (
    <div className="w-full h-full min-h-[400px] cursor-grab active:cursor-grabbing">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 1, 4]} />
        <OrbitControls 
          enablePan={false} 
          minDistance={2} 
          maxDistance={6}
          target={[0, 0.8, 0]}
        />
        
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#06B6D4" />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />

        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <HumanSkeleton highlightArea={targetArea} />
        </Float>

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
          <planeGeometry args={[10, 10]} />
          <meshStandardMaterial color="#020617" transparent opacity={0.5} />
        </mesh>

        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      </Canvas>
    </div>
  );
};

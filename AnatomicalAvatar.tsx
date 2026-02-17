
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars, Float, Text, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Fix for "Property '...' does not exist on type 'JSX.IntrinsicElements'"
// Manually defining R3F elements to ensure TypeScript recognizes them
declare global {
  namespace JSX {
    interface IntrinsicElements {
      mesh: any;
      group: any;
      cylinderGeometry: any;
      sphereGeometry: any;
      meshStandardMaterial: any;
      ambientLight: any;
      pointLight: any;
    }
  }
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        mesh: any;
        group: any;
        cylinderGeometry: any;
        sphereGeometry: any;
        meshStandardMaterial: any;
        ambientLight: any;
        pointLight: any;
      }
    }
  }
}

interface BoneProps {
  start: [number, number, number];
  end: [number, number, number];
  highlighted?: boolean;
  layer?: 'muscular' | 'skeletal' | 'vascular' | 'xray';
}

const Bone: React.FC<BoneProps> = ({ start, end, highlighted, layer = 'skeletal' }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const points = useMemo(() => [new THREE.Vector3(...start), new THREE.Vector3(...end)], [start, end]);
  const height = points[0].distanceTo(points[1]);
  const position = new THREE.Vector3().addVectors(points[0], points[1]).multiplyScalar(0.5);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3().subVectors(points[1], points[0]).normalize());

  // Katmana göre görsel stil ayarları
  const getMaterialProps = () => {
    switch(layer) {
      case 'muscular': 
        return { color: highlighted ? "#ef4444" : "#7f1d1d", roughness: 0.3, metalness: 0.1, thickness: 0.12 };
      case 'vascular': 
        return { color: highlighted ? "#22d3ee" : "#1e40af", roughness: 0, metalness: 1, thickness: 0.02 };
      case 'xray': 
        return { color: "#ffffff", emissive: "#06b6d4", emissiveIntensity: highlighted ? 10 : 2, transparent: true, opacity: 0.5, thickness: 0.05 };
      default: // skeletal
        return { color: highlighted ? "#06B6D4" : "#e2e8f0", roughness: 0.8, metalness: 0, thickness: 0.06 };
    }
  };

  const { thickness, ...materialProps } = getMaterialProps();

  return (
    <mesh position={position} quaternion={quaternion} ref={meshRef}>
      <cylinderGeometry args={[thickness, thickness, height, 8]} />
      <meshStandardMaterial {...materialProps} />
    </mesh>
  );
};

const Joint: React.FC<{ position: [number, number, number], label?: string, highlighted?: boolean, layer?: string }> = ({ position, label, highlighted, layer }) => (
  <group position={position}>
    <mesh>
      <sphereGeometry args={[layer === 'vascular' ? 0.03 : 0.09, 16, 16]} />
      <meshStandardMaterial 
        color={layer === 'xray' ? "#ffffff" : highlighted ? "#06B6D4" : "#334155"} 
        emissive={highlighted ? "#06B6D4" : "#000000"}
        emissiveIntensity={highlighted ? 4 : 0}
      />
    </mesh>
    {highlighted && label && layer !== 'xray' && (
      <Text position={[0.4, 0, 0]} fontSize={0.12} color="#06B6D4" font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyeMZhrib2Bg-4.ttf">
        {label.toUpperCase()}
      </Text>
    )}
  </group>
);

export const AnatomicalAvatar: React.FC<{ targetArea?: string, layer?: any }> = ({ targetArea, layer = 'skeletal' }) => {
  const joints = {
    head: [0, 1.8, 0] as [number, number, number], neck: [0, 1.5, 0] as [number, number, number],
    lShoulder: [-0.4, 1.4, 0] as [number, number, number], rShoulder: [0.4, 1.4, 0] as [number, number, number],
    lHip: [-0.2, 0.75, 0] as [number, number, number], rHip: [0.2, 0.75, 0] as [number, number, number],
    lKnee: [-0.22, 0.2, 0.1] as [number, number, number], rKnee: [0.22, 0.2, 0.1] as [number, number, number],
    pelvis: [0, 0.8, 0] as [number, number, number]
  };

  const isHighlighted = (area: string) => targetArea?.toLowerCase().includes(area.toLowerCase());

  return (
    <div className="w-full h-full min-h-[400px]">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 1.2, 4]} />
        <OrbitControls enablePan={false} minDistance={2} maxDistance={6} target={[0, 0.8, 0]} />
        <ambientLight intensity={layer === 'xray' ? 1.5 : 0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#06B6D4" />
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <group>
            <Bone start={joints.head} end={joints.neck} highlighted={isHighlighted('head')} layer={layer} />
            <Bone start={joints.neck} end={joints.pelvis} highlighted={isHighlighted('spine')} layer={layer} />
            <Bone start={joints.pelvis} end={joints.lHip} highlighted={isHighlighted('hip')} layer={layer} />
            <Bone start={joints.pelvis} end={joints.rHip} highlighted={isHighlighted('hip')} layer={layer} />
            <Bone start={joints.lHip} end={joints.lKnee} highlighted={isHighlighted('knee')} layer={layer} />
            <Bone start={joints.rHip} end={joints.rKnee} highlighted={isHighlighted('knee')} layer={layer} />
            {Object.entries(joints).map(([n, p]) => <Joint key={n} position={p} label={n} highlighted={isHighlighted(n)} layer={layer} />)}
          </group>
        </Float>
        {layer !== 'xray' && <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />}
      </Canvas>
    </div>
  );
};

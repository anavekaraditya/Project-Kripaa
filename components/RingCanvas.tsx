"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

type Props = { progress: number; active: boolean };

function Ring({ progress }: { progress: number }) {
  const inner = useRef<THREE.Group>(null);
  const outer = useRef<THREE.Group>(null);
  const loose = useRef<THREE.Group>(null);
  const looseBeads = useRef<THREE.Mesh[]>([]);
  const targetProgress = useRef(progress);
  const displayProgress = useRef(progress);
  const metal = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#c5d0df", metalness: 1, roughness: 0.16, clearcoat: 0.35, clearcoatRoughness: 0.15 }), []);
  const beadGeometry = useMemo(() => new THREE.SphereGeometry(0.2, 32, 32), []);
  const innerGeometry = useMemo(() => new THREE.TorusGeometry(1.53, 0.16, 24, 96), []);
  const outerGeometry = useMemo(() => new THREE.TorusGeometry(1.86, 0.19, 24, 96), []);
  useEffect(() => { targetProgress.current = progress; }, [progress]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (!inner.current || !outer.current || !loose.current) return;
    const p = displayProgress.current = THREE.MathUtils.damp(displayProgress.current, targetProgress.current, 8, state.clock.getDelta());
    const assembly = THREE.MathUtils.clamp((p - 0.12) / 0.2, 0, 1);
    const mechanism = THREE.MathUtils.clamp((p - 0.35) / 0.12, 0, 1);
    inner.current.rotation.set(0.18 - mechanism * 0.12, 0.12 + mechanism * 0.3, 0);
    outer.current.rotation.set(0.18 - mechanism * 0.12, 0.12 + mechanism * 0.3, -p * Math.PI * 1.15);
    inner.current.visible = p > 0.08;
    outer.current.visible = p > 0.08;
    loose.current.visible = p < 0.34;
    looseBeads.current.forEach((bead, i) => {
      const a = i * 2.399 + 0.4;
      const orbit = 2.8 + (i % 3) * 0.52;
      bead.position.set(THREE.MathUtils.lerp(Math.cos(a) * orbit, Math.cos(i * Math.PI * 2 / 9 - Math.PI / 2) * 1.86, assembly), THREE.MathUtils.lerp(Math.sin(a) * orbit * 0.72, Math.sin(i * Math.PI * 2 / 9 - Math.PI / 2) * 1.86, assembly), 0.1);
      bead.scale.setScalar(1 - assembly * 0.03);
    });
    loose.current.rotation.z = Math.sin(t * 0.18) * 0.035;
  });

  return <group>
    <group ref={inner} visible={progress > 0.08}><mesh geometry={innerGeometry} material={metal} /></group>
    <group ref={outer} visible={progress > 0.08}>
      <mesh geometry={outerGeometry} material={metal} />
      {Array.from({ length: 9 }, (_, i) => {
        const a = i * (Math.PI * 2 / 9) - Math.PI / 2;
        return <mesh key={i} geometry={beadGeometry} material={metal} position={[Math.cos(a) * 1.86, Math.sin(a) * 1.86, 0.07]} />;
      })}
    </group>
    <group ref={loose} visible={progress < 0.34}>
      {Array.from({ length: 9 }, (_, i) => {
        const a = i * 2.399 + 0.4;
        const orbit = 2.8 + (i % 3) * 0.52;
        const x = Math.cos(a) * orbit;
        const y = Math.sin(a) * orbit * 0.72;
        return <mesh key={i} ref={(node) => { if (node) looseBeads.current[i] = node; }} geometry={beadGeometry} material={metal} position={[x, y, 0.1]} />;
      })}
    </group>
  </group>;
}

function CameraRig({ progress }: { progress: number }) {
  const targetProgress = useRef(progress);
  const displayProgress = useRef(progress);
  useEffect(() => { targetProgress.current = progress; }, [progress]);
  useFrame(({ camera }, delta) => {
    const p = displayProgress.current = THREE.MathUtils.damp(displayProgress.current, targetProgress.current, 8, delta);
    const macro = THREE.MathUtils.smoothstep(p, 0.34, 0.52);
    camera.position.lerp(new THREE.Vector3(0.45 + macro * 0.58, 0.05 - macro * 0.08, 7.6 - macro * 3.15), 0.07);
    camera.lookAt(0.45, 0, 0);
  });
  return null;
}

export default function RingCanvas({ progress, active }: Props) {
  return <Canvas className="ring-canvas" style={{ background: "#03060d" }} dpr={[1, 1.5]} frameloop={active ? "always" : "never"} camera={{ position: [0.45, 0.05, 7.6], fov: 36 }} gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }} onCreated={({ gl }) => gl.setClearColor(new THREE.Color("#03060d"), 1)} fallback={<div className="canvas-fallback" />}>
    <color attach="background" args={["#03060d"]} />
    <ambientLight intensity={0.4} />
    <spotLight position={[-4, 5, 6]} intensity={100} angle={0.55} penumbra={1} color="#dbe8ff" />
    <pointLight position={[4, -2, 3]} intensity={32} color="#779ed6" />
    <CameraRig progress={progress} />
    <Ring progress={progress} />
  </Canvas>;
}

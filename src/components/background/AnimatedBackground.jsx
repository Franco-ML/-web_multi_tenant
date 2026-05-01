import { Canvas, useFrame } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import { useRef } from 'react'
import { useTenantStore } from '../../store/useTenantStore'

function Scene() {
  const groupRef = useRef()

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.x += delta * 0.01
      groupRef.current.rotation.y += delta * 0.015
    }
  })

  return (
    <group ref={groupRef}>
      <Stars
        radius={80}
        depth={50}
        count={3000}
        factor={3}
        saturation={0.1}
        fade
        speed={0.4}
      />
    </group>
  )
}

export default function AnimatedBackground() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 0,
      pointerEvents: 'none',
    }}>
      <Canvas
        camera={{ position: [0, 0, 1], fov: 60 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: false }}
      >
        <Scene />
      </Canvas>
    </div>
  )
}

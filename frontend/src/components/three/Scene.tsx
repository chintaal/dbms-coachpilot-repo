'use client'

import { Canvas } from '@react-three/fiber'
import { ReactNode, Suspense } from 'react'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'

interface SceneProps {
  children: ReactNode
  cameraPosition?: [number, number, number]
  enableControls?: boolean
  className?: string
}

export function Scene({
  children,
  cameraPosition = [0, 0, 5],
  enableControls = false,
  className = '',
}: SceneProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
      >
        <PerspectiveCamera makeDefault position={cameraPosition} fov={75} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        {enableControls && <OrbitControls enableZoom={false} enablePan={false} />}
        <Suspense fallback={null}>{children}</Suspense>
      </Canvas>
    </div>
  )
}

'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh } from 'three'

interface Navigation3DProps {
  items: Array<{ label: string; position: [number, number, number] }>
  activeIndex?: number
}

export function Navigation3D({ items, activeIndex = 0 }: Navigation3DProps) {
  const meshesRef = useRef<Mesh[]>([])

  useFrame((state) => {
    meshesRef.current.forEach((mesh, index) => {
      if (mesh) {
        const isActive = index === activeIndex
        mesh.rotation.y = Math.sin(state.clock.elapsedTime + index) * 0.1
        mesh.scale.setScalar(isActive ? 1.2 : 1)
      }
    })
  })

  return (
    <>
      {items.map((item, index) => (
        <mesh
          key={index}
          ref={(el) => {
            if (el) meshesRef.current[index] = el
          }}
          position={item.position}
        >
          <boxGeometry args={[0.5, 0.5, 0.1]} />
          <meshStandardMaterial
            color={index === activeIndex ? '#3b82f6' : '#6b7280'}
            transparent
            opacity={0.8}
            emissive={index === activeIndex ? '#3b82f6' : '#6b7280'}
            emissiveIntensity={index === activeIndex ? 0.5 : 0.2}
          />
        </mesh>
      ))}
    </>
  )
}

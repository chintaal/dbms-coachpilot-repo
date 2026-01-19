'use client'

import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { Mesh } from 'three'

interface BackgroundProps {
  particleCount?: number
  speed?: number
  mouseInteraction?: boolean
}

export function Background({
  particleCount = 2000,
  speed = 0.5,
  mouseInteraction = true,
}: BackgroundProps) {
  const particlesRef = useRef<THREE.Points>(null)
  const shapesRef = useRef<Mesh[]>([])

  // Generate random particle positions
  const particles = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20
    }
    return positions
  }, [particleCount])

  // Mouse position tracking
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (!mouseInteraction || typeof window === 'undefined') return

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [mouseInteraction])

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.x = state.clock.elapsedTime * 0.1 * speed
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.15 * speed

      if (mouseInteraction) {
        particlesRef.current.rotation.x += mouseRef.current.y * 0.1
        particlesRef.current.rotation.y += mouseRef.current.x * 0.1
      }
    }

    // Animate geometric shapes
    shapesRef.current.forEach((shape, index) => {
      if (shape) {
        shape.rotation.x = state.clock.elapsedTime * (0.2 + index * 0.1) * speed
        shape.rotation.y = state.clock.elapsedTime * (0.15 + index * 0.1) * speed
        shape.position.y = Math.sin(state.clock.elapsedTime + index) * 0.5
      }
    })
  })

  return (
    <>
      {/* Particle System */}
      <Points ref={particlesRef} positions={particles} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#3b82f6"
          size={0.05}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.6}
        />
      </Points>

      {/* Geometric Shapes */}
      <mesh
        ref={(el) => {
          if (el) shapesRef.current[0] = el
        }}
        position={[-3, 1, -2]}
      >
        <torusGeometry args={[0.5, 0.2, 16, 100]} />
        <meshStandardMaterial
          color="#8b5cf6"
          transparent
          opacity={0.4}
          emissive="#8b5cf6"
          emissiveIntensity={0.2}
        />
      </mesh>

      <mesh
        ref={(el) => {
          if (el) shapesRef.current[1] = el
        }}
        position={[3, -1, -3]}
      >
        <octahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial
          color="#22c55e"
          transparent
          opacity={0.4}
          emissive="#22c55e"
          emissiveIntensity={0.2}
        />
      </mesh>

      <mesh
        ref={(el) => {
          if (el) shapesRef.current[2] = el
        }}
        position={[0, -2, -4]}
      >
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial
          color="#ec4899"
          transparent
          opacity={0.4}
          emissive="#ec4899"
          emissiveIntensity={0.2}
        />
      </mesh>
    </>
  )
}

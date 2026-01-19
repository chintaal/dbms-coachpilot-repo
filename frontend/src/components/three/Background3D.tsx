'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Lazy load Three.js components to reduce initial bundle size
const Scene = dynamic(() => import('./Scene').then((mod) => ({ default: mod.Scene })), {
  ssr: false,
  loading: () => null,
})

const Background = dynamic(() => import('./Background').then((mod) => ({ default: mod.Background })), {
  ssr: false,
  loading: () => null,
})

export function Background3D() {
  return (
    <div className="fixed inset-0 -z-10 opacity-30 dark:opacity-20">
      <Suspense fallback={null}>
        <Scene cameraPosition={[0, 0, 5]}>
          <Background particleCount={1500} speed={0.3} mouseInteraction={true} />
        </Scene>
      </Suspense>
    </div>
  )
}

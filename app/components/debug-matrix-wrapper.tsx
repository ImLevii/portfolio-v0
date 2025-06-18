'use client'

import dynamic from 'next/dynamic'

const DebugMatrix = dynamic(() => import('@/components/debug-matrix'), {
  ssr: false,
})

export default function DebugMatrixWrapper() {
  return <DebugMatrix />
} 
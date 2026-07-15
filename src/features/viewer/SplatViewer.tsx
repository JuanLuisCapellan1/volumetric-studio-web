import { useRef } from 'react'
import { useGaussianSplat } from './useGaussianSplat'

interface SplatViewerProps {
  splatUrl: string
  className?: string
}

export function SplatViewer({ splatUrl, className = '' }: SplatViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null!)
  const { status, error } = useGaussianSplat(containerRef, splatUrl)

  return (
    <div className={`relative w-full aspect-video rounded-xl overflow-hidden bg-black ${className}`}>
      <div ref={containerRef} className="absolute inset-0" />

      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <p className="text-sm text-neutral-300">Cargando modelo 3D…</p>
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <p className="text-sm text-red-400 px-4 text-center">{error}</p>
        </div>
      )}
    </div>
  )
}
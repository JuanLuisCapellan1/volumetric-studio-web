// src/features/viewer/useGaussianSplat.ts
import { useEffect, useRef, useState } from 'react'
import * as GaussianSplats3D from '@mkkellogg/gaussian-splats-3d'

type ViewerLoadStatus = 'idle' | 'loading' | 'ready' | 'error'

interface UseGaussianSplatResult {
  status: ViewerLoadStatus
  error: string | null
}

export function useGaussianSplat(
  containerRef: React.RefObject<HTMLDivElement>,
  splatUrl: string | null,
): UseGaussianSplatResult {
  const [status, setStatus] = useState<ViewerLoadStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const viewerRef = useRef<GaussianSplats3D.Viewer | null>(null)

  useEffect(() => {
    if (!splatUrl || !containerRef.current) return

    let isMounted = true
    setStatus('loading')
    setError(null)

    const viewer = new GaussianSplats3D.Viewer({
      rootElement: containerRef.current,
      cameraUp: [0, 1, 0],
      initialCameraPosition: [0, 1, 5],
      initialCameraLookAt: [0, 0, 0],
      sharedMemoryForWorkers: false,
      selfDrivenMode: true,
    })

    viewerRef.current = viewer

    // try/catch síncrono ENVOLVIENDO la llamada -- red de seguridad extra
    // para errores que la librería lance fuera de la cadena de promesas
    // (como el "Uncaught Error" que vimos antes de aplicar el fix de formato).
    try {
      viewer
        .addSplatScene(splatUrl, {
          splatAlphaRemovalThreshold: 5,
          showLoadingUI: false,
          format: GaussianSplats3D.SceneFormat.Ply,
        })
        .then(() => {
          if (!isMounted) return
          viewer.start()
          setStatus('ready')
        })
        .catch((err: unknown) => {
          if (!isMounted) return
          setError(err instanceof Error ? err.message : 'No se pudo cargar el modelo 3D')
          setStatus('error')
        })
    } catch (err: unknown) {
      if (isMounted) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar el modelo 3D')
        setStatus('error')
      }
    }

    return () => {
      isMounted = false
      viewer.dispose()
      viewerRef.current = null
    }
  }, [splatUrl, containerRef])

  return { status, error }
}
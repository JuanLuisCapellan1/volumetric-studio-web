import { useCallback, useRef, useState } from 'react'
import { ChunkedUploader, type UploadProgress } from './ChunkedUploader'

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error' | 'cancelled'

interface UseUploadResult {
  status: UploadStatus
  progress: UploadProgress | null
  modelId: string | null
  error: string | null
  startUpload: (file: File) => void
  cancelUpload: () => void
}

export function useUpload(getAuthToken: () => string | null): UseUploadResult {
  const [status, setStatus] = useState<UploadStatus>('idle')
  const [progress, setProgress] = useState<UploadProgress | null>(null)
  const [modelId, setModelId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // El uploader vive en un ref: no queremos que se re-cree en cada render
  const uploaderRef = useRef<ChunkedUploader | null>(null)

  const startUpload = useCallback(
    (file: File) => {
      const uploader = new ChunkedUploader(import.meta.env.VITE_API_BASE_URL, getAuthToken)
      uploaderRef.current = uploader

      setStatus('uploading')
      setError(null)
      setProgress(null)

      uploader
        .upload(file, (p) => setProgress(p))
        .then((result) => {
          setModelId(result.modelId)
          setStatus('success')
        })
        .catch((err) => {
          if (err instanceof DOMException && err.name === 'AbortError') {
            setStatus('cancelled')
            return
          }
          setError(err instanceof Error ? err.message : 'Error desconocido al subir el archivo')
          setStatus('error')
        })
    },
    [getAuthToken],
  )

  const cancelUpload = useCallback(() => {
    uploaderRef.current?.cancel()
  }, [])

  return { status, progress, modelId, error, startUpload, cancelUpload }
}
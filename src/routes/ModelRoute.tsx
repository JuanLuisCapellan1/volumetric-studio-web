import { useParams, Navigate } from 'react-router-dom'
import { ModelPage } from '../features/model/ModelPage.tsx'

export function ModelRoute() {
  const { modelId } = useParams<{ modelId: string }>()

  // useParams tipa modelId como string | undefined; nunca asumas que existe
  if (!modelId) return <Navigate to="/" replace />

  return <ModelPage modelId={modelId} />
}
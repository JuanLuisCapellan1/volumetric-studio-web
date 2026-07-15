import { useNavigate } from 'react-router-dom'
import { UploadPage } from '../features/upload/UploadPage'
import { useAuthToken } from '../auth/useAuthToken'

export function UploadRoute() {
  const navigate = useNavigate()
  const { getAccessToken } = useAuthToken()

  const handleModelCreated = (modelId: string) => {
    navigate(`/models/${modelId}`)
  }

  return (
    <UploadPage getAuthToken={getAccessToken} onModelCreated={handleModelCreated} />
  )
}
import { Routes, Route, Navigate } from 'react-router-dom'
import { HomePage } from './routes/HomePage'
import { UploadRoute } from './routes/UploadRoute'
import { ModelRoute } from './routes/ModelRoute'
import { LoginPage } from './auth/LoginPage.tsx'
import { ProtectedRoute } from './auth/ProtectedRoute.tsx'
import { AppLayout } from './components/AppLayout'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/upload" element={<UploadRoute />} />
          <Route path="/models/:modelId" element={<ModelRoute />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
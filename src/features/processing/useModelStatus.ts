import { useEffect, useRef, useState } from 'react'
import * as signalR from '@microsoft/signalr'
import { useAuthToken } from '../../auth/useAuthToken'

export type ProcessingStage =
  | 'En cola'
  | 'Extrayendo fotogramas'
  | 'Alineando cámaras'
  | 'Entrenando IA'
  | 'Generando archivo final'
  | 'Completado'
  | 'Error'

interface ModelStatusUpdate {
  modelId: string
  stage: ProcessingStage
  progress: number
  splatUrl?: string
  errorMessage?: string
}

type ConnectionState = 'connecting' | 'connected' | 'reconnecting' | 'disconnected'

interface UseModelStatusResult {
  stage: ProcessingStage | null
  progress: number
  splatUrl: string | null
  error: string | null
  connectionState: ConnectionState
}

export function useModelStatus(modelId: string | null): UseModelStatusResult {
  const { getAccessToken } = useAuthToken()

  const [stage, setStage] = useState<ProcessingStage | null>(null)
  const [progress, setProgress] = useState(0)
  const [splatUrl, setSplatUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [connectionState, setConnectionState] = useState<ConnectionState>('connecting')

  const connectionRef = useRef<signalR.HubConnection | null>(null)

  useEffect(() => {
    if (!modelId) return

    let isMounted = true

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${import.meta.env.VITE_HUB_URL}/modelStatusHub`, {
        accessTokenFactory: () => getAccessToken() ?? '',
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 20000])
      .configureLogging(signalR.LogLevel.Warning)
      .build()

    connectionRef.current = connection

    connection.on('ReceiveModelStatus', (data: ModelStatusUpdate) => {
      if (!isMounted || data.modelId !== modelId) return
      setStage(data.stage)
      setProgress(data.progress)
      if (data.splatUrl) setSplatUrl(data.splatUrl)
      if (data.stage === 'Error' && data.errorMessage) setError(data.errorMessage)
    })

    connection.onreconnecting(() => isMounted && setConnectionState('reconnecting'))
    connection.onreconnected(() => {
      if (!isMounted) return
      setConnectionState('connected')
      connection.invoke('SubscribeToModel', modelId).catch(() => setError('No se pudo re-suscribir'))
    })
    connection.onclose(() => isMounted && setConnectionState('disconnected'))

    connection
      .start()
      .then(() => {
        if (!isMounted) return
        setConnectionState('connected')
        return connection.invoke('SubscribeToModel', modelId)
      })
      .catch(() => {
        if (isMounted) setError('No se pudo conectar al servidor de estado')
      })

    return () => {
      isMounted = false
      connection.stop()
    }
  }, [modelId, getAccessToken])

  return { stage, progress, splatUrl, error, connectionState }
}
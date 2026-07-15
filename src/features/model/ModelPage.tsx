import { useState } from 'react'
import { ProcessingStatus } from '../processing/ProcessingStatus'
import { SplatViewer } from '../viewer/SplatViewer'

interface ModelPageProps {
  modelId: string
}

export function ModelPage({ modelId }: ModelPageProps) {
  const [splatUrl, setSplatUrl] = useState<string | null>(null)

  if (splatUrl) {
    return <SplatViewer splatUrl={splatUrl} className="max-w-4xl mx-auto" />
  }

  return <ProcessingStatus modelId={modelId} onCompleted={setSplatUrl} />
}
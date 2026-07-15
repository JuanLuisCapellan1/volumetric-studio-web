const CHUNK_SIZE = 5 * 1024 * 1024 // 5MB, según tu especificación
const MAX_RETRIES_PER_CHUNK = 3

export interface UploadProgress {
  uploadedChunks: number
  totalChunks: number
  percentage: number
}

export interface ChunkedUploadResult {
  modelId: string
}

interface InitUploadResponse {
  uploadId: string
  totalChunks: number
}

export class ChunkedUploader {
  private abortController: AbortController | null = null
  private readonly apiBaseUrl: string
  private readonly getAuthToken: () => string | null

  constructor(apiBaseUrl: string, getAuthToken: () => string | null) {
    this.apiBaseUrl = apiBaseUrl
    this.getAuthToken = getAuthToken
  }

  async upload(
    file: File,
    onProgress: (progress: UploadProgress) => void,
  ): Promise<ChunkedUploadResult> {
    this.abortController = new AbortController()
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE)

    const initRes = await this.initUpload(file, totalChunks)
    const { uploadId } = initRes

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * CHUNK_SIZE
      const end = Math.min(start + CHUNK_SIZE, file.size)
      const chunkBlob = file.slice(start, end)

      await this.uploadChunkWithRetry(uploadId, chunkIndex, chunkBlob)

      onProgress({
        uploadedChunks: chunkIndex + 1,
        totalChunks,
        percentage: Math.round(((chunkIndex + 1) / totalChunks) * 100),
      })
    }

    const { modelId } = await this.finalizeUpload(uploadId)
    return { modelId }
  }

  cancel(): void {
    this.abortController?.abort()
  }

  private async initUpload(file: File, totalChunks: number): Promise<InitUploadResponse> {
    const res = await fetch(`${this.apiBaseUrl}/uploads/init`, {
      method: 'POST',
      headers: this.buildHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        totalChunks,
      }),
      signal: this.abortController?.signal,
    })

    if (!res.ok) throw new Error(`No se pudo iniciar la subida (${res.status})`)
    return res.json()
  }

  private async uploadChunkWithRetry(
    uploadId: string,
    chunkIndex: number,
    chunk: Blob,
    attempt = 1,
  ): Promise<void> {
    try {
      const formData = new FormData()
      formData.append('chunk', chunk)
      formData.append('chunkIndex', String(chunkIndex))

      const res = await fetch(`${this.apiBaseUrl}/uploads/${uploadId}/chunk`, {
        method: 'POST',
        headers: this.buildHeaders(),
        body: formData,
        signal: this.abortController?.signal,
      })

      if (!res.ok) throw new Error(`Chunk ${chunkIndex} falló (${res.status})`)
    } catch (err) {
      if (this.abortController?.signal.aborted) throw err

      if (attempt < MAX_RETRIES_PER_CHUNK) {
        await this.delay(500 * attempt) // backoff simple
        return this.uploadChunkWithRetry(uploadId, chunkIndex, chunk, attempt + 1)
      }
      throw new Error(`Chunk ${chunkIndex} falló tras ${MAX_RETRIES_PER_CHUNK} intentos`)
    }
  }

  private async finalizeUpload(uploadId: string): Promise<ChunkedUploadResult> {
    const res = await fetch(`${this.apiBaseUrl}/uploads/${uploadId}/complete`, {
      method: 'POST',
      headers: this.buildHeaders(),
      signal: this.abortController?.signal,
    })

    if (!res.ok) throw new Error(`No se pudo finalizar la subida (${res.status})`)
    return res.json()
  }

  private buildHeaders(extra: Record<string, string> = {}): HeadersInit {
    const token = this.getAuthToken()
    return {
      ...extra,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
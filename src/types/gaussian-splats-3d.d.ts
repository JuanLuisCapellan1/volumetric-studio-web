// src/types/gaussian-splats-3d.d.ts
declare module '@mkkellogg/gaussian-splats-3d' {
  export interface ViewerOptions {
    rootElement?: HTMLElement
    cameraUp?: [number, number, number]
    initialCameraPosition?: [number, number, number]
    initialCameraLookAt?: [number, number, number]
    sharedMemoryForWorkers?: boolean
    selfDrivenMode?: boolean
  }

  export interface AddSplatSceneOptions {
    splatAlphaRemovalThreshold?: number
    showLoadingUI?: boolean
    position?: [number, number, number]
    rotation?: [number, number, number, number]
    scale?: [number, number, number]
  }

  export class Viewer {
    constructor(options: ViewerOptions)
    addSplatScene(url: string, options?: AddSplatSceneOptions): Promise<void>
    start(): void
    stop(): void
    dispose(): void
  }
}
import { useCallback, useEffect } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { useUpload } from "./useUpload";

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB, ajusta según tu límite real
const ACCEPTED_FORMATS = { "video/mp4": [".mp4"], "video/quicktime": [".mov"] };

interface UploadPageProps {
  getAuthToken: () => string | null;
  onModelCreated: (modelId: string) => void;
}

export function UploadPage({ getAuthToken, onModelCreated }: UploadPageProps) {
  const { status, progress, modelId, error, startUpload, cancelUpload } =
    useUpload(getAuthToken);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejections: FileRejection[]) => {
      if (rejections.length > 0) return; // el mensaje de error se muestra abajo
      const file = acceptedFiles[0];
      if (file) startUpload(file);
    },
    [startUpload],
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: ACCEPTED_FORMATS,
      maxSize: MAX_FILE_SIZE,
      maxFiles: 1,
      disabled: status === "uploading",
    });

  useEffect(() => {
    if (modelId && status === "success") {
      onModelCreated(modelId);
    }
  }, [modelId, status, onModelCreated]);

  return (
    <div className="max-w-xl mx-auto p-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-blue-500 bg-blue-500/10" : "border-neutral-700"
        } ${status === "uploading" ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        <input {...getInputProps()} />
        <p className="text-neutral-300">
          {isDragActive
            ? "Suelta el video aquí…"
            : "Arrastra un video (MP4 o MOV, 30-60s) o haz clic para seleccionar"}
        </p>
      </div>

      {fileRejections.length > 0 && (
        <p className="mt-2 text-sm text-red-400">
          Archivo inválido: verifica formato (MP4/MOV) y tamaño máximo.
        </p>
      )}

      {status === "uploading" && progress && (
        <div className="mt-4">
          <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-neutral-400">
            <span>
              {progress.uploadedChunks}/{progress.totalChunks} fragmentos
            </span>
            <button
              onClick={cancelUpload}
              className="text-red-400 hover:underline"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {status === "error" && error && (
        <p className="mt-3 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}

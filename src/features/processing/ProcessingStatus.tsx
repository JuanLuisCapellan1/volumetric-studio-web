import { useEffect } from "react";
import { useModelStatus } from "./useModelStatus";

interface ProcessingStatusProps {
  modelId: string;
  onCompleted: (splatUrl: string) => void;
}

const STAGES: string[] = [
  "En cola",
  "Extrayendo fotogramas",
  "Alineando cámaras",
  "Entrenando IA",
  "Generando archivo final",
  "Completado",
];

export function ProcessingStatus({
  modelId,
  onCompleted,
}: ProcessingStatusProps) {
  const { stage, progress, splatUrl, error, connectionState } =
    useModelStatus(modelId);

  useEffect(() => {
    if (splatUrl) onCompleted(splatUrl);
  }, [splatUrl, onCompleted]);

  const currentIndex = stage ? STAGES.indexOf(stage) : -1;

  return (
    <div className="w-full max-w-xl mx-auto p-6 rounded-xl bg-neutral-900 text-neutral-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Procesando tu modelo 3D</h3>
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            connectionState === "connected"
              ? "bg-emerald-600/20 text-emerald-400"
              : connectionState === "reconnecting"
                ? "bg-amber-600/20 text-amber-400"
                : "bg-red-600/20 text-red-400"
          }`}
        >
          {connectionState === "connected"
            ? "Conectado"
            : connectionState === "reconnecting"
              ? "Reconectando…"
              : connectionState === "connecting"
                ? "Conectando…"
                : "Desconectado"}
        </span>
      </div>

      <ol className="space-y-2">
        {STAGES.map((s, i) => (
          <li
            key={s}
            className={`text-sm ${
              i < currentIndex
                ? "text-emerald-400"
                : i === currentIndex
                  ? "text-white font-medium"
                  : "text-neutral-500"
            }`}
          >
            {s}
          </li>
        ))}
      </ol>

      {stage && stage !== "Completado" && stage !== "Error" && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-neutral-400 mb-1">
            <span>{stage}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
    </div>
  );
}

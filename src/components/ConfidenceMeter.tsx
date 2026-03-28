"use client";

interface ConfidenceMeterProps {
  confidence: number;
  success: boolean;
}

/**
 * Componente visual para exibir o nível de confiança da autenticação.
 */
export default function ConfidenceMeter({
  confidence,
  success,
}: ConfidenceMeterProps) {
  const clampedConfidence = Math.max(0, Math.min(100, confidence));
  const color = success
    ? "var(--color-success)"
    : clampedConfidence > 50
    ? "var(--color-warning)"
    : "var(--color-error)";

  return (
    <div className="confidence-meter">
      <div className="confidence-header">
        <span className="confidence-label">Confiança</span>
        <span className="confidence-value" style={{ color }}>
          {clampedConfidence.toFixed(1)}%
        </span>
      </div>
      <div className="confidence-bar">
        <div
          className="confidence-fill"
          style={{
            width: `${clampedConfidence}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}

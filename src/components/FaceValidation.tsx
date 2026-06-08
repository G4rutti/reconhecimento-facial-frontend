"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import Webcam from "react-webcam";

type CaptureStep = "center" | "left" | "right";

interface FaceValidationProps {
  onComplete: (images: string[]) => void;
  isLoading?: boolean;
}

const STEPS: { key: CaptureStep; label: string; instruction: string; icon: string }[] = [
  { key: "center", label: "Frontal", instruction: "Olhe diretamente para a câmera", icon: "⬆" },
  { key: "left", label: "Esquerda", instruction: "Vire levemente para a esquerda", icon: "⬅" },
  { key: "right", label: "Direita", instruction: "Vire levemente para a direita", icon: "➡" },
];

/**
 * Componente de validação facial estilo app de banco.
 * Captura 3 fotos: frontal, esquerda, direita — com guia visual oval e indicadores de progresso.
 */
export default function FaceValidation({ onComplete, isLoading = false }: FaceValidationProps) {
  const webcamRef = useRef<Webcam>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showFlash, setShowFlash] = useState(false);

  const currentStep = STEPS[currentStepIndex];
  const isComplete = capturedImages.length === 3;

  // Verificar permissão de câmera
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(() => setHasPermission(true))
      .catch(() => setHasPermission(false));
  }, []);

  // Countdown automático antes da captura
  const startCapture = useCallback(() => {
    if (isCapturing || isComplete) return;
    setIsCapturing(true);
    setCountdown(3);
  }, [isCapturing, isComplete]);

  // Timer do countdown
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      // Capturar!
      const imageSrc = webcamRef.current?.getScreenshot();
      if (imageSrc) {
        const base64Data = imageSrc.split(",")[1];
        const newImages = [...capturedImages, base64Data];
        setCapturedImages(newImages);

        // Flash visual
        setShowFlash(true);
        setTimeout(() => setShowFlash(false), 300);

        if (newImages.length === 3) {
          // Todas capturadas — callback
          setTimeout(() => onComplete(newImages), 500);
        } else {
          // Próximo passo
          setCurrentStepIndex((prev) => prev + 1);
        }
      }
      setIsCapturing(false);
      setCountdown(null);
      return;
    }

    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, capturedImages, onComplete]);

  const reset = useCallback(() => {
    setCapturedImages([]);
    setCurrentStepIndex(0);
    setIsCapturing(false);
    setCountdown(null);
  }, []);

  if (hasPermission === false) {
    return (
      <div className="camera-error">
        <div className="camera-error-icon">📷</div>
        <p className="camera-error-title">Câmera não disponível</p>
        <p className="camera-error-text">
          Permita o acesso à câmera nas configurações do navegador.
        </p>
      </div>
    );
  }

  if (hasPermission === null) {
    return (
      <div className="camera-loading">
        <div className="spinner" />
        <p>Acessando câmera...</p>
      </div>
    );
  }

  return (
    <div className="fv-container">
      {/* Câmera com overlay sobreposto */}
      <div className="fv-camera">
        {/* Webcam — posicionada absolutamente para preencher */}
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          screenshotQuality={0.92}
          videoConstraints={{
            width: 640,
            height: 480,
            facingMode: "user",
          }}
          className="fv-video"
          mirrored
        />

        {/* Overlay escuro com recorte oval */}
        <div className="fv-overlay">
          {/* Oval guide border */}
          <div className="fv-oval">
            <div className="fv-oval-border" />
            {/* Progress ring - fica verde conforme captura */}
            <svg className="fv-oval-progress" viewBox="0 0 200 260">
              <ellipse
                cx="100"
                cy="130"
                rx="98"
                ry="128"
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="3"
              />
              <ellipse
                cx="100"
                cy="130"
                rx="98"
                ry="128"
                fill="none"
                stroke="url(#fvGrad)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${(capturedImages.length / 3) * 720} 720`}
                style={{ transition: "stroke-dasharray 0.6s ease" }}
              />
              <defs>
                <linearGradient id="fvGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Indicadores de posição */}
          <div className="fv-dots">
            {/* Centro (topo) */}
            <div className={`fv-dot fv-dot-top ${capturedImages.length >= 1 ? "fv-dot-done" : currentStepIndex === 0 ? "fv-dot-active" : ""}`}>
              {capturedImages.length >= 1 ? "✓" : "⬆"}
            </div>
            {/* Esquerda */}
            <div className={`fv-dot fv-dot-left ${capturedImages.length >= 2 ? "fv-dot-done" : currentStepIndex === 1 ? "fv-dot-active" : ""}`}>
              {capturedImages.length >= 2 ? "✓" : "⬅"}
            </div>
            {/* Direita */}
            <div className={`fv-dot fv-dot-right ${capturedImages.length >= 3 ? "fv-dot-done" : currentStepIndex === 2 ? "fv-dot-active" : ""}`}>
              {capturedImages.length >= 3 ? "✓" : "➡"}
            </div>
          </div>
        </div>

        {/* Flash de captura */}
        {showFlash && <div className="fv-flash" />}

        {/* Countdown overlay */}
        {countdown !== null && countdown > 0 && (
          <div className="fv-countdown">
            <span className="fv-countdown-number">{countdown}</span>
          </div>
        )}
      </div>

      {/* Instrução atual */}
      {!isComplete && (
        <div className="fv-instruction">
          <div className="fv-step-badge">
            <span className="fv-step-count">{capturedImages.length + 1}/3</span>
          </div>
          <p className="fv-instruction-text">
            <span className="fv-instruction-icon">{currentStep.icon}</span>
            {currentStep.instruction}
          </p>
        </div>
      )}

      {/* Status de conclusão */}
      {isComplete && (
        <div className="fv-complete">
          <div className="fv-complete-icon">✅</div>
          <p className="fv-complete-text">Validação facial concluída!</p>
          <p className="fv-complete-sub">3 ângulos capturados com sucesso</p>
        </div>
      )}

      {/* Botões */}
      <div className="fv-actions">
        {!isComplete ? (
          <button
            onClick={startCapture}
            disabled={isLoading || isCapturing}
            className="btn btn-primary btn-full"
          >
            {isCapturing ? (
              <>
                <div className="btn-spinner" />
                Capturando...
              </>
            ) : (
              <>
                <span className="btn-icon">📸</span>
                Capturar {currentStep.label}
              </>
            )}
          </button>
        ) : (
          <button
            onClick={reset}
            disabled={isLoading}
            className="btn btn-secondary btn-full"
          >
            <span className="btn-icon">🔄</span>
            Refazer Capturas
          </button>
        )}
      </div>
    </div>
  );
}

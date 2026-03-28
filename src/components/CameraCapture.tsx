"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import Webcam from "react-webcam";

interface CameraCaptureProps {
  onCapture: (imageBase64: string) => void;
  isLoading?: boolean;
}

/**
 * Componente de captura de câmera com webcam.
 * Exibe o feed da câmera e um botão para capturar a imagem.
 */
export default function CameraCapture({
  onCapture,
  isLoading = false,
}: CameraCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

  // Verificar se a câmera está disponível
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(() => setHasPermission(true))
      .catch(() => setHasPermission(false));
  }, []);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      // Remover o prefixo "data:image/...;base64," para enviar apenas o base64
      const base64Data = imageSrc.split(",")[1];
      setCapturedImage(imageSrc);
      onCapture(base64Data);
    }
  }, [onCapture]);

  const retake = useCallback(() => {
    setCapturedImage(null);
  }, []);

  const toggleCamera = useCallback(() => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  }, []);

  if (hasPermission === false) {
    return (
      <div className="camera-error">
        <div className="camera-error-icon">📷</div>
        <p className="camera-error-title">Câmera não disponível</p>
        <p className="camera-error-text">
          Permita o acesso à câmera nas configurações do navegador para
          continuar.
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
    <div className="camera-container">
      {capturedImage ? (
        <div className="camera-preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={capturedImage}
            alt="Imagem capturada"
            className="camera-image"
          />
          <div className="camera-overlay-captured">
            <span className="camera-overlay-badge">✓ Capturada</span>
          </div>
        </div>
      ) : (
        <div className="camera-preview">
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            screenshotQuality={0.92}
            videoConstraints={{
              width: 640,
              height: 480,
              facingMode: facingMode,
            }}
            className="camera-video"
            mirrored={facingMode === "user"}
          />
          {/* Guia de rosto */}
          <div className="face-guide">
            <div className="face-guide-circle" />
          </div>
        </div>
      )}

      <div className="camera-actions">
        {capturedImage ? (
          <>
            <button
              onClick={retake}
              disabled={isLoading}
              className="btn btn-secondary"
            >
              <span className="btn-icon">🔄</span>
              Nova Foto
            </button>
          </>
        ) : (
          <>
            <button onClick={toggleCamera} className="btn btn-ghost">
              <span className="btn-icon">🔁</span>
              Virar
            </button>
            <button
              onClick={capture}
              disabled={isLoading}
              className="btn btn-capture"
            >
              <div className="capture-ring">
                <div className="capture-dot" />
              </div>
            </button>
            <div className="btn btn-ghost" style={{ visibility: "hidden" }}>
              <span className="btn-icon">🔁</span>
              Virar
            </div>
          </>
        )}
      </div>
    </div>
  );
}

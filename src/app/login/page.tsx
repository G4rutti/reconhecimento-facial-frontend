"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Webcam from "react-webcam";
import Alert from "@/components/Alert";
import ConfidenceMeter from "@/components/ConfidenceMeter";
import Loader from "@/components/Loader";
import { authenticateUser, AuthenticateResponse } from "@/services/api";

export default function LoginPage() {
  const webcamRef = useRef<Webcam>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isAuthenticatingRef = useRef(false);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [result, setResult] = useState<AuthenticateResponse | null>(null);
  const [scanning, setScanning] = useState(true);
  const [statusText, setStatusText] = useState("Procurando rosto…");
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

  // Checar permissão da câmera
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(() => setHasPermission(true))
      .catch(() => setHasPermission(false));
  }, []);

  // Função de auto-scan: captura um frame e envia pro backend
  const scanFrame = useCallback(async () => {
    if (isAuthenticatingRef.current) return;
    if (!webcamRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    const base64Data = imageSrc.split(",")[1];
    if (!base64Data) return;

    isAuthenticatingRef.current = true;
    setStatusText("Analisando…");

    try {
      const response = await authenticateUser(base64Data);

      if (response.success) {
        // Rosto reconhecido! Parar o scan
        setResult(response);
        setScanning(false);
        setAlert({
          type: "success",
          title: `Bem-vindo(a), ${response.userName}! 🎉`,
          message: `Acesso autorizado com ${response.confidence.toFixed(1)}% de confiança.`,
        });
      } else {
        // Não reconhecido, mas detectou rosto — continuar tentando
        setStatusText("Rosto não reconhecido. Escaneando…");
      }
    } catch {
      // Erro (ex: nenhum rosto detectado) — continuar tentando
      setStatusText("Procurando rosto…");
    } finally {
      isAuthenticatingRef.current = false;
    }
  }, []);

  // Iniciar/parar loop de auto-scan
  useEffect(() => {
    if (scanning && hasPermission) {
      // Scan a cada 2.5 segundos
      intervalRef.current = setInterval(scanFrame, 2500);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }, [scanning, hasPermission, scanFrame]);

  const tryAgain = () => {
    setResult(null);
    setAlert(null);
    setScanning(true);
    setStatusText("Procurando rosto…");
  };

  return (
    <main className="page-container">
      <div className="bg-pattern" />

      <div className="page-content">
        {/* Header */}
        <div className="page-header animate-enter">
          <Link href="/" className="back-link">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M10 12L6 8L10 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Voltar
          </Link>
          <h1 className="page-title">
            <span className="page-title-icon">🔐</span>
            Autenticação Facial
          </h1>
          <p className="page-description">
            Posicione seu rosto na câmera — a identificação é automática
          </p>
        </div>

        {/* Alertas */}
        {alert && (
          <Alert
            type={alert.type}
            title={alert.title}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        {/* Resultado */}
        {result && (
          <div
            className={`result-card animate-enter delay-2 ${result.success ? "result-success" : "result-failure"}`}
          >
            <div className="result-icon-wrapper">
              <div
                className={`result-icon-bg ${result.success ? "result-icon-bg-success" : "result-icon-bg-failure"}`}
              >
                {result.success ? "✅" : "🚫"}
              </div>
            </div>
            <div className="result-info">
              <h3 className="result-status">
                {result.success ? "ACESSO PERMITIDO" : "ACESSO NEGADO"}
              </h3>
              {result.userName && (
                <p className="result-user">{result.userName}</p>
              )}
              <ConfidenceMeter
                confidence={result.confidence}
                success={result.success}
              />
            </div>
          </div>
        )}

        {/* Câmera com auto-scan */}
        {scanning ? (
          <div className="form-card animate-enter delay-2">
            {hasPermission === false && (
              <div className="camera-error">
                <div className="camera-error-icon">📷</div>
                <p className="camera-error-title">Câmera não disponível</p>
                <p className="camera-error-text">
                  Permita o acesso à câmera nas configurações do navegador.
                </p>
              </div>
            )}

            {hasPermission === null && (
              <div className="camera-loading">
                <Loader text="Acessando câmera..." />
              </div>
            )}

            {hasPermission && (
              <div className="camera-container">
                <div className="camera-preview" style={{ position: "relative" }}>
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
                    className="camera-video"
                    mirrored
                  />
                  {/* Guia de rosto */}
                  <div className="face-guide">
                    <div className="face-guide-circle" />
                  </div>

                  {/* Indicador de scanning */}
                  <div className="scan-indicator">
                    <div className="scan-line" />
                  </div>
                </div>

                <div className="scan-status">
                  <div className="scan-pulse" />
                  <span>{statusText}</span>
                </div>
              </div>
            )}

            {/* Link para cadastro */}
            <div className="login-footer">
              <p>
                Ainda não cadastrado?{" "}
                <Link href="/register" className="link-accent">
                  Cadastre seu rosto aqui
                </Link>
              </p>
            </div>
          </div>
        ) : (
          <div className="result-actions animate-enter delay-3">
            <button onClick={tryAgain} className="btn btn-primary btn-full">
              <span className="btn-icon">🔄</span>
              Tentar Novamente
            </button>
            {!result?.success && (
              <Link href="/register" className="btn btn-secondary btn-full">
                <span className="btn-icon">👤</span>
                Cadastrar Rosto
              </Link>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

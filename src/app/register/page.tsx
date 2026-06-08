"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Webcam from "react-webcam";
import Alert from "@/components/Alert";
import Loader from "@/components/Loader";
import { registerUser } from "@/services/api";

export default function RegisterPage() {
  const webcamRef = useRef<Webcam>(null);
  const [name, setName] = useState("");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

  const handleCapture = () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      const base64Data = imageSrc.split(",")[1];
      setCapturedImage(base64Data);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setAlert({
        type: "error",
        title: "Nome obrigatório",
        message: "Por favor, informe seu nome antes de cadastrar.",
      });
      return;
    }

    if (!capturedImage) {
      setAlert({
        type: "error",
        title: "Foto obrigatória",
        message: "Por favor, tire uma foto do seu rosto antes de cadastrar.",
      });
      return;
    }

    setIsLoading(true);
    setAlert(null);

    try {
      const result = await registerUser(name.trim(), [capturedImage]);
      setAlert({
        type: "success",
        title: "Cadastro realizado! 🎉",
        message: `${result.name} foi cadastrado(a) com sucesso. Agora você pode usar o login facial.`,
      });
      setName("");
      setCapturedImage(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro desconhecido.";
      setAlert({
        type: "error",
        title: "Falha no cadastro",
        message,
      });
    } finally {
      setIsLoading(false);
    }
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
            <span className="page-title-icon">👤</span>
            Cadastro Facial
          </h1>
          <p className="page-description">
            Registre seu rosto de forma rápida e segura
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

        {/* Loading overlay */}
        {isLoading && <Loader text="Processando imagem facial..." />}

        {/* Formulário */}
        <div className="form-card animate-enter delay-2">
          {/* Campo nome */}
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Nome Completo
            </label>
            <div className="input-wrapper">
              <span className="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="12"
                    cy="8"
                    r="4"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M5 20c0-3.866 3.134-7 7-7s7 3.134 7 7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Digite seu nome completo"
                className="form-input form-input-icon"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Câmera */}
          <div className="form-group">
            <label className="form-label">Foto do Rosto</label>
            <div className="camera-container">
              <div className="camera-preview">
                {capturedImage ? (
                  <img
                    src={`data:image/jpeg;base64,${capturedImage}`}
                    alt="Foto capturada"
                    className="camera-image"
                  />
                ) : (
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
                )}
              </div>

              <div className="camera-actions">
                {capturedImage ? (
                  <button
                    type="button"
                    onClick={handleRetake}
                    className="btn btn-secondary btn-full"
                    disabled={isLoading}
                  >
                    🔄 Tirar outra foto
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCapture}
                    className="btn btn-accent btn-full"
                    disabled={isLoading}
                  >
                    📸 Capturar Foto
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Botão Cadastrar */}
          <button
            onClick={handleSubmit}
            disabled={isLoading || !name.trim() || !capturedImage}
            className="btn btn-primary btn-full"
          >
            {isLoading ? (
              <>
                <div className="btn-spinner" />
                Cadastrando...
              </>
            ) : (
              <>
                <span className="btn-icon">✓</span>
                Cadastrar Rosto
              </>
            )}
          </button>

          {/* Link para login */}
          <div className="login-footer">
            <p>
              Já cadastrado?{" "}
              <Link href="/login" className="link-accent">
                Faça login facial aqui
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

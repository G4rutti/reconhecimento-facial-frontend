"use client";

import { useState } from "react";
import Link from "next/link";
import CameraCapture from "@/components/CameraCapture";
import Alert from "@/components/Alert";
import Loader from "@/components/Loader";
import { registerUser } from "@/services/api";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

  const handleCapture = (imageBase64: string) => {
    setCapturedImage(imageBase64);
    setAlert(null);
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
        title: "Foto necessária",
        message: "Capture uma foto do seu rosto antes de cadastrar.",
      });
      return;
    }

    setIsLoading(true);
    setAlert(null);

    try {
      const result = await registerUser(name.trim(), capturedImage);
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

  // Progresso dos passos
  const step = !name.trim() ? 1 : !capturedImage ? 2 : 3;

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
            Registre seu rosto para acessar o sistema
          </p>
        </div>

        {/* Step Indicator */}
        <div className="steps-container animate-enter delay-1">
          <div className={`step ${step >= 1 ? "step-active" : ""} ${step > 1 ? "step-done" : ""}`}>
            <div className="step-number">{step > 1 ? "✓" : "1"}</div>
            <span className="step-label">Nome</span>
          </div>
          <div className="step-line" />
          <div className={`step ${step >= 2 ? "step-active" : ""} ${step > 2 ? "step-done" : ""}`}>
            <div className="step-number">{step > 2 ? "✓" : "2"}</div>
            <span className="step-label">Foto</span>
          </div>
          <div className="step-line" />
          <div className={`step ${step >= 3 ? "step-active" : ""}`}>
            <div className="step-number">3</div>
            <span className="step-label">Enviar</span>
          </div>
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
            <label className="form-label">Captura Facial</label>
            <CameraCapture onCapture={handleCapture} isLoading={isLoading} />
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
                Processando...
              </>
            ) : (
              <>
                <span className="btn-icon">✓</span>
                Cadastrar
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

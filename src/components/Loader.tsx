"use client";

/**
 * Componente Loader - spinner de carregamento.
 */
export default function Loader({ text = "Processando..." }: { text?: string }) {
  return (
    <div className="loader-container">
      <div className="loader-spinner" />
      <p className="loader-text">{text}</p>
    </div>
  );
}

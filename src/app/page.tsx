"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Efeito de partículas animadas no background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
    }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Criar partículas (Quieter: menos partículas, mais lentas, mais opacas para compensar o tamanho)
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.15 + 0.05,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Desenhar partículas
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99, 102, 241, ${p.opacity})`;
        ctx.fill();
      });

      // Linhas entre partículas próximas
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            // Quieter: reduced line opacity
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.04 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <main className="page-container">
      {/* Canvas de partículas */}
      <canvas ref={canvasRef} className="particles-canvas" />

      {/* Background gradiente */}
      <div className="bg-pattern" />

      <div className="hero">
        {/* Logo animado */}
        <div className="hero-icon animate-enter">
          <div className="hero-icon-ring" />
          <div className="hero-icon-inner">
            <svg
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="hero-svg"
            >
              <circle
                cx="32"
                cy="22"
                r="11"
                stroke="currentColor"
                strokeWidth="2.5"
                fill="none"
              />
              <path
                d="M14 54c0-9.941 8.059-18 18-18s18 8.059 18 18"
                stroke="currentColor"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
              {/* Scanning line */}
              <line
                x1="10"
                y1="32"
                x2="54"
                y2="32"
                stroke="currentColor"
                strokeWidth="1"
                opacity="0.3"
                strokeDasharray="4 3"
              >
                <animate
                  attributeName="y1"
                  values="10;54;10"
                  dur="3s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="y2"
                  values="10;54;10"
                  dur="3s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0;0.4;0"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </line>
              {/* Corner brackets */}
              <path
                d="M10 18V10h8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.6"
              />
              <path
                d="M54 18V10h-8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.6"
              />
              <path
                d="M10 46v8h8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.6"
              />
              <path
                d="M54 46v8h-8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.6"
              />
            </svg>
          </div>
        </div>

        {/* Badge */}
        <div className="hero-badge animate-enter delay-1">
          <span className="hero-badge-dot" />
          Reconhecimento Facial com IA
        </div>

        <h1 className="hero-title animate-enter delay-2">
          Face<span className="text-gradient">Auth</span>
        </h1>
        <p className="hero-subtitle animate-enter delay-3">
          Controle de acesso inteligente com detecção facial em tempo real.
          Seguro, rápido e 100% offline.
        </p>

        <div className="hero-actions animate-enter delay-4">
          <Link href="/register" className="btn btn-primary btn-lg">
            <span className="btn-icon">👤</span>
            Cadastrar Rosto
          </Link>
          <Link href="/login" className="btn btn-accent btn-lg">
            <span className="btn-icon">🔐</span>
            Autenticar
          </Link>
        </div>

        {/* Divider */}
        <div className="hero-divider animate-enter delay-5">
          <div className="hero-divider-line" />
          <span className="hero-divider-text">RECURSOS</span>
          <div className="hero-divider-line" />
        </div>

        <div className="hero-features animate-enter delay-5">
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <span className="feature-icon">🧠</span>
            </div>
            <div className="feature-text">
              <h3>IA Local</h3>
              <p>Processamento 100% offline com DlibDotNet + OpenCV</p>
            </div>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <span className="feature-icon">⚡</span>
            </div>
            <div className="feature-text">
              <h3>Ultra Rápido</h3>
              <p>Autenticação em menos de 1 segundo via embedding 128D</p>
            </div>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <span className="feature-icon">🔒</span>
            </div>
            <div className="feature-text">
              <h3>Privacidade Total</h3>
              <p>Nenhum dado enviado para nuvem — tudo fica no seu servidor</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

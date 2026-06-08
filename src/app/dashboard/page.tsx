"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getAccessLogs, AccessLog } from "@/services/api";

export default function DashboardPage() {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<boolean | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    successful: 0,
    failed: 0,
    avgConfidence: 0,
    successRate: 0,
  });

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAccessLogs(page, 15, filter);
      setLogs(data.logs);
      setTotalCount(data.totalCount);
      setTotalPages(data.totalPages);

      // Calcular stats dos dados completos (buscar todos para stats)
      if (page === 1 && filter === undefined) {
        const allSuccess = data.logs.filter((l) => l.success).length;
        const allFailed = data.logs.filter((l) => !l.success).length;
        const avgConf =
          data.logs.length > 0
            ? data.logs.reduce((acc, l) => acc + l.confidence, 0) / data.logs.length
            : 0;

        setStats({
          total: data.totalCount,
          successful: allSuccess,
          failed: allFailed,
          avgConfidence: avgConf,
          successRate: data.totalCount > 0 ? (allSuccess / data.logs.length) * 100 : 0,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar logs.");
    } finally {
      setIsLoading(false);
    }
  }, [page, filter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <main className="page-container">
      <div className="bg-pattern" />

      <div className="page-content dash-content">
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
            <span className="page-title-icon">📊</span>
            Dashboard de Segurança
          </h1>
          <p className="page-description">
            Monitoramento de acessos e tentativas de autenticação
          </p>
        </div>

        {/* Stats Cards */}
        <div className="dash-stats animate-enter delay-1">
          <div className="stat-card">
            <div className="stat-icon stat-icon-total">📋</div>
            <div className="stat-info">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total de Acessos</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-success">✅</div>
            <div className="stat-info">
              <span className="stat-value stat-value-success">{stats.successful}</span>
              <span className="stat-label">Bem-sucedidos</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-fail">🚫</div>
            <div className="stat-info">
              <span className="stat-value stat-value-fail">{stats.failed}</span>
              <span className="stat-label">Falhas</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-conf">🎯</div>
            <div className="stat-info">
              <span className="stat-value">{stats.avgConfidence.toFixed(1)}%</span>
              <span className="stat-label">Confiança Média</span>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="dash-filters animate-enter delay-2">
          <button
            className={`dash-filter-btn ${filter === undefined ? "dash-filter-active" : ""}`}
            onClick={() => { setFilter(undefined); setPage(1); }}
          >
            Todos
          </button>
          <button
            className={`dash-filter-btn dash-filter-success ${filter === true ? "dash-filter-active" : ""}`}
            onClick={() => { setFilter(true); setPage(1); }}
          >
            ✅ Sucesso
          </button>
          <button
            className={`dash-filter-btn dash-filter-fail ${filter === false ? "dash-filter-active" : ""}`}
            onClick={() => { setFilter(false); setPage(1); }}
          >
            🚫 Falha
          </button>
        </div>

        {/* Tabela de logs */}
        <div className="dash-table-card animate-enter delay-3">
          {isLoading ? (
            <div className="dash-loading">
              <div className="spinner" />
              <p>Carregando logs...</p>
            </div>
          ) : error ? (
            <div className="dash-error">
              <p>❌ {error}</p>
              <button onClick={fetchLogs} className="btn btn-secondary">
                Tentar novamente
              </button>
            </div>
          ) : logs.length === 0 ? (
            <div className="dash-empty">
              <span className="dash-empty-icon">📭</span>
              <p>Nenhum log de acesso encontrado.</p>
            </div>
          ) : (
            <>
              <div className="dash-table-wrapper">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Data/Hora</th>
                      <th>Usuário</th>
                      <th>Status</th>
                      <th>Confiança</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id}>
                        <td className="dash-cell-date">
                          {formatDate(log.timestamp)}
                        </td>
                        <td className="dash-cell-user">
                          {log.userName || (
                            <span className="dash-unknown">Desconhecido</span>
                          )}
                        </td>
                        <td>
                          <span
                            className={`dash-badge ${log.success ? "dash-badge-success" : "dash-badge-fail"}`}
                          >
                            {log.success ? "✅ Sucesso" : "🚫 Falha"}
                          </span>
                        </td>
                        <td>
                          <div className="dash-conf">
                            <div className="dash-conf-bar">
                              <div
                                className="dash-conf-fill"
                                style={{
                                  width: `${Math.min(100, log.confidence)}%`,
                                  backgroundColor: log.success
                                    ? "var(--color-success)"
                                    : log.confidence > 50
                                    ? "var(--color-warning)"
                                    : "var(--color-error)",
                                }}
                              />
                            </div>
                            <span className="dash-conf-value">
                              {log.confidence.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="dash-pagination">
                  <button
                    className="btn btn-ghost"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    ← Anterior
                  </button>
                  <span className="dash-page-info">
                    Página {page} de {totalPages}
                  </span>
                  <button
                    className="btn btn-ghost"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Próxima →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}

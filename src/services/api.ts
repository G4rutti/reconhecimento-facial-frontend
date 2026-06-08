const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5062";

// ============================================
// Tipos de resposta da API
// ============================================

export interface RegisterResponse {
  message: string;
  userId: number;
  name: string;
  embeddingsCount: number;
}

export interface AuthenticateResponse {
  success: boolean;
  confidence: number;
  userName: string | null;
  livenessScore: number;
  remainingAttempts: number;
  message: string;
  // Rate limiting
  isBlocked?: boolean;
  blockedSecondsRemaining?: number;
}

export interface ImageQualityResponse {
  isAcceptable: boolean;
  blurScore: number;
  brightnessScore: number;
  faceSizePercent: number;
  warnings: string[];
}

export interface AccessLog {
  id: number;
  userId: number | null;
  userName: string | null;
  timestamp: string;
  success: boolean;
  confidence: number;
}

export interface AccessLogsResponse {
  logs: AccessLog[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  error: string;
  details?: string;
}

// ============================================
// Funções de API
// ============================================

/**
 * Cadastra um novo usuário com nome e múltiplas imagens faciais em base64.
 */
export async function registerUser(
  name: string,
  imagesBase64: string[]
): Promise<RegisterResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, imagesBase64 }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Erro ao cadastrar usuário.");
  }

  return data as RegisterResponse;
}

/**
 * Autentica um usuário via reconhecimento facial.
 * Inclui verificação de anti-spoofing e rate limiting.
 */
export async function authenticateUser(
  imageBase64: string
): Promise<AuthenticateResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/authenticate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageBase64 }),
  });

  const data = await response.json();

  if (response.status === 400) {
    throw new Error(data.error || "Erro na detecção facial.");
  }

  // 429 = rate limited (retorna como resultado, não como erro)
  if (response.status === 429) {
    return {
      success: false,
      confidence: 0,
      userName: null,
      livenessScore: 0,
      remainingAttempts: 0,
      isBlocked: true,
      blockedSecondsRemaining: data.blockedSecondsRemaining || 30,
      message: data.message || "Muitas tentativas. Aguarde.",
    };
  }

  // 401 = não reconhecido (retorna como resultado, não como erro)
  return data as AuthenticateResponse;
}

/**
 * Valida a qualidade de uma imagem facial (blur, brilho, tamanho do rosto).
 */
export async function validateImage(
  imageBase64: string
): Promise<ImageQualityResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/validate-image`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageBase64 }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Erro ao validar imagem.");
  }

  return data as ImageQualityResponse;
}

/**
 * Busca os logs de acesso com paginação e filtro opcional.
 */
export async function getAccessLogs(
  page: number = 1,
  pageSize: number = 20,
  success?: boolean
): Promise<AccessLogsResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });

  if (success !== undefined) {
    params.append("success", success.toString());
  }

  const response = await fetch(
    `${API_BASE_URL}/api/auth/logs?${params.toString()}`,
    { method: "GET" }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Erro ao buscar logs.");
  }

  return data as AccessLogsResponse;
}

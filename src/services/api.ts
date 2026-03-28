const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5062";

// ============================================
// Tipos de resposta da API
// ============================================

export interface RegisterResponse {
  message: string;
  userId: number;
  name: string;
}

export interface AuthenticateResponse {
  success: boolean;
  confidence: number;
  userName: string | null;
  message: string;
}

export interface ApiError {
  error: string;
  details?: string;
}

// ============================================
// Funções de API
// ============================================

/**
 * Cadastra um novo usuário com nome e imagem facial em base64.
 */
export async function registerUser(
  name: string,
  imageBase64: string
): Promise<RegisterResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, imageBase64 }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Erro ao cadastrar usuário.");
  }

  return data as RegisterResponse;
}

/**
 * Autentica um usuário via reconhecimento facial.
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

  // 401 = não reconhecido (retorna como resultado, não como erro)
  return data as AuthenticateResponse;
}

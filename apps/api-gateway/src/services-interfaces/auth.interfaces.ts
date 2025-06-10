export interface SignupResponse {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
  setCookieHeader?: string;
}

export interface TokenVerificationResponse {
  isValid: boolean;
  message: string;
  error?: string;
}

export interface GoogleAuthResponse {
  message: string;
  accessToken?: string;
  user?: {
    id: string;
    email: string;
    username: string;
  };
}

export interface RequestPasswordResetResponse {
  message: string;
  hashedToken: string;
  attemptsRemaining: string;
}

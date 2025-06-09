export interface RequestTokenResetReturnType {
  message: string;
  hashedToken: string;
  attemptsRemaining: number;
}

export interface ResetUserPasswordValueParam {
  email: string;
  resetToken: string;
  newPassword: string;
}

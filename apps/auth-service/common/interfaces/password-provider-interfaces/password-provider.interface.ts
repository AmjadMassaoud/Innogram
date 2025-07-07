export interface IRequestTokenResetReturnType {
  message: string;
  hashedToken: string;
  attemptsRemaining: number;
}

export interface IResetUserPasswordValueParam {
  email: string;
  resetToken: string;
  newPassword: string;
}

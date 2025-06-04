export interface GoogleAuthReturnType {
  newRefreshToken: string;
  message: string;
  accessToken: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
}

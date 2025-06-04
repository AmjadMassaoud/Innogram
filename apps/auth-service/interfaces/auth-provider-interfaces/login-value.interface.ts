export interface LoginValueParam {
  email: string;
  password: string;
}

export interface LoginReturnType {
  refreshToken: string;
  accessToken: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
}

export interface SignupValueParam extends LoginValueParam {
  username: string;
}

export interface signupReturnType extends LoginReturnType {}

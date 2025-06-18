export interface ILoginValueParam {
  email: string;
  password: string;
}

export interface ILoginReturnType {
  refreshToken: string;
  accessToken: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
}

export interface ISignupValueParam extends ILoginValueParam {
  username: string;
}

export type TSignupReturnType = ILoginReturnType;

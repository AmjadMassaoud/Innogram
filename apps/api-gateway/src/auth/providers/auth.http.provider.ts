import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import {
  RequestPasswordResetDto,
  UserLoginDto,
  UserRegistrationDto,
} from '../dtos/auth.dto';
import {
  GoogleAuthResponse,
  LoginResponse,
  SignupResponse,
} from '../interfaces/auth.interfaces';
import { handleAxiosError } from '../../utils/axios/axios.error.util';

@Injectable()
export class AuthHttpProvider {
  constructor(private readonly httpService: HttpService) {}

  async registerUser(
    userCredentials: UserRegistrationDto,
  ): Promise<SignupResponse> {
    const { data } = await firstValueFrom(
      this.httpService
        .post<SignupResponse>('/auth/signup', userCredentials)
        .pipe(catchError(handleAxiosError)),
    );
    return data;
  }

  async loginUser(userCredentials: UserLoginDto): Promise<LoginResponse> {
    const { data, headers } = await firstValueFrom(
      this.httpService
        .post<LoginResponse>('/auth/login', userCredentials)
        .pipe(catchError(handleAxiosError)),
    );

    const setCookieHeader = headers['set-cookie']?.at(0);

    return {
      accessToken: data.accessToken,
      user: data.user,
      setCookieHeader,
    };
  }

  async logoutUser(cookieJID: string): Promise<{ message: string }> {
    const { data } = await firstValueFrom(
      this.httpService
        .post<{ message: string }>(
          '/auth/logout',
          {},
          {
            headers: { Cookie: `jid=${cookieJID}` },
          },
        )
        .pipe(catchError(handleAxiosError)),
    );
    return data;
  }

  async refreshUserToken(cookieJID: string): Promise<{ accessToken: string }> {
    const { data } = await firstValueFrom(
      this.httpService
        .post<{ accessToken: string }>(
          '/auth/refresh-token',
          {},
          {
            headers: { Cookie: `jid=${cookieJID}` },
          },
        )
        .pipe(catchError(handleAxiosError)),
    );
    return data;
  }

  async googleCallback(code: string): Promise<GoogleAuthResponse> {
    const { data } = await firstValueFrom(
      this.httpService
        .get<any>('/auth/google-callback', { params: { code } })
        .pipe(catchError(handleAxiosError)),
    );
    return data;
  }

  async requestPasswordReset(emailDto: any): Promise<RequestPasswordResetDto> {
    const { data } = await firstValueFrom(
      this.httpService
        .post<any>('/password/request-reset', emailDto)
        .pipe(catchError(handleAxiosError)),
    );
    return data;
  }

  async resetUserPassword(userCredentials: any): Promise<{ message: string }> {
    const { data } = await firstValueFrom(
      this.httpService
        .post('/password/reset', userCredentials)
        .pipe(catchError(handleAxiosError)),
    );
    return { message: data.message };
  }
}

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
        .post<SignupResponse>('/v1/auth/users', userCredentials)
        .pipe(catchError(handleAxiosError)),
    );
    return data;
  }

  async loginUser(userCredentials: UserLoginDto): Promise<LoginResponse> {
    const { data, headers } = await firstValueFrom(
      this.httpService
        .post<LoginResponse>('/v1/auth/tokens', userCredentials)
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
        .delete<{ message: string }>('/v1/auth/tokens', {
          headers: { Cookie: `jid=${cookieJID}` },
        })
        .pipe(catchError(handleAxiosError)),
    );
    return data;
  }

  async refreshUserToken(cookieJID: string): Promise<{ accessToken: string }> {
    const { data } = await firstValueFrom(
      this.httpService
        .post<{ accessToken: string }>(
          '/v1/auth/tokens/refresh',
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
    const { data, headers } = await firstValueFrom(
      this.httpService
        .post<any>('/v1/auth/google', {}, { params: { code } })
        .pipe(catchError(handleAxiosError)),
    );

    const setCookieHeader = headers['jid']?.at(0);

    return { ...data, setCookieHeader };
  }

  async requestPasswordReset(emailDto: any): Promise<RequestPasswordResetDto> {
    const { data } = await firstValueFrom(
      this.httpService
        .post<any>('/v1/passwords', emailDto)
        .pipe(catchError(handleAxiosError)),
    );
    return data;
  }

  async resetUserPassword(userCredentials: any): Promise<{ message: string }> {
    const { data } = await firstValueFrom(
      this.httpService
        .patch('/v1/passwords', userCredentials)
        .pipe(catchError(handleAxiosError)),
    );
    return { message: data.message };
  }
}

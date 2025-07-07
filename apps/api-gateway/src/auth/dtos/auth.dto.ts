import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class UserLoginDto {
  @IsEmail()
  @IsString()
  email!: string;

  @IsStrongPassword()
  @IsNotEmpty()
  password!: string;
}

export class UserRegistrationDto extends UserLoginDto {
  @IsString()
  @IsNotEmpty()
  username!: string;
}

export class RequestPasswordResetDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}

export class ResetPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  resetToken!: string;

  @IsStrongPassword()
  @IsNotEmpty()
  newPassword!: string;
}

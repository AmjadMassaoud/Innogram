import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class UserLoginDTO {
  @IsEmail()
  @IsString()
  email!: string;

  @IsStrongPassword()
  @IsNotEmpty()
  password!: string;
}

export class UserRegistrationDTO extends UserLoginDTO {
  @IsString()
  @IsNotEmpty()
  username!: string;
}

export class RequestPasswordResetDTO {
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}

export class ResetPasswordDTO {
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

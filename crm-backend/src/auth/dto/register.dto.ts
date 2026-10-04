import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsIn(['ADMIN', 'MANAGER', 'ADVISOR'])
  role?: 'ADMIN' | 'MANAGER' | 'ADVISOR';
}

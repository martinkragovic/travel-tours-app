import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Введите корректный email' })
  @MaxLength(150, { message: 'Email не должен быть длиннее 150 символов' })
  email!: string;

  @IsString({ message: 'Пароль должен быть строкой' })
  @MinLength(6, { message: 'Пароль должен быть не короче 6 символов' })
  @MaxLength(100, { message: 'Пароль не должен быть длиннее 100 символов' })
  password!: string;
}

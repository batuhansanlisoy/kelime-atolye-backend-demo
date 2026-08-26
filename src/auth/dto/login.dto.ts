import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsNotEmpty({ message: 'Email alanı boş olamaz' })
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsEmail({}, { message: 'Geçerli bir email adresi giriniz' })
  email!: string;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsNotEmpty({ message: 'Şifre alanı boş olamaz' })
  @IsString()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @MinLength(6, { message: 'Şifre en az 6 karakter olmalıdır' })
  password!: string;
}

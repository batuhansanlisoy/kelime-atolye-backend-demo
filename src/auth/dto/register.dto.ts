import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
  Length,
  MinLength,
} from 'class-validator';

// burdaki kırmızılıklar class validatorler js de falan kullanılabilsin diye any tipindedir o yüzden tipi any diye kızıyor eslint ama hata değil
export class RegisterDto {
  @IsNotEmpty({ message: 'İsim alanı boş olamaz' })
  @IsString()
  name!: string;

  @IsNotEmpty({ message: 'Soyadı alanı boş olamaz' })
  @IsString()
  last_name!: string;

  @IsNotEmpty({ message: 'Email alanı boş olamaz' })
  @IsEmail({}, { message: 'Geçerli bir email adresi giriniz' })
  email!: string;

  @IsNotEmpty({ message: 'Telefon alanı boş olamaz' })
  @IsString()
  @Length(11, 11, { message: 'Telefon numarası tam 11 karakter olmalıdır' })
  phone!: string;

  @IsNotEmpty({ message: 'Cinsiyet alanı boş olamaz' })
  @IsIn(['male', 'female'], {
    message: 'Cinsiyet sadece erkek veya kadın olabilir',
  })
  gender!: 'male' | 'female';

  @IsNotEmpty({ message: 'Şifre alanı boş olamaz' })
  @IsString()
  @MinLength(6, { message: 'Şifre en az 6 karakter olmalıdır' })
  password!: string;
}

import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { UserResponseDto } from 'src/user/dto/user-response-dto';
import { capitalizeWords } from 'src/common/utils/text.helper';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const name = registerDto.name.toLocaleLowerCase('tr-TR');
    const last_name = registerDto.last_name.toLocaleLowerCase('tr-TR');

    const { email, password, phone, gender } = registerDto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Bu email adresi zaten kullanımda.');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = this.userRepository.create({
      name,
      last_name,
      email,
      password: hashedPassword,
      phone,
      gender,
    });

    await this.userRepository.save(newUser);

    return {
      message: 'Kayıt başarıyla oluşturuldu',
      user: {
        id: newUser.id,
        name: newUser.name,
        last_name: newUser.last_name,
        email: newUser.email,
        phone: newUser.phone,
        gender: newUser.gender,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Geçersiz email veya Şifre');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Geçersiz email veya şifre');
    }

    await this.calculateStreakDay(user);

    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);

    const fullName =
      capitalizeWords(user.name) + ' ' + capitalizeWords(user.last_name);

    const userResponse: UserResponseDto = {
      id: user.id,
      name: user.name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone,
      gender: user.gender,
      fullname: fullName,
      streak_count: user.streak_count,
    };

    return {
      user: userResponse,
      accessToken,
    };
  }

  private async calculateStreakDay(user: User): Promise<string> {
    const todayStr = new Date().toISOString().split('T')[0];

    if (user.last_login !== todayStr) {
      if (user.last_login) {
        const lastLogin = new Date(user.last_login);
        const today = new Date(todayStr);

        const diffTime = today.getTime() - lastLogin.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          user.streak_count = (user.streak_count || 0) + 1;
        } else if (diffDays > 1) {
          user.streak_count = 1;
        }
      } else {
        user.streak_count = 1;
      }

      user.last_login = todayStr;
      await this.userRepository.save(user);
    }

    return todayStr;
  }
}

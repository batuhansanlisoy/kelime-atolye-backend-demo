export class UserResponseDto {
  id!: number;
  name!: string;
  last_name!: string;
  email!: string;
  phone!: string;
  gender!: 'male' | 'female';
  fullname!: string;
  streak_count!: number;
}

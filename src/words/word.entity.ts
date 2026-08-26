import { UserWord } from 'src/user-words/entities/user-word.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  OneToMany,
} from 'typeorm';

@Entity('words')
export class Word {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column()
  english!: string;

  @Column()
  turkish!: string;

  @Column('float')
  frequency!: number;

  @OneToMany(() => UserWord, (userWord) => userWord.word)
  userWords!: UserWord[];
}

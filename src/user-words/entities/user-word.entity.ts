import { User } from 'src/user/user.entity';
import { Word } from 'src/words/word.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

@Entity('user_words')
@Unique(['user', 'word'])
export class UserWord {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @ManyToOne(() => Word, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'word_id' })
  word?: Word;

  @Column({ name: 'correct_count', default: 0 })
  correctCount!: number;

  @Column({ name: 'wrong_count', default: 0 })
  wrongCount!: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

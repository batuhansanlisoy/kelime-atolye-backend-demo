import { User } from 'src/user/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('user_scores')
export class UserScore {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column('float', { name: 'current_perform', default: 0 })
  currentPerform!: number;

  @Column({ type: 'varchar', nullable: true })
  rank?: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

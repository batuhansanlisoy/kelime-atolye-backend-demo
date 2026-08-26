import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 100 })
  last_name!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 11 })
  phone!: string;

  @Column()
  gender!: 'male' | 'female';

  @Column({ type: 'varchar', length: 100 })
  password!: string;

  @Column({ type: 'date', nullable: true })
  last_login!: string;

  @Column({ type: 'int', default: 0 })
  streak_count!: number;
}

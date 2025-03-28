import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Class } from 'src/class/class.entity';
import { UserNotification } from 'src/user_notification/user_notification.entity';

@Entity('notification') // Đặt tên bảng đúng với MySQL
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ length: 100, nullable: false })
  title: string;
  @Column({ type: 'boolean', default: false })
  general: boolean;
  @CreateDateColumn()
  createdAt: Date;
  @Column({ type: 'text', nullable: true })
  detail: string;
  @Column({ type: 'boolean', default: false })
  isDelete: boolean;
  @ManyToOne(() => Class, (classEntity) => classEntity.students, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'classID' })
  class: Class;
  @OneToMany(
    () => UserNotification,
    (user_notification) => user_notification.notification,
  )
  userNotifications: UserNotification[];
}

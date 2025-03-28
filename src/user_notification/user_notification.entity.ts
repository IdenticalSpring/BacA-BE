import { Notification } from 'src/notification/notification.entity';
import { Student } from 'src/student/student.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('userNotification') // Đặt tên bảng đúng với MySQL
export class UserNotification {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'boolean', default: false })
  status: boolean;
  @Column({ type: 'boolean', default: false })
  isDelete: boolean;

  @ManyToOne(
    () => Notification,
    (notificationEntity) => notificationEntity.userNotifications,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'notificationID' })
  notification: Notification;
  @ManyToOne(
    () => Student,
    (studentEntity) => studentEntity.userNotifications,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'studentID' })
  student: Student;
}

import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn() // ID tự động tăng
  id: number;

  @Column({ unique: true }) // Username phải là duy nhất
  username: string;

  @Column() // Lưu mật khẩu đã mã hóa (hash)
  password: string;
}

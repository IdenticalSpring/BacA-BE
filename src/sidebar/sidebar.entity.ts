import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sidebar')
export class Sidebar {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  type: number; // 0: công cụ giảng dạy, 1: công cụ bài tập, 2: link bong bóng, 3: link trang chủ, 4: link hướng dẫn AI, 5: link gemini mở rộng

  @Column()
  imgUrl: string;

  @Column()
  link: string;
}

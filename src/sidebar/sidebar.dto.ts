export class CreateSidebarDto {
  name: string;
  type: number; // 0: công cụ giảng dạy, 1: công cụ bài tập, 2: link drive
  img: Buffer; // Buffer chứa ảnh upload
  link: string;
}

export class UpdateSidebarDto {
  name?: string;
  type?: number;
  img?: Buffer; // Buffer chứa ảnh upload
  link?: string;
}

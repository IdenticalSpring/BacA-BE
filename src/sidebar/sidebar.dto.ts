export class CreateSidebarDto {
  name: string;
  type: number; // 0: công cụ giảng dạy, 1: công cụ bài tập, 2: link drive
  imgUrl: string; // Đường dẫn hoặc base64 ảnh
  link: string;
}

export class UpdateSidebarDto {
  name?: string;
  type?: number;
  imgUrl?: string; // Đường dẫn hoặc base64 ảnh
  link?: string;
}

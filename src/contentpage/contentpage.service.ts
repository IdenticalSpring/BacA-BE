import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateContentPageDto, UpdateContentPageDto } from './contentpage.dto';
import { ContentPage } from './contentpage.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class ContentPageService {
  constructor(
    @InjectRepository(ContentPage)
    private readonly contentPageRepository: Repository<ContentPage>,
  ) {}

  async create(
    createContentPageDto: CreateContentPageDto,
    files?: Express.Multer.File[], // Nhận files từ request
  ): Promise<ContentPage> {
    let img1Url: string | undefined;
    let img2Url: string | undefined;

    // Upload ảnh nếu có
    if (files && files.length > 0) {
      const buffers = files.map((file) => file.buffer);
      const urls = await CloudinaryService.uploadMultipleBuffers(buffers);

      // Gán URL cho img1 và img2 (tùy thuộc vào số lượng file)
      img1Url = urls[0] || undefined;
      img2Url = urls[1] || undefined;
    }

    // Tạo đối tượng ContentPage
    const contentPage = this.contentPageRepository.create({
      ...createContentPageDto,
      img1: img1Url || createContentPageDto.img1, // Ưu tiên URL từ Cloudinary
      img2: img2Url || createContentPageDto.img2,
    });

    return this.contentPageRepository.save(contentPage);
  }
  async getAdsenseId(): Promise<string> {
    const [firstPage] = await this.contentPageRepository.find({ take: 1 });
    // console.log(firstPage);

    if (!firstPage) {
      throw new NotFoundException('ContentPage not found');
    }

    return firstPage.adsenseId;
  }
  async findAll(): Promise<ContentPage[]> {
    return this.contentPageRepository.find();
  }

  async findOne(id: number): Promise<ContentPage> {
    const contentPage = await this.contentPageRepository.findOne({
      where: { id },
    });
    if (!contentPage) {
      throw new NotFoundException(`ContentPage with ID ${id} not found`);
    }
    return contentPage;
  }

  async update(
    id: number,
    updateContentPageDto: UpdateContentPageDto,
    files?: Express.Multer.File[],
  ): Promise<ContentPage> {
    const contentPage = await this.findOne(id); // Kiểm tra bản ghi tồn tại

    let img1Url: string | undefined;
    let img2Url: string | undefined;

    if (files && files.length > 0) {
      const buffers = files.map((file) => file.buffer);
      const urls = await CloudinaryService.uploadMultipleBuffers(buffers);
      img1Url = urls[0] || undefined;
      img2Url = urls[1] || undefined;
    }

    // Cập nhật dữ liệu, không thay đổi id
    Object.assign(contentPage, {
      ...updateContentPageDto,
      img1: img1Url || updateContentPageDto.img1 || contentPage.img1,
      img2: img2Url || updateContentPageDto.img2 || contentPage.img2,
    });

    return this.contentPageRepository.save(contentPage);
  }

  async remove(id: number): Promise<void> {
    const contentPage = await this.findOne(id);
    await this.contentPageRepository.remove(contentPage);
  }
}

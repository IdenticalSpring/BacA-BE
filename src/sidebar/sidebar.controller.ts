import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { SidebarService } from './sideabar.service';
import { CreateSidebarDto, UpdateSidebarDto } from './sidebar.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('sidebar')
export class SidebarController {
  constructor(private readonly sidebarService: SidebarService) {}

  @Post()
  @UseInterceptors(FileInterceptor('img'))
  async create(
    @Body() createSidebarDto: CreateSidebarDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    createSidebarDto.img = file.buffer; // Gắn buffer ảnh vào DTO
    return this.sidebarService.create(createSidebarDto);
  }

  @Get()
  async findAll() {
    return this.sidebarService.findAll();
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('img'))
  async update(
    @Param('id') id: number,
    @Body() updateSidebarDto: UpdateSidebarDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      updateSidebarDto.img = file.buffer; // Gắn buffer ảnh vào DTO
    }
    return this.sidebarService.update(id, updateSidebarDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return this.sidebarService.delete(id);
  }
}

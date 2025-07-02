import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { SidebarService } from './sideabar.service';
import { CreateSidebarDto, UpdateSidebarDto } from './sidebar.dto';

@Controller('sidebar')
export class SidebarController {
  constructor(private readonly sidebarService: SidebarService) {}

  @Post()
  async create(@Body() createSidebarDto: CreateSidebarDto) {
    return this.sidebarService.create(createSidebarDto);
  }

  @Get()
  async findAll() {
    return this.sidebarService.findAll();
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateSidebarDto: UpdateSidebarDto,
  ) {
    return this.sidebarService.update(id, updateSidebarDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return this.sidebarService.delete(id);
  }
}

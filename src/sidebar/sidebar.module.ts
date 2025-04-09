import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sidebar } from './sidebar.entity';
import { SidebarService } from './sideabar.service';
import { SidebarController } from './sidebar.controller';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Module({
  imports: [TypeOrmModule.forFeature([Sidebar])],
  controllers: [SidebarController],
  providers: [SidebarService, CloudinaryService],
})
export class SidebarModule {}

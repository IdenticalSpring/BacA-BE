import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sidebar } from './sidebar.entity';
import { SidebarService } from './sideabar.service';
import { SidebarController } from './sidebar.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Sidebar])],
  controllers: [SidebarController],
  providers: [SidebarService],
})
export class SidebarModule {}

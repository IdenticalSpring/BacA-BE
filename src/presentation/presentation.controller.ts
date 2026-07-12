import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import {
  AssetMetadataDto,
  CreatePresentationShareDto,
  CreatePptTagDto,
  GeneratePresentationOutlineDto,
  GeneratePresentationSlidesDto,
  RewritePresentationTextDto,
  SavePresentationDto,
  UpdatePresentationShareDto,
  UpdatePresentationTagsDto,
} from './presentation.dto';
import { PresentationService } from './presentation.service';

@Controller('presentations')
@UsePipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }),
)
export class PresentationController {
  constructor(private readonly presentationService: PresentationService) {}

  @Get('tags')
  @UseGuards(AuthGuard)
  @Roles('teacher', 'admin')
  findTags(@Query('category') category?: string) {
    return this.presentationService.findTags(category);
  }

  @Post('tags')
  @UseGuards(AuthGuard)
  @Roles('teacher', 'admin')
  createTag(@Body() dto: CreatePptTagDto, @Req() req: any) {
    return this.presentationService.createTag(dto, req.user);
  }

  @Post('ai/outline')
  @UseGuards(AuthGuard)
  @Roles('teacher', 'admin')
  generateOutline(@Body() dto: GeneratePresentationOutlineDto) {
    return this.presentationService.generateOutline(dto);
  }

  @Post('ai/slides')
  @UseGuards(AuthGuard)
  @Roles('teacher', 'admin')
  generateSlides(@Body() dto: GeneratePresentationSlidesDto) {
    return this.presentationService.generateSlides(dto);
  }

  @Post('ai/rewrite')
  @UseGuards(AuthGuard)
  @Roles('teacher', 'admin')
  rewriteText(@Body() dto: RewritePresentationTextDto) {
    return this.presentationService.rewriteText(dto);
  }
  @Post()
  @UseGuards(AuthGuard)
  @Roles('teacher', 'admin')
  create(@Body() dto: SavePresentationDto, @Req() req: any) {
    return this.presentationService.create(dto, req.user);
  }

  @Get('mine')
  @UseGuards(AuthGuard)
  @Roles('teacher', 'admin')
  findMine(@Req() req: any) {
    return this.presentationService.findMine(req.user);
  }

  @Get('lesson/:lessonId')
  @UseGuards(AuthGuard)
  @Roles('teacher', 'admin')
  findByLesson(
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Req() req: any,
  ) {
    return this.presentationService.findAllByLesson(lessonId, req.user);
  }

  @Get('share/:token')
  findShared(@Param('token') token: string) {
    return this.presentationService.findShared(token);
  }

  @Post('share/:token/copy')
  @UseGuards(AuthGuard)
  @Roles('teacher', 'admin')
  cloneFromShare(@Param('token') token: string, @Req() req: any) {
    return this.presentationService.cloneFromShare(token, req.user);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @Roles('teacher', 'admin')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.presentationService.findOneForAuthenticatedUser(id, req.user);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @Roles('teacher', 'admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SavePresentationDto,
    @Req() req: any,
  ) {
    return this.presentationService.update(id, dto, req.user);
  }

  @Put(':id/tags')
  @UseGuards(AuthGuard)
  @Roles('teacher', 'admin')
  updateTags(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePresentationTagsDto,
    @Req() req: any,
  ) {
    return this.presentationService.updateTags(id, dto, req.user);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @Roles('teacher', 'admin')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.presentationService.softDelete(id, req.user);
  }

  @Post(':id/assets')
  @UseGuards(AuthGuard)
  @Roles('teacher', 'admin')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 25 * 1024 * 1024 },
    }),
  )
  uploadAsset(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: AssetMetadataDto,
    @Req() req: any,
  ) {
    return this.presentationService.uploadAsset(id, file, dto, req.user);
  }

  @Get(':id/shares')
  @UseGuards(AuthGuard)
  @Roles('teacher', 'admin')
  findShares(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.presentationService.findShares(id, req.user);
  }

  @Patch(':id/shares/:shareId')
  @UseGuards(AuthGuard)
  @Roles('teacher', 'admin')
  updateShare(
    @Param('id', ParseIntPipe) id: number,
    @Param('shareId', ParseIntPipe) shareId: number,
    @Body() dto: UpdatePresentationShareDto,
    @Req() req: any,
  ) {
    return this.presentationService.updateShare(id, shareId, dto, req.user);
  }

  @Delete(':id/shares/:shareId')
  @UseGuards(AuthGuard)
  @Roles('teacher', 'admin')
  revokeShare(
    @Param('id', ParseIntPipe) id: number,
    @Param('shareId', ParseIntPipe) shareId: number,
    @Req() req: any,
  ) {
    return this.presentationService.revokeShare(id, shareId, req.user);
  }

  @Post(':id/shares')
  @UseGuards(AuthGuard)
  @Roles('teacher', 'admin')
  createShare(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreatePresentationShareDto,
    @Req() req: any,
  ) {
    return this.presentationService.createShare(id, dto, req.user);
  }
}

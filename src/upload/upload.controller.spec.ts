import { BadRequestException } from '@nestjs/common';
import { FilesService } from '../files/files.service';
import { UploadController } from './upload.controller';

describe('UploadController compatibility aliases', () => {
  const filesService = {
    saveFile: jest.fn(),
  } as unknown as FilesService;
  let controller: UploadController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new UploadController(filesService);
  });

  it('returns the local URL for the legacy file-upload route', () => {
    const file = {
      originalname: 'lesson.mp3',
      filename: 'file-123.mp3',
      path: 'uploads/file-123.mp3',
      mimetype: 'audio/mpeg',
      size: 123,
    } as Express.Multer.File;
    (filesService.saveFile as jest.Mock).mockReturnValue({
      url: 'https://api.example.test/uploads/file-123.mp3',
    });

    expect(controller.uploadLegacyFile(file)).toEqual({
      url: 'https://api.example.test/uploads/file-123.mp3',
    });
    expect(filesService.saveFile).toHaveBeenCalledWith(file);
  });

  it('rejects a missing upload without calling storage', () => {
    expect(() =>
      controller.uploadLegacyAvatar(undefined as Express.Multer.File),
    ).toThrow(BadRequestException);
    expect(filesService.saveFile).not.toHaveBeenCalled();
  });
});

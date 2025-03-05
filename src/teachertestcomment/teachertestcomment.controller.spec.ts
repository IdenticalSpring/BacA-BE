import { Test, TestingModule } from '@nestjs/testing';
import { TeachertestcommentController } from './teachertestcomment.controller';

describe('TeachertestcommentController', () => {
  let controller: TeachertestcommentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeachertestcommentController],
    }).compile();

    controller = module.get<TeachertestcommentController>(
      TeachertestcommentController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

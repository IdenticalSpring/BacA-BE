import { Test, TestingModule } from '@nestjs/testing';
import { HomeWorkController } from './homeWork.controller';

describe('HomeWorkController', () => {
  let controller: HomeWorkController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HomeWorkController],
    }).compile();

    controller = module.get<HomeWorkController>(HomeWorkController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

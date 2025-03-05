import { Test, TestingModule } from '@nestjs/testing';
import { TesttypeController } from './testtype.controller';

describe('TesttypeController', () => {
  let controller: TesttypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TesttypeController],
    }).compile();

    controller = module.get<TesttypeController>(TesttypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { TestresultController } from './testresult.controller';

describe('TestresultController', () => {
  let controller: TestresultController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TestresultController],
    }).compile();

    controller = module.get<TestresultController>(TestresultController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

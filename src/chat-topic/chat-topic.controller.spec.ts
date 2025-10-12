import { Test, TestingModule } from '@nestjs/testing';
import { ChatTopicController } from './chat-topic.controller';

describe('ChatTopicController', () => {
  let controller: ChatTopicController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatTopicController],
    }).compile();

    controller = module.get<ChatTopicController>(ChatTopicController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

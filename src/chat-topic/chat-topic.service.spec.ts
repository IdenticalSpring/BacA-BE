import { Test, TestingModule } from '@nestjs/testing';
import { ChatTopicService } from './chat-topic.service';

describe('ChatTopicService', () => {
  let service: ChatTopicService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatTopicService],
    }).compile();

    service = module.get<ChatTopicService>(ChatTopicService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

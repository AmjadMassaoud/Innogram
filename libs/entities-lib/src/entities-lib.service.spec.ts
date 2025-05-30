import { Test, TestingModule } from '@nestjs/testing';
import { EntitiesLibService } from './entities-lib.service';

describe('EntitiesLibService', () => {
  let service: EntitiesLibService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EntitiesLibService],
    }).compile();

    service = module.get<EntitiesLibService>(EntitiesLibService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

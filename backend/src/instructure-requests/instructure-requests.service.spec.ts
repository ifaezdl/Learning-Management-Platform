import { Test, TestingModule } from '@nestjs/testing';
import { InstructorRequestsService } from './instructure-requests.service';
describe('InstructorRequestsService', () => {
  let service: InstructorRequestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InstructorRequestsService],
    }).compile();

    service = module.get<InstructorRequestsService>(InstructorRequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

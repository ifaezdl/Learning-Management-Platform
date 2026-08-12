import { Test, TestingModule } from '@nestjs/testing';
import { InstructorRequestsController } from './instructure-requests.controller';
describe('InstructorRequestsController', () => {
  let controller: InstructorRequestsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InstructorRequestsController],
    }).compile();

    controller = module.get<InstructorRequestsController>(InstructorRequestsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

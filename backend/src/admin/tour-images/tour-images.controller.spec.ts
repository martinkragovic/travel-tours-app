import { Test, TestingModule } from '@nestjs/testing';
import { TourImagesController } from './tour-images.controller';

describe('TourImagesController', () => {
  let controller: TourImagesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TourImagesController],
    }).compile();

    controller = module.get<TourImagesController>(TourImagesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

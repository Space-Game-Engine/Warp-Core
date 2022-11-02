import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import { HabitatService } from '../habitat/habitat.service';
import { HabitatModel } from '../habitat/model/habitat.model';
import { AuthService } from './auth.service';

jest.mock('../habitat/habitat.service');
jest.mock('@nestjs/jwt');

describe('AuthService', () => {
  let service: AuthService;
  let habitatService: jest.Mocked<HabitatService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        HabitatService,
        JwtService,
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    habitatService = module.get(HabitatService);
    jwtService = module.get(JwtService);
  });
  
  describe('validateUser', () => {
    it('should return null when there is no habitats for user', async () => {
      const userIdToValidate = 5;
      const habitatIdToValidate = 10;

      when(habitatService.getHabitatsByUserId)
        .expectCalledWith(userIdToValidate)
        .mockResolvedValue([]);
      
        const validatedData = await service.validateUserHabitat(userIdToValidate, habitatIdToValidate);

        expect(validatedData).toBeNull();
    });

    it('should return null when there are habitats, but none of them has provided id', async () => {
      const userIdToValidate = 5;
      const habitatIdToValidate = 10;

      when(habitatService.getHabitatsByUserId)
        .expectCalledWith(userIdToValidate)
        .mockResolvedValue([
          {
            id: 5
          } as HabitatModel,
          {
            id: 8
          } as HabitatModel,
        ]);
      
        const validatedData = await service.validateUserHabitat(userIdToValidate, habitatIdToValidate);

        expect(validatedData).toBeNull();
    });

    it('should return HabitatModel when there are habitats for provided user id and there is one habitat with proper id', async () => {
      const userIdToValidate = 5;
      const habitatIdToValidate = 10;

      when(habitatService.getHabitatsByUserId)
        .expectCalledWith(userIdToValidate)
        .mockResolvedValue([
          {
            id: 5
          } as HabitatModel,
          {
            id: 8
          } as HabitatModel,
          {
            id: habitatIdToValidate
          } as HabitatModel,
        ]);
      
        const validatedData = await service.validateUserHabitat(userIdToValidate, habitatIdToValidate);

        expect(validatedData).toEqual({id: habitatIdToValidate});
    });
  });
});

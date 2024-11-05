// support.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { SupportService } from './support.service';
import { Support } from './support.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

const mockSupportRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
};

describe('SupportService', () => {
  let service: SupportService;
  let repository: Repository<Support>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupportService,
        {
          provide: getRepositoryToken(Support),
          useValue: mockSupportRepository,
        },
      ],
    }).compile();

    service = module.get<SupportService>(SupportService);
    repository = module.get<Repository<Support>>(getRepositoryToken(Support));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSupportTicket', () => {
    it('should create and save a new support ticket', async () => {
      const ticketData = {
        userId: 1,
        subject: 'Test Subject',
        message: 'Test Message',
      };
      const savedTicket = { ...ticketData, id: 1, status: 'open' };
      mockSupportRepository.create.mockReturnValue(ticketData);
      mockSupportRepository.save.mockResolvedValue(savedTicket);

      const result = await service.createSupportTicket(
        ticketData.userId,
        ticketData.subject,
        ticketData.message,
      );
      expect(result).toEqual(savedTicket);
      expect(mockSupportRepository.create).toHaveBeenCalledWith(ticketData);
      expect(mockSupportRepository.save).toHaveBeenCalledWith(ticketData);
    });
  });

  describe('getSupportTickets', () => {
    it('should return an array of support tickets', async () => {
      const tickets = [
        {
          id: 1,
          userId: 1,
          subject: 'Test',
          message: 'Message',
          status: 'open',
        },
      ];
      mockSupportRepository.find.mockResolvedValue(tickets);

      const result = await service.getSupportTickets();
      expect(result).toEqual(tickets);
      expect(mockSupportRepository.find).toHaveBeenCalled();
    });
  });

  describe('getSupportTicketById', () => {
    it('should return a single support ticket', async () => {
      const ticket = {
        id: 1,
        userId: 1,
        subject: 'Test',
        message: 'Message',
        status: 'open',
      };
      mockSupportRepository.findOne.mockResolvedValue(ticket);

      const result = await service.getSupportTicketById(1);
      expect(result).toEqual(ticket);
      expect(mockSupportRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('updateSupportTicketStatus', () => {
    it('should update the status of a support ticket', async () => {
      const ticket = {
        id: 1,
        userId: 1,
        subject: 'Test',
        message: 'Message',
        status: 'open',
      };
      mockSupportRepository.findOne.mockResolvedValue(ticket);
      mockSupportRepository.save.mockResolvedValue({
        ...ticket,
        status: 'closed',
      });

      const result = await service.updateSupportTicketStatus(1, 'closed');
      expect(result.status).toEqual('closed');
      expect(mockSupportRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockSupportRepository.save).toHaveBeenCalledWith({
        ...ticket,
        status: 'closed',
      });
    });
  });
});

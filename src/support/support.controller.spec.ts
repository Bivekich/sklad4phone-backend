// support.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { SupportController } from './support.controller';
import { SupportService } from './support.service';
import { Support } from './support.entity';

const mockSupportService = {
  createSupportTicket: jest.fn(),
  getSupportTickets: jest.fn(),
  getSupportTicketById: jest.fn(),
  updateSupportTicketStatus: jest.fn(),
};

describe('SupportController', () => {
  let controller: SupportController;
  let service: SupportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SupportController],
      providers: [
        {
          provide: SupportService,
          useValue: mockSupportService,
        },
      ],
    }).compile();

    controller = module.get<SupportController>(SupportController);
    service = module.get<SupportService>(SupportService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createSupportTicket', () => {
    it('should create a new support ticket', async () => {
      const dto = {
        userId: 1,
        subject: 'Test Subject',
        message: 'Test Message',
      };
      const result = { ...dto, id: 1, status: 'open' } as Support;
      mockSupportService.createSupportTicket.mockResolvedValue(result);

      expect(
        await controller.createSupportTicket(
          dto.userId,
          dto.subject,
          dto.message,
        ),
      ).toEqual(result);
      expect(mockSupportService.createSupportTicket).toHaveBeenCalledWith(
        dto.userId,
        dto.subject,
        dto.message,
      );
    });
  });

  describe('getAllSupportTickets', () => {
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
      mockSupportService.getSupportTickets.mockResolvedValue(tickets);

      expect(await controller.getAllSupportTickets()).toEqual(tickets);
      expect(mockSupportService.getSupportTickets).toHaveBeenCalled();
    });
  });

  describe('getSupportTicketById', () => {
    it('should return a support ticket by ID', async () => {
      const ticket = {
        id: 1,
        userId: 1,
        subject: 'Test',
        message: 'Message',
        status: 'open',
      };
      mockSupportService.getSupportTicketById.mockResolvedValue(ticket);

      expect(await controller.getSupportTicketById(1)).toEqual(ticket);
      expect(mockSupportService.getSupportTicketById).toHaveBeenCalledWith(1);
    });
  });

  describe('updateSupportTicketStatus', () => {
    it('should update the status of a support ticket', async () => {
      const updatedTicket = {
        id: 1,
        userId: 1,
        subject: 'Test',
        message: 'Message',
        status: 'closed',
      };
      mockSupportService.updateSupportTicketStatus.mockResolvedValue(
        updatedTicket,
      );

      expect(await controller.updateSupportTicketStatus(1, 'closed')).toEqual(
        updatedTicket,
      );
      expect(mockSupportService.updateSupportTicketStatus).toHaveBeenCalledWith(
        1,
        'closed',
      );
    });
  });
});

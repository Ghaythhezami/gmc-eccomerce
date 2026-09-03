import { NotificationType } from '@prisma/client';
import { NotificationsService } from './notifications.service';

describe('NotificationsService.createOrderStatus (de-duplication)', () => {
  const notification = { create: jest.fn(), findFirst: jest.fn() };
  const prisma = { notification } as any;
  const gateway = { emitToUser: jest.fn() } as any;
  let service: NotificationsService;

  beforeEach(() => {
    service = new NotificationsService(prisma, gateway);
  });

  it('creates and pushes an ORDER_STATUS notification the first time', async () => {
    notification.findFirst.mockResolvedValue(null);
    notification.create.mockResolvedValue({ id: 'n1', userId: 'u1' });

    await service.createOrderStatus('u1', 'order123456', 'SHIPPED');

    expect(notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'u1',
          type: NotificationType.ORDER_STATUS,
          orderId: 'order123456',
        }),
      }),
    );
    expect(gateway.emitToUser).toHaveBeenCalledWith('u1', 'notification.created', {
      id: 'n1',
      userId: 'u1',
    });
  });

  it('does not create a second notification for the same order + status', async () => {
    notification.findFirst.mockResolvedValue({ id: 'existing' });

    const result = await service.createOrderStatus('u1', 'order123456', 'SHIPPED');

    expect(notification.create).not.toHaveBeenCalled();
    expect(result).toEqual({ id: 'existing' });
  });
});

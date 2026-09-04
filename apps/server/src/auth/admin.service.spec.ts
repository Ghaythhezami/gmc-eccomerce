import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import { AdminService } from './admin.service';
import { GoogleTokenVerifier } from './google-token.verifier';
import { PrismaService } from '../prisma/prisma.service';

const identity = { googleId: 'google-123', email: 'someone@example.com', firstName: 'Some', lastName: 'One' };

function makeService(existingUser: Record<string, unknown> | null) {
  const prisma = {
    user: {
      findFirst: jest.fn(async () => existingUser),
      create: jest.fn(async ({ data }: any) => ({ id: 'new-id', ...data })),
      update: jest.fn(async ({ data }: any) => ({ ...existingUser, ...data })),
    },
  } as unknown as PrismaService;

  const google = { verify: jest.fn(async () => identity) } as unknown as GoogleTokenVerifier;
  const jwt = { sign: () => 'signed-jwt' } as unknown as JwtService;

  return { service: new AdminService(prisma, jwt, google), prisma };
}

describe('AdminService.validateAdminGoogleToken', () => {
  // The hole this closes: any Google account used to be auto-provisioned as an ADMIN.
  it('never creates an account for an unknown Google user', async () => {
    const { service, prisma } = makeService(null);

    await expect(service.validateAdminGoogleToken('token')).rejects.toThrow(UnauthorizedException);
    expect((prisma as any).user.create).not.toHaveBeenCalled();
  });

  it('refuses a known account that is not an ADMIN', async () => {
    const { service, prisma } = makeService({ id: 'u1', email: identity.email, role: Role.CUSTOMER });

    await expect(service.validateAdminGoogleToken('token')).rejects.toThrow('Not authorized for admin access');
    expect((prisma as any).user.create).not.toHaveBeenCalled();
  });

  it('signs in an existing ADMIN and links their googleId', async () => {
    const { service, prisma } = makeService({
      id: 'u1',
      email: identity.email,
      firstName: 'Some',
      lastName: 'One',
      role: Role.ADMIN,
      googleId: null,
    });

    const result = await service.validateAdminGoogleToken('token');

    expect(result.user.role).toBe(Role.ADMIN);
    expect(result.accessToken).toBe('signed-jwt');
    expect((prisma as any).user.update).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: { googleId: identity.googleId },
    });
  });
});

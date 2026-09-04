import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleTokenVerifier } from './google-token.verifier';

/** Builds a verifier whose Google calls are stubbed, so no network is touched. */
function makeVerifier(
  clientId: string | undefined,
  tokenInfo: { aud?: string; sub?: string } | Error = { aud: 'ours.apps.googleusercontent.com', sub: 'google-123' },
  userInfo: Record<string, unknown> = { email: 'Someone@Example.com', email_verified: true, given_name: 'Some', family_name: 'One' },
) {
  const config = { get: () => clientId } as unknown as ConfigService;
  const verifier = new GoogleTokenVerifier(config);

  (verifier as any).client.getTokenInfo = jest.fn(async () => {
    if (tokenInfo instanceof Error) throw tokenInfo;
    return tokenInfo;
  });

  global.fetch = jest.fn(async () => ({ ok: true, json: async () => userInfo })) as unknown as typeof fetch;

  return verifier;
}

describe('GoogleTokenVerifier', () => {
  afterEach(() => jest.restoreAllMocks());

  it('accepts a token issued for our client id', async () => {
    const verifier = makeVerifier('ours.apps.googleusercontent.com');

    await expect(verifier.verify('token')).resolves.toEqual({
      googleId: 'google-123',
      email: 'someone@example.com',
      firstName: 'Some',
      lastName: 'One',
    });
  });

  // The core of the fix: getTokenInfo alone would have accepted this token.
  it('rejects a token minted for a different Google application', async () => {
    const verifier = makeVerifier('ours.apps.googleusercontent.com', {
      aud: 'someone-elses.apps.googleusercontent.com',
      sub: 'google-123',
    });

    await expect(verifier.verify('token')).rejects.toThrow(UnauthorizedException);
  });

  it('fails closed when GOOGLE_CLIENT_ID is not configured', async () => {
    const verifier = makeVerifier(undefined);

    await expect(verifier.verify('token')).rejects.toThrow('Google sign-in is not configured on this server');
  });

  it('accepts any client id listed in a comma-separated GOOGLE_CLIENT_ID', async () => {
    const verifier = makeVerifier('admin.apps.googleusercontent.com, ours.apps.googleusercontent.com');

    await expect(verifier.verify('token')).resolves.toMatchObject({ googleId: 'google-123' });
  });

  it('rejects an unverified Google email so it cannot claim someone elses account', async () => {
    const verifier = makeVerifier(
      'ours.apps.googleusercontent.com',
      { aud: 'ours.apps.googleusercontent.com', sub: 'google-123' },
      { email: 'victim@example.com', email_verified: false },
    );

    await expect(verifier.verify('token')).rejects.toThrow('Google account email is not verified');
  });

  it('rejects a token Google does not recognise', async () => {
    const verifier = makeVerifier('ours.apps.googleusercontent.com', new Error('invalid_token'));

    await expect(verifier.verify('token')).rejects.toThrow('Invalid Google token');
  });
});

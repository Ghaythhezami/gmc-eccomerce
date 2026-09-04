import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';

/** The subset of Google's userinfo response we rely on. */
interface GoogleUserInfo {
  email?: string;
  email_verified?: boolean;
  given_name?: string;
  family_name?: string;
  name?: string;
}

/** A Google identity we have actually proven belongs to this application. */
export interface VerifiedGoogleIdentity {
  googleId: string;
  email: string;
  firstName: string;
  lastName: string;
}

/**
 * Verifies a Google OAuth access token coming from the browser.
 *
 * `OAuth2Client.getTokenInfo()` only asks Google "what is this token?" - it never
 * uses our client id, so on its own it will happily accept a token that was minted
 * for a *different* Google application. Anyone could then replay a token obtained
 * from any other site and sign in here as that user. The audience check below is
 * what ties the token back to us, so it must never be skipped.
 */
@Injectable()
export class GoogleTokenVerifier {
  private readonly logger = new Logger(GoogleTokenVerifier.name);
  private readonly client = new OAuth2Client();

  constructor(private readonly config: ConfigService) {}

  /** Client ids we accept tokens for. Comma-separated so the storefront and the admin app can differ. */
  private allowedAudiences(): string[] {
    return (this.config.get<string>('GOOGLE_CLIENT_ID') ?? '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);
  }

  /** True when GOOGLE_CLIENT_ID is configured, so callers can report "not configured" instead of "invalid token". */
  isConfigured(): boolean {
    return this.allowedAudiences().length > 0;
  }

  async verify(googleToken: string): Promise<VerifiedGoogleIdentity> {
    const audiences = this.allowedAudiences();

    // Fail closed: without a client id we cannot prove the token was issued for us.
    if (audiences.length === 0) {
      this.logger.error('GOOGLE_CLIENT_ID is not set - refusing every Google sign-in.');
      throw new UnauthorizedException('Google sign-in is not configured on this server');
    }

    if (!googleToken) throw new UnauthorizedException('Missing Google token');

    let tokenInfo: Awaited<ReturnType<OAuth2Client['getTokenInfo']>>;
    try {
      tokenInfo = await this.client.getTokenInfo(googleToken);
    } catch {
      throw new UnauthorizedException('Invalid Google token');
    }

    // The whole point of this class: the token must have been issued for *our* client id.
    if (!tokenInfo.aud || !audiences.includes(tokenInfo.aud)) {
      this.logger.warn(`Rejected a Google token issued for another application (aud=${tokenInfo.aud ?? 'none'}).`);
      throw new UnauthorizedException('Invalid Google token');
    }

    if (!tokenInfo.sub) throw new UnauthorizedException('Invalid Google token');

    let userInfo: GoogleUserInfo;
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${googleToken}` },
      });
      if (!response.ok) throw new Error(`userinfo responded ${response.status}`);
      userInfo = (await response.json()) as GoogleUserInfo;
    } catch {
      throw new UnauthorizedException('Invalid Google token');
    }

    const email = userInfo.email?.toLowerCase();
    if (!email) throw new UnauthorizedException('Google account has no email address');

    // Without this, an unverified Google account could claim someone else's email
    // and take over the matching local account.
    if (userInfo.email_verified === false) {
      throw new UnauthorizedException('Google account email is not verified');
    }

    return {
      googleId: tokenInfo.sub,
      email,
      firstName: userInfo.given_name || userInfo.name || 'Google',
      lastName: userInfo.family_name || 'User',
    };
  }
}

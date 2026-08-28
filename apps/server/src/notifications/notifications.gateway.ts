import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

/**
 * Real-time notification gateway (NEC-502).
 *
 * - Every socket must present a valid JWT on connect (handshake `auth.token`
 *   or an `Authorization` header). Invalid / missing -> the socket is dropped.
 * - Authenticated sockets join a private room keyed by their user id, so a
 *   notification for user X only ever reaches user X's own sockets.
 * - Reconnect is handled by the socket.io client; the server just re-runs
 *   `handleConnection` and re-joins the room.
 */
@WebSocketGateway({
  cors: {
    origin: [
      process.env.CLIENT_URL ?? 'http://localhost:5173',
      process.env.ADMIN_URL ?? 'http://localhost:5174',
    ],
    credentials: true,
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(NotificationsGateway.name);

  @WebSocketServer() server!: Server;

  constructor(private readonly jwt: JwtService) {}

  handleConnection(client: Socket) {
    const token = this.extractToken(client);
    if (!token) {
      this.logger.warn(`Socket ${client.id} rejected: missing token`);
      client.disconnect(true);
      return;
    }
    try {
      const payload = this.jwt.verify<JwtPayload>(token);
      client.data.userId = payload.sub;
      client.data.role = payload.role;
      client.join(NotificationsGateway.userRoom(payload.sub));
      if (payload.role === 'ADMIN') client.join(NotificationsGateway.ADMIN_ROOM);
      this.logger.log(`Socket ${client.id} authenticated as ${payload.sub}`);
    } catch {
      this.logger.warn(`Socket ${client.id} rejected: invalid token`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Socket ${client.id} disconnected`);
  }

  /** Push an event to every socket owned by a single user. */
  emitToUser(userId: string, event: string, payload: unknown) {
    this.server.to(NotificationsGateway.userRoom(userId)).emit(event, payload);
  }

  /** Push an event to every connected admin. */
  emitToAdmins(event: string, payload: unknown) {
    this.server.to(NotificationsGateway.ADMIN_ROOM).emit(event, payload);
  }

  private static readonly ADMIN_ROOM = 'role:ADMIN';

  private static userRoom(userId: string) {
    return `user:${userId}`;
  }

  private extractToken(client: Socket): string | null {
    const fromAuth = client.handshake.auth?.token;
    if (typeof fromAuth === 'string' && fromAuth.length) {
      return fromAuth.replace(/^Bearer\s+/i, '');
    }
    const fromHeader = client.handshake.headers?.authorization;
    if (typeof fromHeader === 'string' && fromHeader.length) {
      return fromHeader.replace(/^Bearer\s+/i, '');
    }
    return null;
  }
}

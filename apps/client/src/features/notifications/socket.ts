import { io, type Socket } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
/** The Socket.IO gateway is on the HTTP server root, not under the `/api` prefix. */
const WS_URL = API_URL.replace(/\/api\/?$/, '');

let socket: Socket | null = null;
let currentToken: string | null = null;

export function getSocket(): Socket | null {
  return socket;
}

/** Connect (or reconnect with a fresh token). Safe to call repeatedly. */
export function connectSocket(token: string): Socket {
  if (socket && currentToken === token) {
    if (!socket.connected) socket.connect();
    return socket;
  }
  if (socket) socket.disconnect();
  currentToken = token;
  socket = io(WS_URL, {
    auth: { token },
    transports: ['websocket'],
  });
  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
  currentToken = null;
}

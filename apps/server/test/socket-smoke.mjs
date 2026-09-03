/*
 * Manual smoke test for the real-time notification gateway (NEC-507).
 *
 *   node apps/server/test/socket-smoke.mjs <JWT> [wsUrl]
 *
 * Get a <JWT> from `POST /api/auth/login`. Default wsUrl is http://localhost:3000.
 * Leave it running, then trigger a notification from another terminal (e.g. an
 * admin `PATCH /api/admin/orders/:id/status`) and watch `notification.created`
 * print here. A missing/'bad' token should print connect_error / disconnect.
 */
import { io } from 'socket.io-client';

const token = process.argv[2];
const url = process.argv[3] ?? 'http://localhost:3000';

if (!token) {
  console.error('Usage: node test/socket-smoke.mjs <JWT> [wsUrl]');
  process.exit(1);
}

console.log(`connecting to ${url} ...`);
const socket = io(url, { auth: { token }, transports: ['websocket'] });

socket.on('connect', () => console.log(`connected: ${socket.id}`));
socket.on('disconnect', (reason) => console.log(`disconnected: ${reason}`));
socket.on('connect_error', (err) => console.log(`connect_error: ${err.message}`));
socket.on('notification.created', (n) =>
  console.log('notification.created →', JSON.stringify(n, null, 2)),
);

process.on('SIGINT', () => {
  socket.close();
  process.exit(0);
});

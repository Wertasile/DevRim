// socket.ts
import { io, Socket } from "socket.io-client";

const ENDPOINT =
  import.meta.env.DEV
    ? "http://localhost:5000"
    : "https://devrim-production.up.railway.app";

export const socket: Socket = io(ENDPOINT, {
  withCredentials: true,
});

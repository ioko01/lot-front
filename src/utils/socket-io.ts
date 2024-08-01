import socketIO from "socket.io-client";

export const io = socketIO(import.meta.env.VITE_OPS_URL_SOCKET)
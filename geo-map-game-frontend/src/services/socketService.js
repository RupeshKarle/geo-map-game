import { io } from "socket.io-client";

let socket = null;

const listeners = new Set();

export const connectSocket = (token) => {

  if (!token) return null;

  if (socket) {
    socket.disconnect();
  }

  socket = io(import.meta.env.VITE_SOCKET_URL, {
    auth: {
      token,
    },
    transports: ["websocket"],
  });

  // notify subscribers
  listeners.forEach((cb) => cb(socket));

  return socket;
};

export const disconnectSocket = () => {

  if (socket) {
    socket.disconnect();
    socket = null;

    listeners.forEach((cb) => cb(null));
  }
};

export const getSocket = () => socket;

export const subscribeSocket = (callback) => {

  listeners.add(callback);

  return () => {
    listeners.delete(callback);
  };
};
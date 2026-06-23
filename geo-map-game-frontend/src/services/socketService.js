import { io } from "socket.io-client";

let socket = null;

const listeners = new Set();

const notify = () => {
  listeners.forEach((cb) => cb(socket));
};

export const connectSocket = (
  token,
  force = false
) => {

  if (
    !force &&
    (socket?.connected || socket?.active)
  ) {
    return socket;
  }

  if (socket) {
    socket.disconnect();
  }

  socket = io(
    import.meta.env.VITE_SOCKET_URL,
    {
      auth: {
        token,
      },
      transports: ["websocket"],
    }
  );

  socket.on("connect", () => {

    notify(); // IMPORTANT
  });

  socket.on("connect_error", (err) => {
    console.log(
      "SOCKET ERROR",
      err.message
    );
  });

  notify(); // IMPORTANT

  return socket;
};

export const disconnectSocket = () => {

  if (socket) {
    socket.disconnect();
    socket = null;

    notify(); // IMPORTANT
  }
};

export const getSocket = () => socket;

export const subscribeSocket = (callback) => {

  listeners.add(callback);

  // immediately send current socket
  callback(socket);

  return () => {
    listeners.delete(callback);
  };
};
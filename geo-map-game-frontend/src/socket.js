import { io } from 'socket.io-client';
// const socket = io(import.meta.env.VITE_SOCKET_URL);
// const socket = io('http://localhost:5000');
const socket = io('https://geo-map-game.onrender.com');
export default socket;
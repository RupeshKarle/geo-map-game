import {
 createContext,
 useContext,
 useEffect,
 useState
} from 'react';

import {
  getSocket,
  subscribeSocket
} from "../services/socketService.js";


const SocketContext = createContext(null);

export const useSocket = () => {
 return useContext(SocketContext);
}

export const SocketProvider = ({ children }) => {
 const [socket, setSocket] = useState(
    getSocket()
  );

  useEffect(() => {

    const unsubscribe = subscribeSocket(
      setSocket
    );

    return unsubscribe;

  }, []);

 return (
  <SocketContext.Provider
   value={{
    socket
   }}
  >
   {children}
  </SocketContext.Provider>
 );
};
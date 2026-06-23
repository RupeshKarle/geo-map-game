import {
 createContext,
 useContext
} from 'react';

const SocketContext = createContext(null);

export const useSocket = () => {
 return useContext(SocketContext);
}

export const SocketProvider = ({ children }) => {
 return (
  <SocketContext.Provider
   value={{}}
  >
   {children}
  </SocketContext.Provider>
 );
};
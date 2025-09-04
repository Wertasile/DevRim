import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { Chat, Message, User } from '~/types/types';

// =============================== USER CONTEXT  ==========================================================================================================================

// --- User Context Types ---
type UserContextProps = {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
};

// --- User Context ---
export const userContext = createContext<UserContextProps | null>(null);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  return (
    <userContext.Provider value={{ user, setUser }}>
      {children}
    </userContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(userContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};

// ============================= CHAT CONTEXT ================================================================================================================================

// --- Chat Context Types ---
type ChatContextProps = {
  chat: Chat | null;
  setChat: React.Dispatch<React.SetStateAction<Chat | null>>;
}


// -- Chat Context
export const chatContext = createContext<ChatContextProps | null>(null);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [chat, setChat] = useState<Chat | null>(null);

  return (
    <chatContext.Provider value={{ chat, setChat }}>
      {children}
    </chatContext.Provider>
  )
}

export const useChat = () => {
  const context = useContext(chatContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};

// =========================== NOTIFICATION CONTEXT ========================================================================================================================

// --- Notification Context Types ---
type NotificationContextProps = {
  notification: Message[];
  setNotification: React.Dispatch<React.SetStateAction<Message[]>>;
}


// -- Chat Context
export const notificationContext = createContext<NotificationContextProps | null>(null);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notification, setNotification] = useState<Message[]>([]);

  return (
    <notificationContext.Provider value={{ notification, setNotification }}>
      {children}
    </notificationContext.Provider>
  )
}

export const useNotification = () => {
  const context = useContext(notificationContext);
  if (!context) throw new Error("useNotification must be used within a UserProvider");
  return context;
};

// --- Token Context Types ---
// type TokenContextProps = {
//   accessToken: string | null;
//   setAccessToken: React.Dispatch<React.SetStateAction<string | null>>;
//   refreshToken: string | null;
//   setRefreshToken: React.Dispatch<React.SetStateAction<string | null>>;
// };

// // --- Token Context ---
// export const tokenContext = createContext<TokenContextProps | null>(null);

// export const TokenProvider = ({ children }: { children: React.ReactNode }) => {
//   const [accessToken, setAccessToken] = useState<string | null>(null);
//   const [refreshToken, setRefreshToken] = useState<string | null>(null);

//   return (
//     <tokenContext.Provider value={{ accessToken, setAccessToken, refreshToken, setRefreshToken }}>
//       {children}
//     </tokenContext.Provider>
//   );
// };

// export const useToken = () => {
//   const context = useContext(tokenContext);
//   if (!context) throw new Error("useToken must be used within a TokenProvider");
//   return context;
// };

export const AppProvider = ({children} : {children : React.ReactNode}) => {
    return(
        <UserProvider>
            <ChatProvider>
              <NotificationProvider>
                {children}
              </NotificationProvider>
            </ChatProvider>
        </UserProvider>
    )
}
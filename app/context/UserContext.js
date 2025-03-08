import { createContext, useContext, useState } from 'react';

// Create Context
const UserContext = createContext();

// User Provider Component
export function UserProvider({ children }) {
  const [userData, setUserData] = useState({
    gender: '',
    height: '',
    weight: '',
  });

  return (
    <UserContext.Provider value={{ userData, setUserData }}>
      {children}
    </UserContext.Provider>
  );
}

// Custom Hook to Use the Context
export function useUser() {
  return useContext(UserContext);
}

import React, { createContext, useState, useContext } from "react";

// Create a context for user data
const UserContext = createContext();

// Create a provider component to wrap your app and provide user data
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // State to store user data

  // Function to update user data
  const updateUser = (userData) => {
    setUser(userData);
  };

  return (
    <UserContext.Provider value={{ user, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the UserContext
export const useUser = () => {
  return useContext(UserContext);
};
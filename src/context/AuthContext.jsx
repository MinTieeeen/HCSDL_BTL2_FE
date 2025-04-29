import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/api";

// Create context
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  // Check if user is authenticated on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem("token");
      const typeId = localStorage.getItem("typeId");
      const userType = localStorage.getItem("userType");

      if (storedToken) {
        setToken(storedToken);
        setCurrentUser({
          typeId: typeId ? parseInt(typeId) : null,
          userType: userType || null,
        });
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (username, password, userType) => {
    try {
      const response = await authService.login(username, password, userType);

      // Store user type in localStorage
      localStorage.setItem("userType", userType);
      localStorage.setItem("token", response.accessToken);

      setCurrentUser({
        typeId: response.typeId,
        userType: userType,
      });

      setToken(response.accessToken);

      return response;
    } catch (error) {
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem("userType");
    localStorage.removeItem("token");
  };

  // Context value
  const value = {
    currentUser,
    token,
    login,
    logout,
    isAuthenticated: !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

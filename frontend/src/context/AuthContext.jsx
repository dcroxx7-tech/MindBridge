import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        try {
          // Verify token by calling /auth/me
          const response = await api.get("/auth/me");
          setUser(response.data);
          setToken(storedToken);
        } catch (error) {
          console.error("Token verification failed:", error);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { access_token, username, id } = response.data;
      localStorage.setItem("token", access_token);
      setToken(access_token);
      
      const userResponse = await api.get("/auth/me");
      setUser(userResponse.data);
      return userResponse.data;
    } catch (error) {
      throw error.response?.data?.detail || "Login failed. Please try again.";
    }
  };

  const signup = async (username, email, password, country, language) => {
    try {
      const response = await api.post("/auth/signup", {
        username,
        email,
        password,
        country,
        language,
      });
      const { access_token } = response.data;
      localStorage.setItem("token", access_token);
      setToken(access_token);

      const userResponse = await api.get("/auth/me");
      setUser(userResponse.data);
      return userResponse.data;
    } catch (error) {
      throw error.response?.data?.detail || "Signup failed. Please try again.";
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const updateUserProfile = (updatedUser) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    updateUserProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

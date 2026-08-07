import React, { createContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await authAPI.getMe();
        setUser(res.data);
      } catch (err) {
        console.error(err);
        localStorage.removeItem('token');
        setToken(null);
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  const login = async (email, sifre) => {
    const res = await authAPI.login({ email, sifre });
    const { token: newToken, ...userData } = res.data;
    setToken(newToken);
    localStorage.setItem('token', newToken);
    setUser(userData);
  };

  const register = async (userData) => {
    const res = await authAPI.register(userData);
    const { token: newToken, ...userInfo } = res.data;
    setToken(newToken);
    localStorage.setItem('token', newToken);
    setUser(userInfo);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  const isAuthenticated = !!user;
  const isOgrenci = user?.rol === 'ogrenci';
  const isDanisman = user?.rol === 'danisman';

  return (
    <AuthContext.Provider value={{
      user, token, loading, login, register, logout, isAuthenticated, isOgrenci, isDanisman
    }}>
      {children}
    </AuthContext.Provider>
  );
};


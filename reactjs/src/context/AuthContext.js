// src/context/AuthContext.js
import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Crea el contexto
const AuthContext = createContext();

// Proveedor del contexto
const AuthProvider = ({ children }) => {
  const [user, setuser] = useState(null);
  const [loading, setLoading] = useState(true); // bandera de carga

  useEffect(() => {
    try {
      const userGuardado = localStorage.getItem('user');
      if (userGuardado && userGuardado !== 'undefined') {
        const userParseado = JSON.parse(userGuardado);
        setuser(userParseado);
        const token = localStorage.getItem('token');
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.error('Error al leer user desde localStorage:', error);
      setuser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = ({ user, token }) => {
    setuser(user);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('TOKEN GUARDADO:', token);
  };

  const logout = () => {
    setuser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar el contexto más fácilmente
const useAuth = () => useContext(AuthContext);

// ✅ Exportaciones correctas
export { AuthProvider, useAuth };

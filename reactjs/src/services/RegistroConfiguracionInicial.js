// src/services/AppService.js
import api from './api';

/* ---------------------- AUTH ---------------------- */
export const login = async (credentials) => {
  const res = await api.post('/auth/login', credentials);
  return res.data;
};

/* ---------------------- USUARIO ---------------------- */
export const registrarUsuario = async (data) => {
  const res = await api.post('/usuarios/registrar', data);
  return res.data;
};

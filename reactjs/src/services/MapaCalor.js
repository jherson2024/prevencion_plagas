// src/services/MapaCalor.js
import api from './api';

export const obtenerIntensidadPlagas = async () => {
  try {
    const response = await api.get('/intensidad-plagas/');
    return response.data;
  } catch (error) {
    console.error('Error al obtener intensidad de plagas:', error);
    throw error;
  }
};

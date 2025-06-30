import api from './api'; // api.js debe tener configurado axios

// Función para obtener la línea de tiempo por código de parcela
export const obtenerLineaTiempo = async (mapCod) => {
  try {
    const response = await api.get('/linea-tiempo', {
      params: { map_cod: mapCod }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener línea de tiempo:', error);
    throw error;
  }
};

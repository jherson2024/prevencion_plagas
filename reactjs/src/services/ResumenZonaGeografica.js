import api from './api';

const ResumenZonaGeograficaService = {
  obtenerResumenPorZona: async (zonaId) => {
    try {
      const response = await api.get(`/resumen-zona/${zonaId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener el resumen de la zona geográfica:', error);
      throw error;
    }
  }
};

export default ResumenZonaGeograficaService;

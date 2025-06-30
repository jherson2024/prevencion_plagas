import api from './api';

// 📷 Subir imagen
export const subirImagen = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/imagen/subir', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// 🗺️ Crear ubicación
export const crearUbicacion = async (ubicacion) => {
  const response = await api.post('/ubicacion/crear', ubicacion);
  return response.data;
};

// 📝 Crear captura
export const crearCaptura = async (captura) => {
  const response = await api.post('/captura/crear', captura);
  return response.data;
};

// 📴 Guardar en buffer offline
export const guardarOffline = async (offlineData) => {
  const response = await api.post('/offline_buffer/guardar', offlineData);
  return response.data;
};

// 🔄 Registrar log de sincronización
export const registrarSyncLog = async (log) => {
  const response = await api.post('/sync_log/registrar', log);
  return response.data;
};

// 📄 Listar imágenes por usuario
export const listarImagenesPorUsuario = async (usuarioId) => {
  const response = await api.get(`/imagen/listar/usuario/${usuarioId}`);
  return response.data;
};

// 📸 Listar capturas por filtros
export const listarCapturas = async ({ usuarioId, parcelaId }) => {
  let url = `/captura/listar?`;
  if (usuarioId) url += `usu=${usuarioId}&`;
  if (parcelaId) url += `parcela=${parcelaId}`;
  const response = await api.get(url);
  return response.data;
};

// ❌ Eliminar imagen
export const eliminarImagen = async (imagenId) => {
  const response = await api.delete(`/imagen/eliminar/${imagenId}`);
  return response.data;
};
export const actualizarUbicacion = async (ubiCod, datos) => {
  const response = await api.put(`/ubicacion/editar/${ubiCod}`, datos);
  return response.data;
};
export const eliminarUbicacion = async (ubiCod) => {
  const response = await api.delete(`/ubicacion/eliminar/${ubiCod}`);
  return response.data;
};
export const actualizarCaptura = async (capCod, datos) => {
  const response = await api.put(`/captura/editar/${capCod}`, datos);
  return response.data;
};
export const eliminarCaptura = async (capCod) => {
  const response = await api.delete(`/captura/eliminar/${capCod}`);
  return response.data;
};
export const listarDatosOffline = async (usuarioId) => {
  const response = await api.get(`/offline_buffer/listar?usuario=${usuarioId}`);
  return response.data;
};
export const eliminarDatoOffline = async (datCod) => {
  const response = await api.delete(`/offline_buffer/eliminar/${datCod}`);
  return response.data;
};
export const listarSyncLogs = async (usuarioId) => {
  const response = await api.get(`/sync_log/listar?usuario=${usuarioId}`);
  return response.data;
};
export const listarUbicacionesPorParcela = async (parcelaId) => {
  const response = await api.get(`/ubicaciones?map_par_cod=${parcelaId}`);
  return response.data;
};

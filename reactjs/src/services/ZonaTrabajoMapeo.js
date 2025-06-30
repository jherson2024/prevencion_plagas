//services/ZonaTrabajoMapeo.js
import api from './api';
/* ---------------------- ZONAS ---------------------- */
export const crearZona = async (data) => {
  const res = await api.post('/zonas/crear', data);
  return res.data;
};

export const listarZonas = async () => {
  const res = await api.get('/zonas/listar');
  return res.data;
};

export const modificarZona = async (ZonCod, data) => {
  const res = await api.put(`/zonas/modificar/${ZonCod}`, data);
  return res.data;
};

export const eliminarZona = async (ZonCod) => {
  const res = await api.delete(`/zonas/eliminar/${ZonCod}`);
  return res.data;
};
/* ---------------------- PARCELAS ---------------------- */
export const crearParcela = async (formData) => {
  const res = await api.post('/parcelas/crear', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const listarParcelasPorUsuario = async (MapUsuCod) => {
  const res = await api.get(`/parcelas/listar/${MapUsuCod}`);
  return res.data;
};

export const modificarParcela = async (MapCod, data) => {
  const res = await api.put(`/parcelas/modificar/${MapCod}`, data);
  return res.data;
};

export const eliminarParcela = async (MapCod) => {
  const res = await api.delete(`/parcelas/eliminar/${MapCod}`);
  return res.data;
};
/* ---------------------- CULTIVOS ---------------------- */
export const crearCultivo = async (data) => {
  const res = await api.post('/cultivos/crear', data);
  return res.data;
};

export const listarCultivosPorParcela = async (CulMapParCod) => {
  const res = await api.get(`/cultivos/listar/${CulMapParCod}`);
  return res.data;
};

export const modificarCultivo = async (CulCod, data) => {
  const res = await api.put(`/cultivos/modificar/${CulCod}`, data);
  return res.data;
};

export const eliminarCultivo = async (CulCod) => {
  const res = await api.delete(`/cultivos/eliminar/${CulCod}`);
  return res.data;
};

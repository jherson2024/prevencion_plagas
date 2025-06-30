import api from './api';
/* ---------------------- ACCESOS COLABORATIVOS ---------------------- */
export const crearAccesoParcela = async (data) => {
  const res = await api.post('/accesos/crear', data);
  return res.data;
};

export const listarAccesosPorParcela = async (AccMapParCod) => {
  const res = await api.get(`/accesos/listar/${AccMapParCod}`);
  return res.data;
};

export const eliminarAccesoParcela = async (AccCod) => {
  const res = await api.delete(`/accesos/eliminar/${AccCod}`);
  return res.data;
};

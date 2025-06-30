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

export const asignarRol = async (id, data) => {
  const res = await api.post(`/usuarios/${id}/rol`, data);
  return res.data;
};

/* ---------------------- API KEY ---------------------- */
export const generarApiKey = async (data) => {
  const res = await api.post('/apikeys/generar', data);
  return res.data;
};
/* ---------------------- PLANES ---------------------- */
export const listarPlanes = async () => {
  const res = await api.get('/planes/listar');
  return res.data;
};

/* ---------------------- SUSCRIPCIONES ---------------------- */
export const crearSuscripcion = async (data) => {
  const res = await api.post('/suscripciones/crear', data);
  return res.data;
};

export const obtenerSuscripcionActual = async (SusUsuCod) => {
  const res = await api.get('/suscripciones/usuario', {
    params: { SusUsuCod },
  });
  return res.data;
};

/* ---------------------- ZONAS GEOGRÁFICAS ---------------------- */
export const listarZonas = async () => {
  const res = await api.get('/zonas-geograficas/listar');
  return res.data;
};
/* ---------------------- MAPAS PARCELA ---------------------- */
export const subirMapaParcela = async (formData) => {
  const res = await api.post('/mapas-parcela/subir', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const obtenerMapasParcela = async (MapUsuCod) => {
  const res = await api.get('/mapas-parcela/usuario', {
    params: { MapUsuCod },
  });
  return res.data;
};

/* ---------------------- CAPAS DE MAPA ---------------------- */
export const generarCapaMapa = async (data) => {
  const res = await api.post('/capas-mapa/generar', data);
  return res.data;
};

export const obtenerCapasUsuario = async (CapUsuCod) => {
  const res = await api.get('/capas-mapa/usuario', {
    params: { CapUsuCod },
  });
  return res.data;
};

/* ---------------------- CAPTURAS ---------------------- */
export const crearCaptura = async (formData) => {
  const res = await api.post('/capturas/crear', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const obtenerCapturasUsuario = async (UsuCod, ApiCla) => {
  const res = await api.get('/capturas/usuario', {
    params: { UsuCod, ApiCla },
  });
  return res.data;
};

/* ---------------------- UBICACIONES ---------------------- */
export const crearUbicacion = async (data) => {
  const res = await api.post('/ubicaciones/crear', data);
  return res.data;
};
/* ---------------------- DIAGNÓSTICOS ---------------------- */
export const procesarDiagnostico = async (data) => {
  const res = await api.post('/diagnosticos/procesar', data);
  return res.data;
};

export const obtenerDiagnosticoPorCaptura = async (id) => {
  const res = await api.get(`/diagnosticos/captura/${id}`);
  return res.data;
};

export const diagnosticosPorUsuario = async (UsuCod) => {
  const res = await api.get('/diagnosticos/usuario', {
    params: { UsuCod },
  });
  return res.data;
};

/* ---------------------- ETIQUETAS MANUALES ---------------------- */
export const crearEtiquetaManual = async (data) => {
  const res = await api.post('/etiquetas-manuales/crear', data);
  return res.data;
};

export const obtenerEtiquetasUsuario = async (EtiUsuCod) => {
  const res = await api.get('/etiquetas-manuales/usuario', {
    params: { EtiUsuCod },
  });
  return res.data;
};

/* ---------------------- ALERTAS ---------------------- */
export const obtenerAlertasUsuario = async (UsuUsuCod) => {
  const res = await api.get('/alertas/usuario', {
    params: { UsuUsuCod },
  });
  return res.data;
};

export const marcarAlertaLeida = async (data) => {
  const res = await api.post('/usuario-alerta/marcar-leida', data);
  return res.data;
};

/* ---------------------- RECOMENDACIONES ---------------------- */
export const obtenerRecomendaciones = async (DiaCod) => {
  const res = await api.get(`/recomendaciones/diagnostico/${DiaCod}`);
  return res.data;
};

export const aplicarRecomendacion = async (data) => {
  const res = await api.post('/recomendaciones/aplicar', data);
  return res.data;
};
/* ---------------------- CLIMA ---------------------- */
export const obtenerClimaZona = async (id) => {
  const res = await api.get(`/clima/zona/${id}`);
  return res.data;
};

export const registrarClima = async (data) => {
  const res = await api.post('/clima/registrar', data);
  return res.data;
};

/* ---------------------- PREDICCIONES ---------------------- */
export const obtenerPrediccionesZona = async (id) => {
  const res = await api.get(`/predicciones/zona/${id}`);
  return res.data;
};

export const generarPrediccion = async (data) => {
  const res = await api.post('/predicciones/generar', data);
  return res.data;
};

/* ---------------------- MAPA DE CALOR ---------------------- */
export const obtenerMapaCalor = async (id) => {
  const res = await api.get(`/mapa-calor/zona/${id}`);
  return res.data;
};

/* ---------------------- ESTADÍSTICAS ---------------------- */
export const obtenerEstadisticasZona = async (id) => {
  const res = await api.get(`/estadisticas/zona/${id}`);
  return res.data;
};
/* ---------------------- CHAT ---------------------- */
export const enviarMensajeChat = async (data) => {
  const res = await api.post('/chat/mensajes/enviar', data);
  return res.data;
};

export const obtenerConversacion = async (usuario_id) => {
  const res = await api.get(`/chat/mensajes/conversacion/${usuario_id}`);
  return res.data;
};

/* ---------------------- ANOTACIONES ---------------------- */
export const crearAnotacion = async (data) => {
  const res = await api.post('/anotaciones/crear', data);
  return res.data;
};

export const obtenerAnotaciones = async (id) => {
  const res = await api.get(`/anotaciones/captura/${id}`);
  return res.data;
};

/* ---------------------- EVENTOS ---------------------- */
export const registrarEvento = async (data) => {
  const res = await api.post('/eventos/registrar', data);
  return res.data;
};

export const obtenerEventosUsuario = async (EveUsuCod) => {
  const res = await api.get('/eventos/usuario', {
    params: { EveUsuCod },
  });
  return res.data;
};

/* ---------------------- SINCRONIZACIÓN ---------------------- */
export const sincronizar = async (data) => {
  const res = await api.post('/sync/sincronizar', data);
  return res.data;
};

export const obtenerLogsSync = async (SynUsuCod) => {
  const res = await api.get('/sync/logs/usuario', {
    params: { SynUsuCod },
  });
  return res.data;
};

/* ---------------------- OFFLINE BUFFER ---------------------- */
export const guardarDatoOffline = async (data) => {
  const res = await api.post('/offline-buffer/guardar', data);
  return res.data;
};

/* ---------------------- INFORMES ---------------------- */
export const exportarInforme = async (data) => {
  const res = await api.post('/informes/exportar', data);
  return res.data;
};

export const historialInformes = async (UsoApiKeyCod) => {
  const res = await api.get('/informes/historial', {
    params: { UsoApiKeyCod },
  });
  return res.data;
};

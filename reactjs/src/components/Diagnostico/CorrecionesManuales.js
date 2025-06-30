import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  listarParcelasPorUsuario
} from '../../services/ZonaTrabajoMapeo';
import {
  listarCapturas,
  eliminarImagen,
  actualizarUbicacion,
  eliminarUbicacion,
  actualizarCaptura,
  eliminarCaptura
} from '../../services/CapturaDatosCampo';
import ReactSlider from 'react-slider';
import './CorreccionesManuales.css';

const CorreccionesManuales = ({ UsuCod }) => {
  const [parcelas, setParcelas] = useState([]);
  const [parcelaSeleccionada, setParcelaSeleccionada] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [range, setRange] = useState([0, 0]);
  const [capturaSeleccionada, setCapturaSeleccionada] = useState(null);
  const [nuevasNotas, setNuevasNotas] = useState('');
  const [nuevaLat, setNuevaLat] = useState('');
  const [nuevaLng, setNuevaLng] = useState('');
  const API_BASE = api.defaults.baseURL;

  useEffect(() => {
    const cargarParcelas = async () => {
      try {
        const data = await listarParcelasPorUsuario(UsuCod);
        setParcelas(data);
      } catch (err) {
        console.error('Error al cargar parcelas', err);
      }
    };
    cargarParcelas();
  }, [UsuCod]);

  const cargarCapturas = async (mapa) => {
    try {
      const capturas = await listarCapturas({
        usuarioId: UsuCod,
        parcelaId: mapa.MapCod,
      });
      const ordenadas = capturas.sort((a, b) => new Date(b.CapFec) - new Date(a.CapFec));
      setHistorial(ordenadas);

      if (ordenadas.length > 0) {
        const fechas = ordenadas.map(c => new Date(c.CapFec).getTime());
        const min = Math.min(...fechas);
        const max = Math.max(...fechas);
        setRange([min, max]);
      }
    } catch (err) {
      console.error('Error al cargar capturas', err);
    }
  };

  const handleSeleccionarParcela = async (mapa) => {
    setParcelaSeleccionada(mapa);
    setCapturaSeleccionada(null);
    await cargarCapturas(mapa);
  };

  const handleEliminarCaptura = async () => {
    if (!capturaSeleccionada) return;
    try {
      await eliminarCaptura(capturaSeleccionada.CapCod);
      alert('Captura eliminada');
      await cargarCapturas(parcelaSeleccionada);
      setCapturaSeleccionada(null);
    } catch (error) {
      console.error(error);
      alert('Error al eliminar captura');
    }
  };

  const handleEliminarImagen = async () => {
    if (!capturaSeleccionada?.ImaCod) return;
    try {
      await eliminarImagen(capturaSeleccionada.ImaCod);
      alert('Imagen eliminada');
      await cargarCapturas(parcelaSeleccionada);
      setCapturaSeleccionada(null);
    } catch (error) {
      console.error(error);
      alert('Error al eliminar imagen');
    }
  };
  const handleActualizarNotas = async () => {
    try {
      await actualizarCaptura(capturaSeleccionada.CapCod, {
        ...capturaSeleccionada,
        CapNot: nuevasNotas
      });
      alert('Notas actualizadas');
      await cargarCapturas(parcelaSeleccionada);
    } catch (error) {
      console.error(error);
      alert('Error al actualizar notas');
    }
  };
  const handleActualizarUbicacion = async () => {
    try {
      await actualizarUbicacion(capturaSeleccionada.UbiCod, {
        UbiLat: nuevaLat,
        UbiLng: nuevaLng
      });
      alert('Ubicación actualizada');
      await cargarCapturas(parcelaSeleccionada);
    } catch (error) {
      console.error(error);
      alert('Error al actualizar ubicación');
    }
  };
  const handleEliminarUbicacion = async () => {
    try {
      await eliminarUbicacion(capturaSeleccionada.UbiCod);
      alert('Ubicación eliminada');
      await cargarCapturas(parcelaSeleccionada);
    } catch (error) {
      console.error(error);
      alert('Error al eliminar ubicación');
    }
  };
  const historialFiltrado = historial.filter(cap => {
    const fecha = new Date(cap.CapFec).getTime();
    return fecha >= range[0] && fecha <= range[1];
  });

 return (
  <div className="correcciones-container">
    <h2>🧭 Seleccionar Parcela</h2>
    <select
      onChange={(e) => {
        const index = e.target.value;
        if (index !== '') handleSeleccionarParcela(parcelas[index]);
      }}
    >
      <option value="">-- Elegir parcela --</option>
      {parcelas.map((p, idx) => (
        <option key={p.MapCod} value={idx}>
          {p.MapNom}
        </option>
      ))}
    </select>

    {parcelaSeleccionada && (
      <>
        <h3>🌿 Parcela: {parcelaSeleccionada.MapNom}</h3>

        <hr />
        <h3>📋 Historial de Capturas</h3>

        {historial.length > 0 && (
          <div className="slider-fechas">
            <p>
              Rango: {new Date(range[0]).toLocaleDateString()} - {new Date(range[1]).toLocaleDateString()}
            </p>
            <ReactSlider
              className="horizontal-slider"
              thumbClassName="thumb"
              trackClassName="track"
              value={range}
              min={Math.min(...historial.map(c => new Date(c.CapFec).getTime()))}
              max={Math.max(...historial.map(c => new Date(c.CapFec).getTime()))}
              step={24 * 60 * 60 * 1000}
              onChange={(val) => setRange(val)}
              withTracks={true}
              pearling
              minDistance={1}
            />
          </div>
        )}

        <div className="contenido-capturas">
          {historialFiltrado.length === 0 ? (
            <p>No hay capturas para este rango de fechas.</p>
          ) : (
            <ul className="lista-capturas">
              {historialFiltrado.map((cap) => (
                <li
                  key={cap.CapCod}
                  className={`item-lista ${capturaSeleccionada?.CapCod === cap.CapCod ? 'resaltado' : ''}`}
                  onClick={() => {
                    setCapturaSeleccionada(cap);
                    setNuevasNotas(cap.CapNot || '');
                    setNuevaLat(cap.UbiLat || '');
                    setNuevaLng(cap.UbiLng || '');
                  }}
                >
                  {cap.CapFec} - {cap.CapNot?.slice(0, 30) || 'Sin notas'}
                </li>
              ))}
            </ul>
          )}

          {capturaSeleccionada && (
            <div className="panel-detalle">
              <div className="detalle-grid">
                <div className="bloque">
                  <h4>📸 Imagen</h4>
                  {capturaSeleccionada.ImaUrl && (
                    <img
                      src={`${API_BASE}${capturaSeleccionada.ImaUrl}`}
                      alt="captura"
                      width="200"
                    />
                  )}
                </div>

                <div className="bloque">
                  <h4>✏️ Editar Notas</h4>
                  <textarea
                    value={nuevasNotas}
                    onChange={(e) => setNuevasNotas(e.target.value)}
                  />
                  <button onClick={handleActualizarNotas}>Actualizar Notas</button>
                </div>

                <div className="bloque">
                  <h4>📍 Coordenadas</h4>
                  <button onClick={handleEliminarUbicacion}>Eliminar Ubicación</button>
                </div>

                <div className="bloque">
                  <h4>🛠️ Otras Acciones</h4>
                  <button onClick={handleEliminarImagen}>Eliminar Imagen</button>
                  <button onClick={handleEliminarCaptura}>Eliminar Captura</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </>
    )}
  </div>
);
};

export default CorreccionesManuales;

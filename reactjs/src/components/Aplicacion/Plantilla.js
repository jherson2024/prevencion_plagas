import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  listarParcelasPorUsuario
} from '../../services/ZonaTrabajoMapeo';
import ReactSlider from 'react-slider';
import './CapturaDatosCampo.css';
const CapturaDatosCampo = ({ UsuCod }) => {
  const [parcelas, setParcelas] = useState([]);
  const [parcelaSeleccionada, setParcelaSeleccionada] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [range, setRange] = useState([0, 0]);
  const [capturaSeleccionada, setCapturaSeleccionada] = useState(null);
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

      // Establecer valores iniciales del slider
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

  const historialFiltrado = historial.filter(cap => {
    const fecha = new Date(cap.CapFec).getTime();
    return fecha >= range[0] && fecha <= range[1];
  });

  return (
    <div className="captura-container">
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

          <SubirImagen
            UsuCod={UsuCod}
            MapParCod={parcelaSeleccionada.MapCod}
            mapaUrl={`${API_BASE}/${parcelaSeleccionada.MapImaMap}`}
            setCapturaSeleccionada={setCapturaSeleccionada}
            capturaSeleccionada={capturaSeleccionada}
            historial={historialFiltrado}
            setHistorial={() => cargarCapturas(parcelaSeleccionada)}
          />

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

          {historialFiltrado.length === 0 ? (
            <p>No hay capturas para este rango de fechas.</p>
          ) : (
            <div className="historial-grid">
              {historialFiltrado.map((cap) => (
                <div
                  key={cap.CapCod}
                  className={`historial-item ${capturaSeleccionada?.CapCod === cap.CapCod ? 'resaltado' : ''}`}
                  onClick={() => setCapturaSeleccionada(cap)}
                >
                  <img
                    src={`${API_BASE}${cap.ImaUrl}`}
                    alt="captura"
                    width="200"
                  />
                  <p><strong>Notas:</strong> {cap.CapNot}</p>
                  <p><strong>Fecha:</strong> {cap.CapFec}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CapturaDatosCampo;

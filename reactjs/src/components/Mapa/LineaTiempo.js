import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  listarParcelasPorUsuario
} from '../../services/ZonaTrabajoMapeo';
import { obtenerLineaTiempo } from '../../services/LineaTiempo';
import ReactSlider from 'react-slider';
import './LineaTiempo.css';

const LineaTiempo = ({ UsuCod }) => {
  const [parcelas, setParcelas] = useState([]);
  const [parcelaSeleccionada, setParcelaSeleccionada] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [range, setRange] = useState([0, 0]);

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

  const cargarEventos = async (mapa) => {
    try {
      const datos = await obtenerLineaTiempo(mapa.MapCod);
      const ordenados = datos.sort((a, b) => new Date(a.Fecha) - new Date(b.Fecha));
      setEventos(ordenados);

      if (ordenados.length > 0) {
        const fechas = ordenados.map(e => new Date(e.Fecha).getTime());
        const min = Math.min(...fechas);
        const max = Math.max(...fechas);
        setRange([min, max]);
      }
    } catch (err) {
      console.error('Error al cargar línea de tiempo', err);
    }
  };

  const handleSeleccionarParcela = async (mapa) => {
    setParcelaSeleccionada(mapa);
    await cargarEventos(mapa);
  };

  const eventosFiltrados = eventos.filter(e => {
    const fecha = new Date(e.Fecha).getTime();
    return fecha >= range[0] && fecha <= range[1];
  });

  return (
    <div className="linea-tiempo-container">
      <h2>📌 Seleccionar Parcela</h2>
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
          <h3>📍 Parcela: {parcelaSeleccionada.MapNom}</h3>
          <hr />
          <h3>📆 Línea de Tiempo de Eventos</h3>

          {eventos.length > 0 && (
            <div className="slider-fechas">
              <p>
                Rango: {new Date(range[0]).toLocaleDateString()} - {new Date(range[1]).toLocaleDateString()}
              </p>
              <ReactSlider
                className="horizontal-slider"
                thumbClassName="thumb"
                trackClassName="track"
                value={range}
                min={Math.min(...eventos.map(e => new Date(e.Fecha).getTime()))}
                max={Math.max(...eventos.map(e => new Date(e.Fecha).getTime()))}
                step={24 * 60 * 60 * 1000}
                onChange={(val) => setRange(val)}
                withTracks={true}
                pearling
                minDistance={1}
              />
            </div>
          )}

          {eventosFiltrados.length === 0 ? (
            <p>No hay eventos para este rango de fechas.</p>
          ) : (
            <div className="linea-tiempo-lista">
              {[...eventosFiltrados].reverse().map((evento, idx) => (
                <div key={idx} className="evento-item">
                  <p><strong>{evento.Fecha}</strong> - <em>{evento.Evento}</em></p>
                  <p>{evento.Detalle}</p>
                  <hr />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LineaTiempo;

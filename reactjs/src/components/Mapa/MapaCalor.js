import React, { useEffect, useRef, useState } from 'react';
import { listarParcelasPorUsuario } from '../../services/ZonaTrabajoMapeo';
import { obtenerIntensidadPlagas } from '../../services/MapaCalor';
import './MapaCalor.css';
import api from '../../services/api';

const MapaCalor = ({ UsuCod }) => {
  const [parcelas, setParcelas] = useState([]);
  const [parcelaSeleccionada, setParcelaSeleccionada] = useState(null);
  const [puntos, setPuntos] = useState([]);
  const canvasRef = useRef(null);
  const imagenRef = useRef(null);

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

  useEffect(() => {
    const cargarDatos = async () => {
      if (!parcelaSeleccionada) return;
      try {
        const todos = await obtenerIntensidadPlagas();
        const filtrados = todos.filter(p => Number(p.parcela_id) === Number(parcelaSeleccionada.MapCod));
        setPuntos(filtrados);
      } catch (err) {
        console.error('Error al cargar puntos de plagas', err);
      }
    };
    cargarDatos();
  }, [parcelaSeleccionada]);

  // Dibuja el heatmap en canvas
  useEffect(() => {
    if (!canvasRef.current || !imagenRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Setear dimensiones iguales a la imagen
    canvas.width = imagenRef.current.clientWidth;
    canvas.height = imagenRef.current.clientHeight;

    // Limpia el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    puntos.forEach(punto => {
      const x = (punto.latitud / 100) * canvas.width;
      const y = (punto.longitud / 100) * canvas.height;
      const nivel = punto.nivel_danio / 100;

      const radius = 40;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgba(255, 0, 0, ${nivel})`);
      gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    });
  }, [puntos]);

  return (
    <div className="mapacalor-container">
      <h2>🦟 Mapa de Calor de Plagas</h2>

      <select
        onChange={(e) => {
          const index = e.target.value;
          if (index !== '') setParcelaSeleccionada(parcelas[index]);
        }}
      >
        <option value="">-- Seleccionar parcela --</option>
        {parcelas.map((p, idx) => (
          <option key={p.MapCod} value={idx}>{p.MapNom}</option>
        ))}
      </select>

      {parcelaSeleccionada && (
        <div className="imagen-mapa-wrapper" style={{ position: 'relative' }}>
          <img
            ref={imagenRef}
            src={`${api.defaults.baseURL}/${parcelaSeleccionada.MapImaMap}`}
            alt="Mapa de la parcela"
            className="imagen-mapa"
            style={{ width: '100%' }}
          />
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              pointerEvents: 'none',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default MapaCalor;

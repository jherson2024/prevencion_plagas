import React, { useEffect, useState } from 'react';
import { listarZonas } from '../../services/ZonaTrabajoMapeo';
import ResumenZonaGeograficaService from '../../services/ResumenZonaGeografica';
import './ResumenZona.css';

const ResumenZona = ({ UsuCod }) => {
  const [zonas, setZonas] = useState([]);
  const [zonaSeleccionada, setZonaSeleccionada] = useState(null);
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(false);

  // Cargar zonas al montar
  useEffect(() => {
    const cargarZonas = async () => {
      try {
        const data = await listarZonas(UsuCod); // asumiendo que filtras por usuario
        setZonas(data);
      } catch (error) {
        console.error('Error al cargar zonas:', error);
      }
    };
    cargarZonas();
  }, [UsuCod]);

  // Cargar resumen al seleccionar zona
  useEffect(() => {
    const cargarResumen = async () => {
      if (zonaSeleccionada) {
        setLoading(true);
        try {
          const data = await ResumenZonaGeograficaService.obtenerResumenPorZona(zonaSeleccionada);
          setResumen(data);
        } catch (error) {
          console.error('Error al cargar resumen:', error);
          setResumen(null);
        } finally {
          setLoading(false);
        }
      }
    };
    cargarResumen();
  }, [zonaSeleccionada]);

  return (
    <div className="resumen-zona-container">
      <h2>Resumen por Zona Geográfica</h2>

      <div className="selector-zona">
        <label>Selecciona una zona:</label>
        <select
          onChange={(e) => setZonaSeleccionada(e.target.value)}
          defaultValue=""
        >
          <option value="" disabled>-- Selecciona una zona --</option>
          {zonas.map((zona) => (
            <option key={zona.ZonCod} value={zona.ZonCod}>
              {zona.ZonNom}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Cargando resumen...</p>}

      {resumen && (
        <div className="resumen-zona-datos">
          <h3>{resumen.zona_nombre}</h3>
          <ul>
            <li><strong>Total de Cultivos:</strong> {resumen.total_cultivos}</li>
            <li><strong>Total de Capturas:</strong> {resumen.total_capturas}</li>
            <li><strong>Total de Diagnósticos:</strong> {resumen.total_diagnosticos}</li>
            <li><strong>Total de Alertas:</strong> {resumen.total_alertas}</li>
            <li><strong>Total de Recomendaciones:</strong> {resumen.total_recomendaciones}</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ResumenZona;

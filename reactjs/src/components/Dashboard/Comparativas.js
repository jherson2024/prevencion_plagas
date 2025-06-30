import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { listarParcelasPorUsuario } from '../../services/ZonaTrabajoMapeo';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const Comparativas = ({ UsuCod }) => {
  const [parcelas, setParcelas] = useState([]);
  const [estadisticas, setEstadisticas] = useState([]);
  const [parcelasSeleccionadas, setParcelasSeleccionadas] = useState([]);

  useEffect(() => {
    const cargarParcelas = async () => {
      try {
        const data = await listarParcelasPorUsuario(UsuCod);
        setParcelas(data);
      } catch (err) {
        console.error('Error al cargar parcelas:', err);
      }
    };
    cargarParcelas();
  }, [UsuCod]);

  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        const todasEstadisticas = await Promise.all(
          parcelasSeleccionadas.map(async (parcela) => {
            const res = await api.get(`/parcelas/${parcela.MapCod}/estadisticas`);
            return { parcela: parcela.MapNom, data: res.data.estadisticas };
          })
        );
        setEstadisticas(todasEstadisticas);
      } catch (err) {
        console.error('Error al cargar estadísticas:', err);
      }
    };

    if (parcelasSeleccionadas.length > 0) {
      cargarEstadisticas();
    }
  }, [parcelasSeleccionadas]);

  const handleSeleccionParcela = (e) => {
    const selectedIds = Array.from(e.target.selectedOptions, (option) => parseInt(option.value));
    const seleccionadas = parcelas.filter(p => selectedIds.includes(p.MapCod));
    setParcelasSeleccionadas(seleccionadas);
    setEstadisticas([]);
  };

  // Preparar datos para el gráfico
  const labels = Array.from(new Set(estadisticas.flatMap(e => e.data.map(d => d.plaga))));

  const datasets = estadisticas.map((est, idx) => ({
    label: est.parcela,
    data: labels.map(plaga => {
      const match = est.data.find(d => d.plaga === plaga);
      return match ? match.nivel_promedio_danio : 0;
    }),
    backgroundColor: `hsl(${(idx * 90) % 360}, 60%, 60%)`
  }));

  const chartData = {
    labels,
    datasets
  };

  return (
    <div className="comparativas-container">
      <h2>📊 Comparativa de Parcelas por Plaga</h2>

      <label>Selecciona parcelas (Ctrl/Cmd + click para múltiples):</label>
      <select multiple onChange={handleSeleccionParcela}>
        {parcelas.map(p => (
          <option key={p.MapCod} value={p.MapCod}>
            {p.MapNom}
          </option>
        ))}
      </select>

      {estadisticas.length > 0 ? (
        <div style={{ width: '100%', maxWidth: '900px', marginTop: '30px' }}>
          <Bar data={chartData} />
        </div>
      ) : (
        <p>Selecciona al menos una parcela para ver comparativas.</p>
      )}
    </div>
  );
};

export default Comparativas;

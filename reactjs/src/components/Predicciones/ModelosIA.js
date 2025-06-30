import React, { useState } from 'react';
import './ModelosIA.css';
import DetalleModeloIA from './DetalleModeloIA';

const modelosIA = [
  {
    nombre: 'DeepSeek',
    tipo: 'IA rápida',
    descripcion: 'Especializada en análisis visual puro, alta velocidad y bajo consumo de recursos.',
    explicacion: 'Limitada',
    clima: 'No',
    recomendaciones: 'Limitadas',
    usoOffline: 'No',
  },
  {
    nombre: 'ChatGPT Vision',
    tipo: 'IA explicativa',
    descripcion: 'Multimodal, analiza imagen y texto. Provee diagnósticos detallados y recomendaciones razonadas.',
    explicacion: 'Detallada y razonada',
    clima: 'Parcial',
    recomendaciones: 'Generadas por IA',
    usoOffline: 'No',
  },
  {
    nombre: 'Gemini',
    tipo: 'IA predictiva',
    descripcion: 'Procesa imagen, clima y datos geoespaciales. Ideal para alertas tempranas.',
    explicacion: 'Moderada',
    clima: 'Total',
    recomendaciones: 'Basadas en modelos climáticos',
    usoOffline: 'No',
  }
];

const ModelosIA = () => {
  const [seleccionado, setSeleccionado] = useState(null);

  return (
    <div className="modelo-ia-container">
      <h2>Modelos de IA Disponibles</h2>
      <div className="modelo-lista">
        {modelosIA.map((modelo, idx) => (
          <div
            key={idx}
            className={`modelo-card ${seleccionado === idx ? 'seleccionado' : ''}`}
            onClick={() => setSeleccionado(idx)}
          >
            <h3>{modelo.nombre}</h3>
            <p><strong>Tipo:</strong> {modelo.tipo}</p>
            <p>{modelo.descripcion}</p>
          </div>
        ))}
      </div>
      {seleccionado !== null && (
        <DetalleModeloIA modelo={modelosIA[seleccionado]} />
      )}
    </div>
  );
};

export default ModelosIA;

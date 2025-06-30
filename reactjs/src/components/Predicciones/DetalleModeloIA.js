import React from 'react';
import './DetalleModeloIA.css';

const DetalleModeloIA = ({ modelo }) => {
  if (!modelo) {
    return (
      <div className="detalle-modelo-ia">
        <p>Selecciona un modelo de IA para ver los detalles.</p>
      </div>
    );
  }

  return (
    <div className="detalle-modelo-ia">
      <h2>Detalles del Modelo: {modelo.nombre}</h2>
      <table>
        <tbody>
          <tr>
            <td><strong>Tipo:</strong></td>
            <td>{modelo.tipo}</td>
          </tr>
          <tr>
            <td><strong>Descripción:</strong></td>
            <td>{modelo.descripcion}</td>
          </tr>
          <tr>
            <td><strong>Explicación del diagnóstico:</strong></td>
            <td>{modelo.explicacion}</td>
          </tr>
          <tr>
            <td><strong>Integración con clima:</strong></td>
            <td>{modelo.clima}</td>
          </tr>
          <tr>
            <td><strong>Recomendaciones:</strong></td>
            <td>{modelo.recomendaciones}</td>
          </tr>
          <tr>
            <td><strong>Uso offline:</strong></td>
            <td>{modelo.usoOffline}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default DetalleModeloIA;

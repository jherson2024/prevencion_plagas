// components/TablaCultivos.jsx
import React from 'react';

const TablaCultivos = ({
  cultivos,
  parcelaId,
  onEditar,
  onEliminar
}) => {
  if (!cultivos || cultivos.length === 0) return null;

  return (
    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Inicio</th>
          <th>Fin</th>
          <th>Obs</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {cultivos.map((c) => (
          <tr key={c.CulCod}>
            <td>{c.CulNomCul}</td>
            <td>{c.CulFecIni.split('T')[0]}</td>
            <td>{c.CulFecFin.split('T')[0]}</td>
            <td>{c.CulObs}</td>
            <td>
              <button onClick={() => onEditar(c)}>Editar</button>
              <button onClick={() => onEliminar(parcelaId, c.CulCod)}>Eliminar</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TablaCultivos;

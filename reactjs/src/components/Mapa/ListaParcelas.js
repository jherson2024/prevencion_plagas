// components/ListaParcelas.jsx
import React from 'react';
import CultivoForm from './CultivoForm';
import TablaCultivos from './TablaCultivos';

const ListaParcelas = ({
  parcelas,
  urlBase,
  cultivos,
  cultivosRegistrados,
  editandoCultivoId,
  onEditarParcela,
  onEliminarParcela,
  onCultivoChange,
  onCultivoSubmit,
  onEditarCultivo,
  onGuardarCultivo,
  onEliminarCultivo,
  onCancelarCultivo
}) => {
  return (
    <div className="tabla-parcelas">
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Observaciones</th>
            <th>Mapa</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {parcelas.map((p) => (
            <React.Fragment key={p.MapCod}>
              <tr>
                <td>{p.MapNom}</td>
                <td>{p.MapCom}</td>
                <td>
                  {p.MapImaMap && (
                    <img src={`${urlBase}/${p.MapImaMap}`} alt="mapa" width="100" />
                  )}
                </td>
                <td>
                  <button onClick={() => onEditarParcela(p)}>Editar</button>
                  <button onClick={() => onEliminarParcela(p.MapCod)}>Eliminar</button>
                </td>
              </tr>
              <tr>
                <td colSpan="5">
                  <CultivoForm
                    cultivo={cultivos[p.MapCod] || {}}
                    editando={editandoCultivoId && cultivos[p.MapCod]}
                    onChange={(e) => onCultivoChange(e, p.MapCod)}
                    onSubmit={() => onCultivoSubmit(p.MapCod)}
                    onCancel={() => onCancelarCultivo(p.MapCod)}
                  />
                  <TablaCultivos
                    cultivos={cultivosRegistrados[p.MapCod]}
                    parcelaId={p.MapCod}
                    onEditar={onEditarCultivo}
                    onEliminar={onEliminarCultivo}
                  />
                </td>
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListaParcelas;

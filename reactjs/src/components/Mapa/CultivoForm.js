// components/CultivoForm.jsx
import React from 'react';

const CultivoForm = ({
  cultivo,
  editando,
  onChange,
  onSubmit,
  onCancel
}) => {
  return (
    <div className="formulario-cultivo">
      <input
        type="text"
        name="CulNomCul"
        placeholder="Cultivo"
        value={cultivo.CulNomCul || ''}
        onChange={onChange}
      />
      <input
        type="date"
        name="CulFecIni"
        value={cultivo.CulFecIni || ''}
        onChange={onChange}
      />
      <input
        type="date"
        name="CulFecFin"
        value={cultivo.CulFecFin || ''}
        onChange={onChange}
      />
      <input
        type="text"
        name="CulObs"
        placeholder="Observaciones"
        value={cultivo.CulObs || ''}
        onChange={onChange}
      />

      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={onSubmit}>
          {editando ? 'Guardar' : 'Registrar cultivo'}
        </button>
        {editando && (
          <button onClick={onCancel}>Cancelar</button>
        )}
      </div>
    </div>
  );
};

export default CultivoForm;

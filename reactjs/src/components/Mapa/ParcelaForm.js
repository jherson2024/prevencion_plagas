// components/ParcelaForm.jsx
import React from 'react';

const ParcelaForm = ({ form, zonas, editando, onChange, onSubmit, onCancel }) => {
  return (
    <form onSubmit={onSubmit} className="formulario">
      <select name="MapZonGeoCod" value={form.MapZonGeoCod} onChange={onChange} required>
        <option value="">Seleccionar zona geográfica</option>
        {zonas.map((zona) => (
          <option key={zona.ZonCod} value={zona.ZonCod}>{zona.ZonNom}</option>
        ))}
      </select>

      <input type="text" name="MapNom" placeholder="Nombre de la parcela" value={form.MapNom} onChange={onChange} required />
      <input type="text" name="MapCom" placeholder="Observaciones" value={form.MapCom} onChange={onChange} />

      {!editando && (
        <input type="file" name="archivo" accept="image/*" onChange={onChange} required />
      )}

      <div style={{ display: 'flex', gap: '10px' }}>
        <button type="submit">{editando ? 'Modificar Parcela' : 'Registrar Parcela'}</button>
        {editando && (
          <button type="button" onClick={onCancel}>Cancelar</button>
        )}
      </div>
    </form>
  );
};

export default ParcelaForm;

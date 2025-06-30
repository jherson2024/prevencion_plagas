import React, { useEffect, useState } from 'react';
import '../../css/styles.css';
import {
  crearZona,
  listarZonas,
  modificarZona,
  eliminarZona
} from '../../services/ZonaTrabajoMapeo';

const GestionZonasGeograficas = () => {
  const [zonas, setZonas] = useState([]);
  const [form, setForm] = useState({ ZonNom: '', ZonTipZon: '', ZonReg: '' });
  const [editando, setEditando] = useState(null);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    cargarZonas();
  }, []);

  const cargarZonas = async () => {
    const data = await listarZonas();
    setZonas(data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editando !== null) {
        await modificarZona(editando, form);
        setMensaje('Zona modificada con éxito');
      } else {
        await crearZona(form);
        setMensaje('Zona registrada con éxito');
      }
      setForm({ ZonNom: '', ZonTipZon: '', ZonReg: '' });
      setEditando(null);
      cargarZonas();
    } catch (err) {
      setMensaje('Error al procesar la solicitud');
      console.error(err);
    }
  };

  const handleEditar = (zona) => {
    setForm({
      ZonNom: zona.ZonNom,
      ZonTipZon: zona.ZonTipZon,
      ZonReg: zona.ZonReg
    });
    setEditando(zona.ZonCod);
  };

  const handleCancelar = () => {
    setForm({ ZonNom: '', ZonTipZon: '', ZonReg: '' });
    setEditando(null);
    setMensaje('');
  };

  const handleEliminar = async (ZonCod) => {
    if (window.confirm('¿Eliminar esta zona?')) {
      await eliminarZona(ZonCod);
      setMensaje('Zona eliminada');
      cargarZonas();
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Gestión de Zonas Geográficas</h2>

      {mensaje && <div className="mb-4 text-blue-700">{mensaje}</div>}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="bg-white p-4 shadow rounded mb-6 space-y-4">
        <input
          type="text"
          name="ZonNom"
          placeholder="Nombre de la zona"
          value={form.ZonNom}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="ZonTipZon"
          placeholder="Tipo de zona (ej. agrícola)"
          value={form.ZonTipZon}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="ZonReg"
          placeholder="Región (ej. Andina)"
          value={form.ZonReg}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <div className="flex space-x-2">
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            {editando !== null ? 'Modificar Zona' : 'Registrar Zona'}
          </button>
          {editando !== null && (
            <button
              type="button"
              onClick={handleCancelar}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Tabla de zonas */}
      <div className="bg-white p-4 shadow rounded">
        <table className="w-full table-auto border">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2">Nombre</th>
              <th className="p-2">Tipo</th>
              <th className="p-2">Región</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {zonas.length > 0 ? (
              zonas.map((zona) => (
                <tr key={zona.ZonCod} className="border-t">
                  <td className="p-2">{zona.ZonNom}</td>
                  <td className="p-2">{zona.ZonTipZon}</td>
                  <td className="p-2">{zona.ZonReg}</td>
                  <td className="p-2 space-x-2">
                    <button
                      onClick={() => handleEditar(zona)}
                      className="bg-yellow-400 px-2 py-1 rounded text-white"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleEliminar(zona.ZonCod)}
                      className="bg-red-600 px-2 py-1 rounded text-white"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-500">
                  No hay zonas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GestionZonasGeograficas;

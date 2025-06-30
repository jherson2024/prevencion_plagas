import React, { useEffect, useState, useCallback } from 'react';
import {
  listarParcelasPorUsuario
} from '../../services/ZonaTrabajoMapeo';
import {
  listarAccesosPorParcela,
  eliminarAccesoParcela,
  crearAccesoParcela
} from '../../services/AccesosColavorativos';
import api from '../../services/api';

const AsignarAccesos = ({ UsuCod }) => {
  const [parcelas, setParcelas] = useState([]);
  const [parcelaSeleccionada, setParcelaSeleccionada] = useState(null);
  const [accesos, setAccesos] = useState([]);
  const [correo, setCorreo] = useState('');
  const [usuarioEncontrado, setUsuarioEncontrado] = useState(null);
  const [AccRolAcc, setAccRolAcc] = useState('colaborador');
  const [AccPer, setAccPer] = useState('');

  const cargarParcelas = useCallback(async () => {
    const data = await listarParcelasPorUsuario(UsuCod);
    setParcelas(data);
  }, [UsuCod]);

  const cargarAccesos = useCallback(async (MapCod) => {
    const data = await listarAccesosPorParcela(MapCod);
    setAccesos(data);
  }, []);

  const seleccionarParcela = (MapCod) => {
    const parcela = parcelas.find(p => p.MapCod === parseInt(MapCod));
    setParcelaSeleccionada(parcela);
    cargarAccesos(MapCod);
    setUsuarioEncontrado(null);
    setCorreo('');
  };

  const buscarUsuario = async () => {
    try {
      const res = await api.get('/usuarios/buscar', { params: { correo } });
      setUsuarioEncontrado(res.data);
    } catch {
      alert('Usuario no encontrado');
    }
  };

  const handleAgregarAcceso = async () => {
    if (!usuarioEncontrado || !parcelaSeleccionada) return;
    try {
      await crearAccesoParcela({
        AccUsuCod: usuarioEncontrado.UsuCod,
        AccMapParCod: parcelaSeleccionada.MapCod,
        AccRolAcc,
        AccPer
      });
      setCorreo('');
      setUsuarioEncontrado(null);
      setAccPer('');
      cargarAccesos(parcelaSeleccionada.MapCod);
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al agregar acceso');
    }
  };

  const handleEliminarAcceso = async (AccCod) => {
    if (window.confirm('¿Eliminar este acceso?')) {
      await eliminarAccesoParcela(AccCod);
      cargarAccesos(parcelaSeleccionada.MapCod);
    }
  };

  useEffect(() => {
    cargarParcelas();
  }, [cargarParcelas]);

  return (
    <div className="asignar-accesos">
      <h3>Gestionar accesos por parcela</h3>

      <select onChange={(e) => seleccionarParcela(e.target.value)} defaultValue="">
        <option value="" disabled>Selecciona una parcela</option>
        {parcelas.map(p => (
          <option key={p.MapCod} value={p.MapCod}>
            {p.MapNom}
          </option>
        ))}
      </select>

      {parcelaSeleccionada && (
        <>
          <h4>Accesos actuales para "{parcelaSeleccionada.MapNom}"</h4>
          <ul>
            {accesos.map(acc => (
              <li key={acc.AccCod}>
                {acc.UsuNom} – Rol: {acc.AccRolAcc}
                <button onClick={() => handleEliminarAcceso(acc.AccCod)}>Eliminar</button>
              </li>
            ))}
          </ul>

          <h5>Invitar nuevo colaborador</h5>
          <input
            type="email"
            placeholder="Correo"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />
          <button onClick={buscarUsuario}>Buscar</button>

          {usuarioEncontrado && (
            <>
              <p>Usuario: {usuarioEncontrado.UsuNom}</p>
              <select value={AccRolAcc} onChange={(e) => setAccRolAcc(e.target.value)}>
                <option value="colaborador">Colaborador</option>
                <option value="técnico">Técnico</option>
              </select>
              <input
                type="text"
                placeholder="Permisos"
                value={AccPer}
                onChange={(e) => setAccPer(e.target.value)}
              />
              <button onClick={handleAgregarAcceso}>Invitar</button>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default AsignarAccesos;

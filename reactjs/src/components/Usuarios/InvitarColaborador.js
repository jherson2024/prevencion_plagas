import React, { useState, useEffect } from 'react';
import {
  listarParcelasPorUsuario
} from '../../services/ZonaTrabajoMapeo';
import {
  listarAccesosPorParcela,
  eliminarAccesoParcela,
  crearAccesoParcela
} from '../../services/AccesosColavorativos';
import api from '../../services/api';

const InvitarColaborador = ({ UsuCod }) => {
  const [correo, setCorreo] = useState('');
  const [usuarioEncontrado, setUsuarioEncontrado] = useState(null);
  const [parcelas, setParcelas] = useState([]);
  const [parcelaSeleccionada, setParcelaSeleccionada] = useState('');
  const [AccRolAcc, setAccRolAcc] = useState('colaborador');
  const [AccPer, setAccPer] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [accesos, setAccesos] = useState([]);

  // Cargar parcelas al montar el componente
  useEffect(() => {
    const cargarParcelas = async () => {
      const data = await listarParcelasPorUsuario(UsuCod);
      setParcelas(data);
    };
    cargarParcelas();
  }, [UsuCod]);

  // Cargar accesos cuando se selecciona una parcela
  useEffect(() => {
    const cargarAccesos = async () => {
      if (!parcelaSeleccionada) return;
      const data = await listarAccesosPorParcela(parcelaSeleccionada);
      setAccesos(data);
    };
    cargarAccesos();
  }, [parcelaSeleccionada, mensaje]);

  const buscarUsuario = async () => {
    try {
      const res = await api.get('/usuarios/buscar', { params: { correo } });
      setUsuarioEncontrado(res.data);
    } catch {
      alert('Usuario no encontrado');
      setUsuarioEncontrado(null);
    }
  };

  const handleAgregarAcceso = async () => {
    if (!usuarioEncontrado || !parcelaSeleccionada) return;
    try {
      await crearAccesoParcela({
        AccUsuCod: usuarioEncontrado.UsuCod,
        AccMapParCod: parcelaSeleccionada,
        AccRolAcc,
        AccPer
      });
      setMensaje('Colaborador invitado correctamente');
      setCorreo('');
      setUsuarioEncontrado(null);
      setParcelaSeleccionada('');
      setAccPer('');
      setTimeout(() => setMensaje(''), 3000);
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al invitar');
    }
  };

  const handleEliminarAcceso = async (AccCod) => {
    if (!parcelaSeleccionada) return;
    if (window.confirm('¿Eliminar este acceso?')) {
      await eliminarAccesoParcela(AccCod);
      const data = await listarAccesosPorParcela(parcelaSeleccionada);
      setAccesos(data);
    }
  };

  return (
    <div className="invitar-colaborador">
      <h3>Invitar colaborador por correo</h3>

      <input
        type="email"
        placeholder="Correo del colaborador"
        value={correo}
        onChange={(e) => setCorreo(e.target.value)}
      />
      <button onClick={buscarUsuario}>Buscar</button>

      <br /><br />

      <select
        value={parcelaSeleccionada}
        onChange={(e) => setParcelaSeleccionada(e.target.value)}
      >
        <option value="">Selecciona parcela</option>
        {parcelas.map(p => (
          <option key={p.MapCod} value={p.MapCod}>
            {p.MapNom}
          </option>
        ))}
      </select>

      {parcelaSeleccionada && accesos.length > 0 && (
        <>
          <h4>Colaboradores en esta parcela</h4>
          <ul>
            {accesos.map(acc => (
              <li key={acc.AccCod}>
                {acc.UsuNom} – Rol: {acc.AccRolAcc}
                <button onClick={() => handleEliminarAcceso(acc.AccCod)}>Eliminar</button>
              </li>
            ))}
          </ul>
        </>
      )}

      {usuarioEncontrado && parcelaSeleccionada && (
        <>
          <p>Usuario encontrado: {usuarioEncontrado.UsuNom}</p>
          <select value={AccRolAcc} onChange={(e) => setAccRolAcc(e.target.value)}>
            <option value="colaborador">Colaborador</option>
            <option value="técnico">Técnico</option>
          </select>
          <input
            type="text"
            placeholder="Observaciones"
            value={AccPer}
            onChange={(e) => setAccPer(e.target.value)}
          />
          <button onClick={handleAgregarAcceso}>Invitar</button>
        </>
      )}

      {mensaje && <p>{mensaje}</p>}
    </div>
  );
};

export default InvitarColaborador;

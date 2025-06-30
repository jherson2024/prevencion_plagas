// components/GestionParcelas.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  crearParcela,
  listarParcelasPorUsuario,
  modificarParcela,
  eliminarParcela,
  listarZonas,
  crearCultivo,
  listarCultivosPorParcela,
  modificarCultivo,
  eliminarCultivo
} from '../../services/ZonaTrabajoMapeo';

import ParcelaForm from './ParcelaForm';
import ListaParcelas from './ListaParcelas';
import './GestionParcelas.css';

const GestionParcelas = () => {
  const { user } = useAuth();
  const [parcelas, setParcelas] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [form, setForm] = useState({
    MapZonGeoCod: '',
    MapNom: '',
    MapAnc: '',
    MapAlt: '',
    MapCom: '',
    archivo: null
  });
  const [editando, setEditando] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [cultivos, setCultivos] = useState({});
  const [cultivosRegistrados, setCultivosRegistrados] = useState({});
  const [editandoCultivo, setEditandoCultivo] = useState(null);
  const urlBase = api.defaults.baseURL;

  const cargarCultivos = useCallback(async (parcelaId) => {
    const data = await listarCultivosPorParcela(parcelaId);
    setCultivosRegistrados(prev => ({ ...prev, [parcelaId]: data }));
  }, []);

  const cargarParcelas = useCallback(async () => {
    if (!user?.UsuCod) return;
    const data = await listarParcelasPorUsuario(user.UsuCod);
    setParcelas(data);
    data.forEach(p => cargarCultivos(p.MapCod));
  }, [user, cargarCultivos]);

  const cargarZonas = useCallback(async () => {
    const data = await listarZonas();
    setZonas(data);
  }, []);

  useEffect(() => {
    if (user?.UsuCod) {
      cargarParcelas();
      cargarZonas();
    }
  }, [user, cargarParcelas, cargarZonas]);

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    setForm({ ...form, [name]: files ? files[0] : value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('MapUsuCod', user.UsuCod);
    formData.append('MapZonGeoCod', form.MapZonGeoCod);
    formData.append('MapNom', form.MapNom);
    formData.append('MapAnc', form.MapAnc);
    formData.append('MapAlt', form.MapAlt);
    formData.append('MapCom', form.MapCom);
    if (form.archivo) formData.append('archivo', form.archivo);

    try {
      if (editando) {
        await modificarParcela(editando, {
          MapNom: form.MapNom,
          MapAnc: form.MapAnc,
          MapAlt: form.MapAlt,
          MapCom: form.MapCom
        });
        setMensaje('Parcela modificada correctamente');
      } else {
        await crearParcela(formData);
        setMensaje('Parcela registrada con éxito');
      }
      limpiarFormulario();
      cargarParcelas();
    } catch (error) {
      console.error(error);
      setMensaje('Error al procesar la parcela');
    }
  };

  const limpiarFormulario = () => {
    setForm({
      MapZonGeoCod: '',
      MapNom: '',
      MapAnc: '',
      MapAlt: '',
      MapCom: '',
      archivo: null
    });
    setEditando(null);
    setMensaje('');
  };

  const handleEditarParcela = (parcela) => {
    setForm({
      MapZonGeoCod: parcela.MapZonGeoCod,
      MapNom: parcela.MapNom,
      MapAnc: parcela.MapAnc,
      MapAlt: parcela.MapAlt,
      MapCom: parcela.MapCom,
      archivo: null
    });
    setEditando(parcela.MapCod);
  };

  const handleEliminarParcela = async (MapCod) => {
    if (window.confirm('¿Eliminar esta parcela?')) {
      await eliminarParcela(MapCod);
      setMensaje('Parcela eliminada');
      cargarParcelas();
    }
  };

  const handleCultivoChange = (e, parcelaId) => {
    const { name, value } = e.target;
    setCultivos((prev) => ({
      ...prev,
      [parcelaId]: {
        ...prev[parcelaId],
        [name]: value
      }
    }));
  };

  const handleCultivoSubmit = async (parcelaId) => {
    const cultivo = cultivos[parcelaId];
    if (!cultivo?.CulNomCul || !cultivo?.CulFecIni || !cultivo?.CulFecFin) {
      alert('Completa todos los campos del cultivo');
      return;
    }

    try {
      await crearCultivo({
        CulMapParCod: parcelaId,
        CulNomCul: cultivo.CulNomCul,
        CulFecIni: cultivo.CulFecIni,
        CulFecFin: cultivo.CulFecFin,
        CulObs: cultivo.CulObs || ''
      });
      setCultivos((prev) => ({ ...prev, [parcelaId]: {} }));
      await cargarCultivos(parcelaId);
    } catch (err) {
      console.error(err);
      alert('Error al registrar cultivo');
    }
  };

  const handleEditarCultivo = (cultivo) => {
    setEditandoCultivo(cultivo.CulCod);
    setCultivos((prev) => ({
      ...prev,
      [cultivo.CulMapParCod]: {
        CulNomCul: cultivo.CulNomCul,
        CulFecIni: cultivo.CulFecIni.split('T')[0],
        CulFecFin: cultivo.CulFecFin.split('T')[0],
        CulObs: cultivo.CulObs
      }
    }));
  };

  const handleGuardarCultivo = async (parcelaId, cultivoId) => {
    const cultivo = cultivos[parcelaId];
    await modificarCultivo(cultivoId, cultivo);
    setEditandoCultivo(null);
    await cargarCultivos(parcelaId);
  };

  const handleEliminarCultivo = async (parcelaId, cultivoId) => {
    await eliminarCultivo(cultivoId);
    await cargarCultivos(parcelaId);
  };

  const handleCancelarCultivo = (parcelaId) => {
    setEditandoCultivo(null);
    setCultivos((prev) => ({
      ...prev,
      [parcelaId]: {}
    }));
  };

  return (
    <div className="gestion-parcelas">
      <h2 className="titulo">Gestión de Parcelas</h2>
      {mensaje && <div className="mensaje">{mensaje}</div>}

      <ParcelaForm
        form={form}
        zonas={zonas}
        editando={editando}
        onChange={handleFormChange}
        onSubmit={handleFormSubmit}
        onCancel={limpiarFormulario}
      />

      <ListaParcelas
        parcelas={parcelas}
        urlBase={urlBase}
        cultivos={cultivos}
        cultivosRegistrados={cultivosRegistrados}
        editandoCultivoId={editandoCultivo}
        onEditarParcela={handleEditarParcela}
        onEliminarParcela={handleEliminarParcela}
        onCultivoChange={handleCultivoChange}
        onCultivoSubmit={handleCultivoSubmit}
        onEditarCultivo={handleEditarCultivo}
        onGuardarCultivo={handleGuardarCultivo}
        onEliminarCultivo={handleEliminarCultivo}
        onCancelarCultivo={handleCancelarCultivo}
      />
    </div>
  );
};

export default GestionParcelas;

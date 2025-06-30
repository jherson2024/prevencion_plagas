import React, { useState, useRef } from 'react';
import {
  subirImagen,
  crearUbicacion,
  crearCaptura,
} from '../../services/CapturaDatosCampo';
import './SubirImagen.css';

const SubirImagen = ({
  UsuCod,
  MapParCod,
  mapaUrl,
  historial,
  setHistorial,
  capturaSeleccionada,
  setCapturaSeleccionada
}) => {
  const [file, setFile] = useState(null);
  const [nota, setNota] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [subiendo, setSubiendo] = useState(false);
  const [coordenada, setCoordenada] = useState(null);
  const [mostrarPanelCaptura, setMostrarPanelCaptura] = useState(false);

  const imgRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    setMensaje('');
  };

  const handleClickEnMapa = (e) => {
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCoordenada({ x: parseFloat(x.toFixed(2)), y: parseFloat(y.toFixed(2)) });
    setMostrarPanelCaptura(true);
  };

  const handleSubir = async () => {
    if (!file || !coordenada) {
      setMensaje('Selecciona una imagen y un punto en el mapa');
      return;
    }
    try {
      setSubiendo(true);

      const imagen = await subirImagen(file);
      const CapImaCod = imagen.ImaCod;

      const ubicacion = await crearUbicacion({
        UbiMapParCod: MapParCod,
        UbiCoo: coordenada.x,
        UbiCooB: coordenada.y,
        UbiCom: nota,
      });
      const CapUbiCod = ubicacion.UbiCod;

      await crearCaptura({
        CapUsuCod: UsuCod,
        CapImaCod,
        CapUbiCod,
        CapNot: nota,
      });

      await setHistorial();

      setMensaje('✅ Captura registrada correctamente');
      setFile(null);
      setNota('');
      setCoordenada(null);
      setMostrarPanelCaptura(false); // Ocultar modal tras registrar
    } catch (err) {
      console.error(err);
      setMensaje('❌ Error al registrar la captura');
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div className="subir-container">
      <div className="mapa-wrapper">
        <img
          ref={imgRef}
          src={mapaUrl}
          alt="Mapa parcela"
          onClick={handleClickEnMapa}
          className="mapa-imagen"
        />

        {coordenada && (
          <div
            className="punto-nuevo"
            style={{ top: `${coordenada.y}%`, left: `${coordenada.x}%` }}
          />
        )}

        {historial.map((cap) => (
          <div
            key={cap.CapCod}
            className={`punto-historial ${
              capturaSeleccionada?.CapCod === cap.CapCod ? 'activo' : ''
            }`}
            style={{ top: `${cap.UbiCooB}%`, left: `${cap.UbiCoo}%` }}
            onClick={() => setCapturaSeleccionada(cap)}
            title={cap.CapNot}
          />
        ))}
      </div>

      {mostrarPanelCaptura && (
        <div className="modal-fondo">
          <div className="modal-panel">
            <h3>Registrar Captura</h3>
            <input type="file" accept="image/*" onChange={handleFileChange} />

            <textarea
              placeholder="Notas (opcional)"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              className="nota-textarea"
            />

            <button onClick={handleSubir} disabled={subiendo} className="boton-subir">
              {subiendo ? 'Registrando...' : 'Registrar Captura'}
            </button>

            <button className="cerrar-modal" onClick={() => setMostrarPanelCaptura(false)}>
              Cancelar
            </button>

            {mensaje && <p className="mensaje">{mensaje}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubirImagen;

import React, { useEffect, useState, useRef } from 'react';
import api from '../../services/api';
import './ChatInterno.css';

const ChatInterno = ({ UsuCod }) => {
  const [colaboradores, setColaboradores] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);
  const mensajesEndRef = useRef(null);

  // Cargar colaboradores y su último mensaje
  useEffect(() => {
    const fetchColaboradores = async () => {
      try {
        const res = await api.get(`/usuarios/${UsuCod}/colaboradores`);
        const colaboradoresConMensajes = await Promise.all(
          res.data.map(async (colab) => {
            try {
              const mensajesRes = await api.get(`/chat/entre/${UsuCod}/${colab.UsuCod}`);
              const mensajes = mensajesRes.data;
              const ultimoMensaje = mensajes.length
                ? mensajes[mensajes.length - 1].MenCon
                : 'Sin mensajes aún';
              return { ...colab, ultimoMensaje };
            } catch {
              return { ...colab, ultimoMensaje: 'Error al cargar mensaje' };
            }
          })
        );
        setColaboradores(colaboradoresConMensajes);
      } catch (error) {
        console.error('Error al cargar colaboradores:', error);
      }
    };
    fetchColaboradores();
  }, [UsuCod]);

  // Cargar mensajes con el usuario seleccionado
  useEffect(() => {
    const fetchMensajes = async () => {
      if (!usuarioSeleccionado) return;
      try {
        const res = await api.get(`/chat/entre/${UsuCod}/${usuarioSeleccionado.UsuCod}`);
        setMensajes(res.data);
      } catch (error) {
        console.error('Error al cargar mensajes:', error);
      }
    };
    fetchMensajes();

    const interval = setInterval(fetchMensajes, 5000);
    return () => clearInterval(interval);
  }, [usuarioSeleccionado, UsuCod]);

  // Auto scroll al final
  useEffect(() => {
    if (mensajesEndRef.current) {
      mensajesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [mensajes]);

  const enviarMensaje = async () => {
    if (!nuevoMensaje.trim() || !usuarioSeleccionado) return;
    setEnviando(true);
    try {
      await api.post('/chat/enviar', {
        emisor_id: UsuCod,
        receptor_id: usuarioSeleccionado.UsuCod,
        contenido: nuevoMensaje
      });
      const nuevo = {
        MenUsuCod: UsuCod,
        MenUsuBCod: usuarioSeleccionado.UsuCod,
        MenCon: nuevoMensaje,
        MenFecHor: new Date().toISOString()
      };
      setMensajes(prev => [...prev, nuevo]);
      setNuevoMensaje('');
      // Actualiza el último mensaje en la lista de contactos
      setColaboradores(prev =>
        prev.map(c =>
          c.UsuCod === usuarioSeleccionado.UsuCod
            ? { ...c, ultimoMensaje: nuevoMensaje }
            : c
        )
      );
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="chat-interno-wrapper">
      <div className="lista-contactos">
        <h3>📇 Contactos</h3>
        {colaboradores.map((c) => (
          <div
            key={c.UsuCod}
            className={`contacto ${usuarioSeleccionado?.UsuCod === c.UsuCod ? 'activo' : ''}`}
            onClick={() => {
              setUsuarioSeleccionado(c);
              setMensajes([]);
            }}
          >
            <div className="contacto-nombre">{c.UsuNom}</div>
            <div className="contacto-ultimo-mensaje">{c.ultimoMensaje}</div>
          </div>
        ))}
      </div>

      <div className="chat-box">
        {usuarioSeleccionado ? (
          <>
            <div className="chat-header">
              <h3>{usuarioSeleccionado.UsuNom}</h3>
            </div>

            <div className="mensajes">
              {mensajes.map((msg, i) => (
                <div
                  key={i}
                  className={`mensaje ${msg.MenUsuCod === UsuCod ? 'enviado' : 'recibido'}`}
                >
                  <p>{msg.MenCon}</p>
                  <small>{new Date(msg.MenFecHor).toLocaleString()}</small>
                </div>
              ))}
              <div ref={mensajesEndRef}></div>
            </div>

            <div className="entrada-mensaje">
              <input
                type="text"
                placeholder="Escribe un mensaje..."
                value={nuevoMensaje}
                onChange={e => setNuevoMensaje(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && enviarMensaje()}
              />
              <button onClick={enviarMensaje} disabled={enviando}>
                {enviando ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </>
        ) : (
          <div className="chat-placeholder">
            <p>Selecciona un contacto para empezar a chatear.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterno;

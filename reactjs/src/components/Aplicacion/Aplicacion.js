import React, { useState, useEffect } from 'react';
import './Temas.css';
import './Aplicacion.css';
import { useAuth } from '../../context/AuthContext';
import {Brush,Command,Users,Map,LayoutDashboard,AlertTriangle,Thermometer,} from 'lucide-react';
import RegistrarZonaGeografica from '../Mapa/RegistrarZonaGeografica';
import GestionParcelas from '../Mapa/GestionParcelas';
import InvitarColaborador from '../Usuarios/InvitarColaborador';
import AsignarAccesos from '../Usuarios/AsignarAccesos';
import ModelosIA from '../Predicciones/ModelosIA';
import CapturaDatosCampo from '../Diagnostico/CapturaDatosCampo';
import HistorialCapturas from '../Diagnostico/HistorialCapturas';
import CorreccionesManuales from '../Diagnostico/CorrecionesManuales';
import LineaTiempo from '../Mapa/LineaTiempo';
import MapaCalor from '../Mapa/MapaCalor';
import ResumenZona from '../Dashboard/ResumenZona';
import Comparativas from '../Dashboard/Comparativas';
import ChatInterno from '../Usuarios/ChatInterno';
const submenus = {
  diagnostico: ['Subir imagen','Resultados de IA','Correcciones manuales','Historial de capturas'],
  mapa: ['Mapa de calor','Línea de tiempo','Gestión de parcelas','Registrar zona geográfica'],
  dashboard: ['Resumen por zona','Comparativas','Tendencias','Estadísticas operativas'],
  alertas: ['Alertas activas','Historial','Recomendaciones','Notas personales'],
  predicciones: ['Clima y plagas','Pronósticos','Modelos IA','Predicciones recientes'],
  usuarios: ['Invitar colaborador','Asignar accesos','Historial de colaboraciones','Chat interno']
};
const Aplicacion = () => {
  const [mostrarMenuConfig, setMostrarMenuConfig] = useState(false);
  const [seccionActiva, setSeccionActiva] = useState('diagnostico');
  const [contenidoActual, setContenidoActual] = useState(null);
  const [mostrarMenuUsuario, setMostrarMenuUsuario] = useState(false);
  const [mostrarCentroAyuda, setMostrarCentroAyuda] = useState(false);
  const { user, logout } = useAuth();
  const [tema, setTema] = useState('tema-base');
  useEffect(() => {
    document.body.className = tema; // Aplica la clase de tema al <body>
  }, [tema]);
  const renderSubmenu = () => {
    const opciones = submenus[seccionActiva] || [];
    return (
      <ul className="nav-list">
        {opciones.map((item, index) => (
          <li
            key={index}
            onClick={() => setContenidoActual(item)}
            className={contenidoActual === item ? 'active' : ''}
          >
            {item}
          </li>
        ))}
      </ul>
    );
  };
  const renderContenido = () => {
    switch (contenidoActual) {
      case 'Personalizar':
        return (
          <div className="card">
            <h3>Personalizar tema</h3>
            <p>Selecciona un tema visual para la aplicación:</p>
           <select value={tema} onChange={(e) => setTema(e.target.value)}>
            <option value="tema-base">Base</option>
            <option value="tema-verde">Verde</option>
            <option value="tema-magenta">Magenta</option>
            <option value="tema-azul">Azul</option>
            <option value="tema-ámbar">Ámbar</option>
            <option value="tema-gris">Gris</option>
            <option value="tema-morado">Morado</option>
           </select>
          </div>
        );
      case 'Subir imagen':
        return <CapturaDatosCampo UsuCod={user.UsuCod}/>;
      case 'Resultados de IA':
        return <div className="card">Resultados del análisis automático (PlagasNet v3.1).</div>;
      case 'Correcciones manuales':
        return <CorreccionesManuales UsuCod={user.UsuCod}/>;
      case 'Historial de capturas':
        return <HistorialCapturas UsuCod={user.UsuCod}/>;
      case 'Mapa de calor':
        return <MapaCalor UsuCod={user.UsuCod}/>;
      case 'Línea de tiempo':
        return <LineaTiempo UsuCod={user.UsuCod}/>;
      case 'Gestión de parcelas':
        return <GestionParcelas/>
      case 'Registrar zona geográfica':
        return <RegistrarZonaGeografica/>
      case 'Resumen por zona':
        return <ResumenZona UsuCod={user.UsuCod}/>;
      case 'Comparativas':
        return <Comparativas UsuCod={user.UsuCod}/>;
      case 'Tendencias':
        return <div className="card">Análisis de patrones históricos y predicciones.</div>;
      case 'Estadísticas operativas':
        return <div className="card">Resumen de capturas, alertas y predicciones gestionadas.</div>;
      case 'Alertas activas':
        return <div className="card">Listado actual de alertas generadas por IA.</div>;
      case 'Historial':
        return <div className="card">Historial de alertas pasadas y sus respuestas.</div>;
      case 'Recomendaciones':
        return <div className="card">Acciones sugeridas por tipo de plaga y cultivo.</div>;
      case 'Notas personales':
        return <div className="card">Anotaciones técnicas y observaciones de campo.</div>;
      case 'Clima y plagas':
        return <div className="card">Datos climáticos cruzados con probabilidad de plagas.</div>;
      case 'Pronósticos':
        return <div className="card">Proyecciones meteorológicas de riesgo fitosanitario.</div>;
      case 'Modelos IA':
        return <ModelosIA/>
      case 'Predicciones recientes':
        return <div className="card">Listado de predicciones automáticas más recientes.</div>;
      case 'Invitar colaborador':
        return <InvitarColaborador UsuCod={user.UsuCod}/>;
      case 'Asignar accesos':
        return <AsignarAccesos UsuCod={user.UsuCod}/>;
      case 'Historial de colaboraciones':
        return <div className="card">Registro de contribuciones de otros usuarios.</div>;
      case 'Chat interno':
        return <ChatInterno UsuCod={user.UsuCod}/>;
      default:
        return (
          <div className="card">
            <h3>Vista actual: {seccionActiva}</h3>
            <p className="description">Selecciona una opción del submenú para comenzar.</p>
          </div>
        );
    }
  };
  return (
    <div className="layout">
      {/* Menú lateral principal */}
      <aside className="main-sidebar">
        <div
          className={`icon-donut ${seccionActiva === 'diagnostico' ? 'active' : ''}`}
          title="Diagnóstico"
          onClick={() => {
            setSeccionActiva('diagnostico');
            setContenidoActual(null);
          }}
        />
        <div onClick={() => { setSeccionActiva('mapa'); setContenidoActual(null); }} title="Mapa">
          <Map color={seccionActiva === 'mapa' ? '#fff' : '#9ca3af'} />
        </div>
        <div onClick={() => { setSeccionActiva('dashboard'); setContenidoActual(null); }} title="Dashboard">
          <LayoutDashboard color={seccionActiva === 'dashboard' ? '#fff' : '#9ca3af'} />
        </div>
        <div onClick={() => { setSeccionActiva('alertas'); setContenidoActual(null); }} title="Alertas">
          <AlertTriangle color={seccionActiva === 'alertas' ? '#fff' : '#9ca3af'} />
        </div>
        <div onClick={() => { setSeccionActiva('predicciones'); setContenidoActual(null); }} title="Predicciones">
          <Thermometer color={seccionActiva === 'predicciones' ? '#fff' : '#9ca3af'} />
        </div>
        <div onClick={() => { setSeccionActiva('usuarios'); setContenidoActual(null); }} title="Usuarios">
          <Users color={seccionActiva === 'usuarios' ? '#fff' : '#9ca3af'} />
        </div>
      </aside>
      {/* Submenú contextual */}
      <aside className="sidebar">
        <h2 className="logo">{seccionActiva.charAt(0).toUpperCase() + seccionActiva.slice(1)}</h2>
        {renderSubmenu()}
      </aside>
      {/* Contenido principal */}
      <div className="main-area">
        <header className="header">
          <div className="header-icons">
            <Brush
              size={20}
              title="Personalizar tema"
              onClick={() => setMostrarMenuConfig(prev => !prev)}
              style={{ cursor: 'pointer' }}
            />
            <Command
              size={20}
              title="Centro de ayuda"
              onClick={() => setMostrarCentroAyuda(true)}
              style={{ cursor: 'pointer' }}
            />
            <div className="divider" />
            <div
              className="user-menu"
              onClick={() => setMostrarMenuUsuario(prev => !prev)}
              style={{ cursor: 'pointer' }}
            >
              <span className="user-name">{user?.UsuNom || 'Usuario'}</span>
              <span className="dropdown-arrow">▼</span>
            </div>
            <img
              src="/img/default-avatar.png"
              alt="Avatar"
              className="user-avatar"
              style={{ cursor: 'pointer' }}
            />
          </div>
        </header>
        <main className="content">{renderContenido()}</main>
        {mostrarCentroAyuda && (
          <div className="modal">
            <div className="modal-content">
              <h3>Centro de ayuda</h3>
              <p>Aquí podrías mostrar preguntas frecuentes o enlaces útiles.</p>
              <button onClick={() => setMostrarCentroAyuda(false)}>Cerrar</button>
            </div>
          </div>
        )}
        {mostrarMenuUsuario && (
          <div className="user-dropdown">
            <ul>
              <li onClick={() => alert('Ir a perfil')}>Mi perfil</li>
              <li onClick={logout}>Cerrar sesión</li>
            </ul>
          </div>
        )}
        {mostrarMenuConfig && (
        <select
          id="tema-select"
          value={tema}
          onChange={(e) => {
            setTema(e.target.value);
            setMostrarMenuConfig(false);
          }}
        >
          <option value="tema-base">Base</option>
          <option value="tema-verde">Verde</option>
          <option value="tema-magenta">Magenta</option>
          <option value="tema-azul">Azul</option>
          <option value="tema-ámbar">Ámbar</option>
          <option value="tema-gris">Gris</option>
          <option value="tema-morado">Morado</option>
        </select>

)}

      </div>
    </div>
  );
};

export default Aplicacion;

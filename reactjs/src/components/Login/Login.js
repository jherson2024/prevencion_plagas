import React, { useState } from 'react';
import { login as loginService } from '../../services/RegistroConfiguracionInicial';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

export default function Login() {
  const [form, setForm] = useState({ UsuCor: '', UsuCon: '' });
  const [error, setError] = useState('');
  const [redirectFail, setRedirectFail] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setRedirectFail(false);

    console.log('Enviando login...');
    try {
      const res = await loginService(form);
      console.log('Respuesta del servicio:', res);

      login({
        user: { UsuCod: res.UsuCod,UsuNom:res.UsuNom },
        token: 'FAKE_TOKEN', // o res.token si en el futuro se implementa
      });

      console.log('Login exitoso, redirigiendo a /aplicacion');
      navigate('/aplicacion');

      setTimeout(() => {
        if (window.location.pathname !== '/aplicacion') {
          console.log('⚠ Redirección fallida. Ruta actual:', window.location.pathname);
          setRedirectFail(true);
        }
      }, 1000);
    } catch (err) {
      console.log('Error de login:', err);
      setError('Credenciales incorrectas');
    }
  };

  return (
     <div className="login-container">
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="UsuCor"
          placeholder="Correo"
          value={form.UsuCor}
          onChange={handleChange}
        />
        <input
          name="UsuCon"
          type="password"
          placeholder="Contraseña"
          value={form.UsuCon}
          onChange={handleChange}
        />
        <button type="submit">Entrar</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <p>¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link></p>

      {redirectFail && (
  <div className="redirect-warning">
    <strong>⚠ No se pudo redirigir a <code>/aplicacion</code>.</strong>
    <p>Verifica que la ruta exista en tus <code>Routes</code> y que el usuario haya sido autenticado correctamente.</p>
  </div>
)}
    </div>
  );
}

import React, { useState } from 'react';
import { registrarUsuario } from '../../services/RegistroConfiguracionInicial';
import { useNavigate, Link } from 'react-router-dom';
import './Register.css';

export default function Register() {
  const [form, setForm] = useState({ UsuNom: '', UsuCor: '', UsuCon: '' });
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registrarUsuario(form);
      setMensaje('Registro exitoso. Redirigiendo...');
      setTimeout(() => navigate('/login'), 2000);
    } catch {
      setMensaje('Error al registrar');
    }
  };

  return (
    <div className="register-container">
      <h2>Registro</h2>
      <form onSubmit={handleSubmit}>
        <input name="UsuNom" placeholder="Nombre" onChange={handleChange} />
        <input name="UsuCor" placeholder="Correo" onChange={handleChange} />
        <input name="UsuCon" type="password" placeholder="Contraseña" onChange={handleChange} />
        <button type="submit">Registrarse</button>
      </form>
      <p>{mensaje}</p>
      <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link></p>
    </div>
  );
}

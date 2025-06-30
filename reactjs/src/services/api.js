// src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:8000'; // Cambia según tu entorno

const api = axios.create({
  baseURL: API_URL,
});

export default api;

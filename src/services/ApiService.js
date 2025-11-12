import axios from 'axios';

// 🖥️ Usa variable de entorno (Railway) o localhost (desarrollo)
// ✅ URL base corregida
const API_URL =
  import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL
    : "http://localhost:3001/api";
console.log("🌍 BaseURL usada por ApiService:", import.meta.env.VITE_API_URL);

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: { 'Content-Type': 'application/json' }
    });

    // Cargar token si ya existe en localStorage
    const token = localStorage.getItem('token');
    if (token) this.setToken(token);
  }

  // ========================
  // 🔐 Autenticación
  // ========================

  async login({ identificador, contrasena }) {
    try {
      const response = await this.api.post('/usuarios/login', { identificador, contrasena });
      const data = response.data;

      if (data.token) {
        this.setToken(data.token);
        if (data.usuario) this.setCurrentUser(data.usuario);
        return data;
      } else {
        throw new Error('No se recibió token de autenticación');
      }
    } catch (error) {
      console.error('❌ Error en login:', error);
      throw error;
    }
  }

  async register(userData) {
    try {
      const response = await this.api.post('/usuarios/registro', userData);
      return response.data;
    } catch (error) {
      console.error('❌ Error en registro:', error);
      throw error;
    }
  }

  async getPerfil() {
    try {
      const response = await this.api.get('/usuarios/me');
      // Tu backend devuelve { exito: true, datos: {...} }
      return response.data.datos;
    } catch (error) {
      console.error('❌ Error al obtener perfil:', error);
      throw error;
    }
  }



  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete this.api.defaults.headers.common['Authorization'];
  }

  // ========================
  // ⚙️ Token y usuario
  // ========================

  setToken(token) {
    localStorage.setItem('token', token);
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  getToken() {
    return localStorage.getItem('token');
  }

  setCurrentUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // ========================
  // 🌐 Métodos genéricos
  // ========================

  async get(url, config = {}) {
    try {
      const response = await this.api.get(url, config);
      return response.data;
    } catch (error) {
      console.error(`[API ERROR] GET ${url}`, error);
      throw error;
    }
  }

  async post(url, data = {}, config = {}) {
    try {
      const response = await this.api.post(url, data, config);
      return response.data;
    } catch (error) {
      console.error(`[API ERROR] POST ${url}`, error);
      throw error;
    }
  }

  async put(url, data = {}, config = {}) {
    try {
      const response = await this.api.put(url, data, config);
      return response.data;
    } catch (error) {
      console.error(`[API ERROR] PUT ${url}`, error);
      throw error;
    }
  }

  async delete(url, config = {}) {
    try {
      const response = await this.api.delete(url, config);
      return response.data;
    } catch (error) {
      console.error(`[API ERROR] DELETE ${url}`, error);
      throw error;
    }
  }
  // ================================
  // 👤 Métodos compatibles con Usuario.js (POO)
  // ================================

  async loginUsuario(payload) {
    // Wrapper para compatibilidad con la clase Usuario
    return this.post('/usuarios/login', payload);
  }

  async registroUsuario(payload) {
    // Wrapper para compatibilidad con la clase Usuario
    return this.post('/usuarios/registro', payload);
  }

  async obtenerPerfil() {
    return this.get('/usuarios/me');
  }

  async actualizarPerfil(payload) {
    return this.put('/usuarios/me', payload);
  }

}

const apiService = new ApiService();
export default apiService;

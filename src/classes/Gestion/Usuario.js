// src/classes/Gestion/Usuario.js
import apiService from "../../services/ApiService.js";

class Usuario {
  constructor({
    id_usuario = null,
    nombre = "",
    usuario = "",
    correo = "",
    contrasena = "",
    rol = "estudiante",
    imagen_perfil = null,
  } = {}) {
    this.id_usuario = id_usuario;
    this.nombre = nombre;
    this.usuario = usuario;
    this.correo = correo;
    this.contrasena = contrasena;
    this.rol = rol;
    this.imagen_perfil = imagen_perfil;
  }

  // ================================
  // 🔐 LOGIN
  // ================================
  async login(identificador, contrasena) {
    try {
      const payload = { identificador, contrasena };
      const res = await apiService.loginUsuario(payload);

      if (res?.success && res?.token) {
        apiService.setToken(res.token);
        localStorage.setItem("token", res.token);

        // crear instancia de usuario con los datos del backend
        const user = new Usuario(res.usuario);
        user.guardarEnLocal();

        return user;
      }

      throw new Error(res?.mensaje || "Credenciales inválidas");
    } catch (err) {
      console.error("❌ Error en Usuario.login:", err);
      throw err;
    }
  }

  // ================================
  // 🧾 REGISTRO
  // ================================
async registrar() {
  try {
    const payload = {
      nombre: this.nombre,
      usuario: this.usuario,
      correo: this.correo,
      contrasena: this.contrasena,
      rol: this.rol?.toLowerCase() || "estudiante",
      imagen_perfil: this.imagen_perfil || null,
    };

    const res = await apiService.registroUsuario(payload);

    console.log("📦 Respuesta exacta del backend:", res); // 👀 <— clave

    if (res?.exito === true) {
      console.log("✅ Usuario registrado correctamente:", res.datos);

      Object.assign(this, res.datos);
      return this;
    } else {
      console.warn("⚠️ No vino exito:true, contenido recibido:", res);
      throw new Error(res?.mensaje || "Error en el registro");
    }
  } catch (err) {
    console.error("❌ Error en Usuario.registrar:", err);
    throw err;
  }
}




  // ================================
  // 👤 CARGAR PERFIL
  // ================================
  async cargarPerfil() {
    try {
      const res = await apiService.obtenerPerfil();

      if (!res?.exito || !res?.datos)
        throw new Error("No se pudo obtener el perfil");

      const datos = res.datos;

      this.id_usuario = datos.id_usuario;
      this.nombre = datos.nombre;
      this.usuario = datos.usuario;
      this.correo = datos.correo || "";
      this.rol = datos.rol || "estudiante";
      this.imagen_perfil = datos.imagen_perfil || null;

      this.guardarEnLocal();
      return this;
    } catch (err) {
      console.error("[Usuario.cargarPerfil]", err);
      throw err;
    }
  }

  // 📌 Actualizar perfil del usuario
  async actualizarPerfil(datos) {
    try {
      const apiService = (await import("../../services/ApiService.js")).default;

      const response = await apiService.actualizarPerfil(datos);

      if (response?.exito) {
        const perfil = response.datos;

        // 🔄 Actualizamos los atributos del objeto Usuario actual
        this.nombre = perfil.nombre;
        this.usuario = perfil.usuario;
        this.correo = perfil.correo;
        this.rol = perfil.rol;
        this.imagen_perfil = perfil.imagen_perfil;

        // 🔒 Si se cambió contraseña, limpiamos por seguridad
        if (datos.contrasena) this.contrasena = "";

        // 🧠 Guardamos los cambios en localStorage
        this.guardarEnLocal();

        return perfil;
      } else {
        throw new Error(response?.mensaje || "Error al actualizar el perfil");
      }
    } catch (error) {
      console.error("[Usuario.actualizarPerfil] ❌", error);
      throw error;
    }
  }

  // ================================
  // 🚪 LOGOUT
  // ================================
  static logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuarioElectroSimu");
    console.log("👋 Sesión cerrada.");
  }

  // ================================
  // 💾 GUARDAR Y CARGAR LOCALMENTE
  // ================================
  guardarEnLocal() {
    localStorage.setItem("usuarioElectroSimu", JSON.stringify(this));
  }

  static cargarDesdeLocal() {
    const data = localStorage.getItem("usuarioElectroSimu");
    if (!data) return null;
    try {
      return new Usuario(JSON.parse(data));
    } catch {
      return null;
    }
  }
}

export default Usuario;

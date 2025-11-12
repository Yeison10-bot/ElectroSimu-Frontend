import * as React from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Avatar,
  Container,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import Usuario from "../../classes/Gestion/Usuario.js";
import imageCompression from 'browser-image-compression';

class Perfil extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isEditing: false,
      userData: null,
      formData: {},
      loading: false,
      error: null,
    };
    this.fileInputRef = React.createRef();
  }

  async componentDidMount() {
    await this.obtenerPerfil();
  }

  // ========================
  // 👤 Obtener perfil (POO)
  // ========================
  obtenerPerfil = async () => {
    try {
      const usuario = Usuario.cargarDesdeLocal() || new Usuario();
      const perfil = await usuario.cargarPerfil();

      if (!perfil) throw new Error("No se encontró el perfil");

      // ✅ Limpiamos los datos y dejamos la contraseña vacía
      this.setState({
        userData: usuario,
        formData: {
          nombre: usuario.nombre || "",
          usuario: usuario.usuario || "",
          correo: usuario.correo || "",
          rol: usuario.rol || "",
          imagen_perfil: usuario.imagen_perfil || "",
          contrasena: "", // 👈 Siempre vacío
        },
      });
    } catch (error) {
      console.error("❌ Error al cargar el perfil:", error);
      this.setState({ error: "No se pudo cargar el perfil" });
    }
  };


  handleChange = (e) => {
    this.setState({
      formData: {
        ...this.state.formData,
        [e.target.name]: e.target.value,
      },
    });
  };

  // ========================
  // 💾 Guardar cambios (POO)
  // ========================
  handleSave = async () => {
    this.setState({ loading: true });
    try {
      const usuario = Usuario.cargarDesdeLocal();
      if (!usuario) throw new Error("Usuario no encontrado en sesión");

      // Copiamos los datos actuales del formulario
      const datos = { ...this.state.formData };

      // 🧹 Si la contraseña está vacía, no la enviamos al backend
      if (!datos.contrasena || datos.contrasena.trim() === "") {
        delete datos.contrasena;
      }

      // 🧠 Llamamos a la función de actualización del modelo POO
      const actualizado = await usuario.actualizarPerfil(datos);

      // 🗂️ Guardamos el nuevo estado local (actualizado sin contrasena)
      usuario.guardarEnLocal();

      this.setState({
        userData: actualizado || usuario,
        isEditing: false,
        loading: false,
      });

      alert("✅ Perfil actualizado correctamente");

      // 🔁 Esperamos un momento y recargamos la página
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("❌ Error al actualizar perfil:", error);
      alert("Error al actualizar el perfil");
      this.setState({ loading: false });
    }
  };



  handleCancel = () => {
    this.setState({
      formData: { ...this.state.userData },
      isEditing: false,
    });
  };

  handleEdit = () => {
    this.setState({ isEditing: true });
  };

  // ========================
  // 🖼️ Imagen de perfil
  // ========================


  handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const options = { maxSizeMB: 1.5, maxWidthOrHeight: 1024 };
    try {
      const compressedFile = await imageCompression(file, options);
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result;
        this.setState({
          formData: { ...this.state.formData, imagen_perfil: base64 },
          userData: { ...this.state.userData, imagen_perfil: base64 },
        });
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error('❌ Error al comprimir imagen:', error);
    }
  };



  // ========================
  // 🎨 Encabezado
  // ========================
  renderHeader = () => {
    const { userData, isEditing } = this.state;
    const navigate = this.props.navigate;

    if (!userData) return null;

    return (
      <Container maxWidth="lg">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/inicio")}
          sx={{ mb: 3, textTransform: "none" }}
        >
          Volver al inicio
        </Button>

        <Paper
          elevation={0}
          sx={{
            background: "linear-gradient(135deg, #0288d1 0%, #01579b 100%)",
            color: "white",
            p: 4,
            mb: 3,
            borderRadius: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
            }}
          >
            <Avatar
              src={userData.imagen_perfil || undefined}
              onClick={() => isEditing && this.fileInputRef.current.click()}
              sx={{
                width: 120,
                height: 120,
                bgcolor: userData.imagen_perfil ? "transparent" : "white",
                color: "#0288d1",
                fontSize: "3rem",
                fontWeight: "bold",
                cursor: isEditing ? "pointer" : "default",
              }}
            >
              {!userData.imagen_perfil && userData.nombre?.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {userData.nombre}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Rol: {userData.rol}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Usuario: {userData.usuario}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    );
  };

  // ========================
  // 🧾 Formulario editable
  // ========================
  renderFormulario = () => {
    const { isEditing, formData, userData } = this.state;
    if (!userData) return null;

    return (
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h5" fontWeight="bold">
            Información Personal
          </Typography>

          {!isEditing ? (
            <Button
              startIcon={<EditIcon />}
              variant="contained"
              onClick={this.handleEdit}
              sx={{ textTransform: "none" }}
            >
              Editar
            </Button>
          ) : (
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="outlined"
                onClick={this.handleCancel}
                sx={{ textTransform: "none" }}
              >
                Cancelar
              </Button>
              <Button
                startIcon={<SaveIcon />}
                variant="contained"
                color="success"
                onClick={this.handleSave}
                disabled={this.state.loading}
                sx={{ textTransform: "none" }}
              >
                {this.state.loading ? "Guardando..." : "Guardar"}
              </Button>
            </Box>
          )}
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nombre Completo"
              name="nombre"
              value={formData.nombre || ""}
              onChange={this.handleChange}
              disabled={!isEditing}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Usuario"
              name="usuario"
              value={formData.usuario || ""}
              onChange={this.handleChange}
              disabled={!isEditing}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Correo Electrónico"
              name="correo"
              value={formData.correo || ""}
              onChange={this.handleChange}
              disabled={!isEditing}
            />
          </Grid>

          {isEditing && (
            <>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nueva Contraseña"
                  name="contrasena"
                  type="password"
                  value={isEditing ? formData.contrasena || "" : ""}
                  onChange={this.handleChange}
                  placeholder="Dejar en blanco para mantener la actual"
                  helperText="Solo completa este campo si deseas cambiar tu contraseña"
                />
              </Grid>

              <Grid item xs={12}>
                <input
                  type="file"
                  accept="image/*"
                  ref={this.fileInputRef}
                  onChange={this.handleImageChange}
                  style={{ display: "none" }}
                />
                <Typography variant="body2" color="text.secondary">
                  Haz clic en tu foto para cambiarla
                </Typography>
              </Grid>
            </>
          )}
        </Grid>
      </Paper>
    );
  };

  render() {
    return (
      <Box sx={{ height: "100%", overflow: "auto", bgcolor: "#f9fafb", p: 3 }}>
        {this.renderHeader()}
        {this.renderFormulario()}
      </Box>
    );
  }
}

function PerfilWrapper() {
  const navigate = useNavigate();
  return <Perfil navigate={navigate} />;
}

export default PerfilWrapper;

import React, { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Usuario from "../../classes/Gestion/Usuario.js"; // ✅ POO

const Registro = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    usuario: "",
    correo: "",
    contrasena: "",
    rol: "estudiante",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ========================
  // ✏️ Manejo de cambios
  // ========================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
    setSuccess("");
  };

  // ========================
  // 📨 Envío del formulario
  // ========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validar campos requeridos
      if (!formData.nombre || !formData.usuario || !formData.correo || !formData.contrasena) {
        setError("Por favor completa todos los campos obligatorios.");
        setLoading(false);
        return;
      }

      // Crear instancia de Usuario (POO)
      const nuevoUsuario = new Usuario({
        nombre: formData.nombre,
        usuario: formData.usuario,
        correo: formData.correo,
        contrasena: formData.contrasena,
        rol: formData.rol.toLowerCase(),
      });

      // Llamar método registrar
            const resultado = await nuevoUsuario.registrar();

      // ✅ Si no lanza error, el registro fue exitoso
      setSuccess("¡Registro exitoso! Tu cuenta ha sido creada correctamente.");

      // Limpiar formulario
      setFormData({
        nombre: "",
        usuario: "",
        correo: "",
        contrasena: "",
        rol: "estudiante",
      });

      // Redirigir al login
      setTimeout(() => {
        navigate("/login", {
          state: { message: "Registro exitoso. Por favor inicia sesión." },
        });
      }, 2000);

    } catch (error) {
      console.error("❌ Error en registro:", error);
      setError(error?.message || "Error al registrarse. Inténtalo nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // ========================
  // 🧱 Renderizado
  // ========================
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          maxWidth: "1000px",
          width: "100%",
        }}
      >
        {/* Panel ElectroSimu */}
        <Card
          sx={{
            width: "450px",
            height: "600px",
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "12px 0 0 12px",
          }}
        >
          <CardContent sx={{ textAlign: "center" }}>
            <Typography variant="h4" sx={{ color: "white", mb: 2 }}>
              ⚡ ElectroSimu
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: "white", opacity: 0.9, mb: 3 }}
            >
              Únete a nuestra comunidad educativa
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "white", opacity: 0.8 }}
            >
              Aprende los fundamentos de la electricidad de manera interactiva y forma parte de una comunidad comprometida con la educación tecnológica.
            </Typography>
          </CardContent>
        </Card>

        {/* Formulario de registro */}
        <Paper
          elevation={10}
          sx={{
            p: 3,
            borderRadius: "0 12px 12px 0",
            width: "450px",
            height: "600px",
            background: "white",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Typography
            variant="h5"
            component="h1"
            sx={{
              mb: 2,
              textAlign: "center",
              fontWeight: "bold",
              color: "#333",
            }}
          >
            Registro
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 1.5, fontSize: "0.875rem" }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 1.5, fontSize: "0.875rem" }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Nombre completo"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              margin="dense"
              required
              variant="outlined"
              size="small"
              sx={{ mb: 1.5 }}
            />

            <TextField
              fullWidth
              label="Usuario"
              name="usuario"
              value={formData.usuario}
              onChange={handleChange}
              margin="dense"
              required
              variant="outlined"
              size="small"
              sx={{ mb: 1.5 }}
            />

            <TextField
              fullWidth
              label="Correo electrónico"
              name="correo"
              type="email"
              value={formData.correo}
              onChange={handleChange}
              margin="dense"
              required
              variant="outlined"
              size="small"
              sx={{ mb: 1.5 }}
            />

            <TextField
              fullWidth
              label="Contraseña"
              name="contrasena"
              type="password"
              value={formData.contrasena}
              onChange={handleChange}
              margin="dense"
              required
              variant="outlined"
              size="small"
              sx={{ mb: 1.5 }}
            />

            <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
              <InputLabel size="small">Rol</InputLabel>
              <Select
                name="rol"
                value={formData.rol}
                label="Rol"
                onChange={handleChange}
                size="small"
              >
                <MenuItem value="estudiante">Estudiante</MenuItem>
                <MenuItem value="profesor">Profesor</MenuItem>
              </Select>
            </FormControl>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="medium"
              disabled={loading}
              sx={{
                py: 1,
                mb: 2,
                background:
                  "linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)",
                "&:hover": {
                  background:
                    "linear-gradient(45deg, #388E3C 30%, #689F38 90%)",
                },
              }}
            >
              {loading ? "Registrando..." : "REGISTRARSE"}
            </Button>

            <Box
              sx={{
                pt: 1.5,
                borderTop: "1px solid #eee",
                textAlign: "center",
              }}
            >
              <Typography variant="body2" sx={{ mb: 1.5, color: "#666", fontSize: "0.875rem" }}>
                ¿Ya tienes cuenta?
              </Typography>

              <Button
                fullWidth
                variant="outlined"
                size="medium"
                onClick={() => navigate("/login")}
                sx={{
                  py: 1,
                  borderColor: "#2196F3",
                  color: "#2196F3",
                  fontSize: "0.875rem",
                  "&:hover": {
                    borderColor: "#1976D2",
                    backgroundColor: "rgba(33, 150, 243, 0.04)",
                  },
                }}
              >
                INICIAR SESIÓN
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Registro;

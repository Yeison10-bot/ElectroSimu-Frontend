import { useState } from "react";
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  TextField,
  Button,
  Link,
  Alert,
  Avatar,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import Usuario from "../../classes/Gestion/Usuario.js"; // ✅ Importamos la clase POO

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ identificador: "", contrasena: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imagenPerfil, setImagenPerfil] = useState(null);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const { identificador, contrasena } = formData;

      if (!identificador || !contrasena) {
        setError("Por favor ingrese su usuario o correo y contraseña.");
        setLoading(false);
        return;
      }

      // ✅ Usamos la clase Usuario (POO)
      const usuario = new Usuario();
      const ok = await usuario.login(identificador, contrasena);

      if (ok) {
        setImagenPerfil(usuario.imagen_perfil || null);
        setSuccess("Inicio de sesión exitoso");

        // Esperamos un momento y redirigimos al inicio
        setTimeout(() => navigate("/inicio"), 1000);
      } else {
        throw new Error("Credenciales incorrectas");
      }
    } catch (err) {
      console.error("❌ Error en login:", err);

      if (err.response) {
        // 💬 Si el backend envía un mensaje, úsalo directamente
        const mensajeServidor = err.response.data?.mensaje || err.response.data?.message;

        // Si el backend devolvió 400 (usuario o contraseña incorrectos)
        if (err.response.status === 400) {
          setError(mensajeServidor || "Usuario o contraseña incorrectos");
        }
        // Si el token expiró, usuario bloqueado, etc.
        else if (err.response.status === 401) {
          setError(mensajeServidor || "No autorizado. Verifique sus credenciales.");
        }
        // Si ocurre otro tipo de error controlado
        else {
          setError(mensajeServidor || "Error en la autenticación.");
        }
      } else if (err.request) {
        // 🚫 No hubo respuesta del servidor (probablemente backend caído)
        setError("No se pudo conectar con el servidor. Inténtalo más tarde.");
      } else {
        // ⚙️ Error interno en el código frontend
        setError(err.message || "Error desconocido al iniciar sesión.");
      }
    }
    finally {
      setLoading(false);
    }
  };

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
          maxWidth: "900px",
          width: "100%",
        }}
      >
        {/* Panel ElectroSimu */}
        <Card
          sx={{
            width: "400px",
            minHeight: "580px",
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
              sx={{ color: "white", opacity: 0.9 }}
            >
              Aprende los fundamentos de la electricidad de manera
              interactiva
            </Typography>

            {imagenPerfil && (
              <Box sx={{ mt: 3 }}>
                <Avatar
                  alt="Perfil"
                  src={imagenPerfil}
                  sx={{
                    width: 80,
                    height: 80,
                    margin: "0 auto",
                    border: "2px solid white",
                    boxShadow: "0px 0px 10px rgba(255,255,255,0.5)",
                  }}
                />
                <Typography sx={{ color: "white", mt: 1 }}>
                  ¡Bienvenido de nuevo 👋!
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Formulario de login */}
        <Paper
          elevation={10}
          sx={{
            p: 4,
            borderRadius: "0 12px 12px 0",
            width: "400px",
            minHeight: "580px",
            background: "white",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            overflowY: "auto",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              mb: 3,
              textAlign: "center",
              fontWeight: "bold",
              color: "#333",
            }}
          >
            Inicio de Sesión
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 1.5 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 1.5 }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Usuario o correo"
              name="identificador"
              value={formData.identificador}
              onChange={handleChange}
              margin="normal"
              required
              variant="outlined"
              sx={{ mb: 1.5 }}
            />

            <TextField
              fullWidth
              label="Contraseña"
              name="contrasena"
              type="password"
              value={formData.contrasena}
              onChange={handleChange}
              margin="normal"
              required
              variant="outlined"
              sx={{ mb: 1 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 1.5,
                mb: 1.5,
                py: 1.5,
                background:
                  "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                "&:hover": {
                  background:
                    "linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)",
                },
              }}
            >
              {loading ? "Iniciando sesión..." : "INICIAR SESIÓN"}
            </Button>

            {/* <Box sx={{ textAlign: "center", mb: 1.5 }}>
              <Link
                href="#"
                variant="body2"
                sx={{
                  color: "#666",
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                ¿Olvidó la contraseña?
              </Link>
            </Box> */}

            <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #eee" }}>
              <Typography
                variant="body2"
                sx={{ mb: 2, color: "#666", textAlign: "center" }}
              >
                ¿No tienes cuenta?
              </Typography>

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={() => navigate("/registrar")}
                sx={{
                  py: 1.5,
                  background:
                    "linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)",
                  "&:hover": {
                    background:
                      "linear-gradient(45deg, #388E3C 30%, #689F38 90%)",
                  },
                }}
              >
                REGISTRARSE
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

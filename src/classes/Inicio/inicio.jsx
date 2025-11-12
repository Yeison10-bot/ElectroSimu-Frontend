import * as React from "react";
import {
  Box,
  Typography,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Avatar,
  AppBar,
  Toolbar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from "@mui/material";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import apiService from "../../services/ApiService.js";
import Usuario from "../../classes/Gestion/Usuario.js";

class InicioElectroSimu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: "Inicio",
      user: null,
      isLoggedIn: false,
      openLogoutDialog: false,
      showLogoutMessage: false, // ✅ Snackbar de confirmación
    };
  }

  async componentDidMount() {
    await this.cargarUsuario();
    this.actualizarSeleccion();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location?.pathname !== this.props.location?.pathname) {
      this.actualizarSeleccion();
    }
  }

  // ========================
  // 🔐 Cargar usuario (POO)
  // ========================
  cargarUsuario = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      apiService.setToken(token);

      let user = Usuario.cargarDesdeLocal();

      if (!user) {
        user = new Usuario();
        await user.cargarPerfil();
      }

      if (user) {
        this.setState({ user, isLoggedIn: true });
      } else {
        this.setState({ user: null, isLoggedIn: false });
      }
    } catch (error) {
      console.error("❌ Error cargando usuario:", error);
      this.setState({ user: null, isLoggedIn: false });
    }
  };

  actualizarSeleccion = () => {
    const location = this.props.location || { pathname: "/" };
    let selected = "Inicio";

    if (location.pathname === "/") {
      selected = "Inicio";
    }
    else if (location.pathname.startsWith("/perfil")) {
      selected = "Perfil";
    }
    // ✅ Ahora incluye los escenarios como parte del simulador
    else if (
      location.pathname.startsWith("/ciudad") ||
      location.pathname.startsWith("/escenario")
    ) {
      selected = "Simulador";
    }
    else if (location.pathname.startsWith("/teoria")) {
      selected = "Teoría";
    }

    this.setState({ selected });
  };



  // ========================
  // 🚪 Diálogo de Logout
  // ========================
  abrirDialogoLogout = () => {
    this.setState({ openLogoutDialog: true });
  };

  cerrarDialogoLogout = () => {
    this.setState({ openLogoutDialog: false });
  };

  confirmarLogout = async () => {
    try {
      await apiService.logout?.();

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("progresoElectroSimu");

      if (typeof Usuario.eliminarDeLocal === "function") {
        Usuario.eliminarDeLocal();
      }

      this.setState({
        openLogoutDialog: false,
        showLogoutMessage: true, // ✅ Mostrar Snackbar
        user: null,
        isLoggedIn: false,
      });

      // 🔁 Redirigir después de 1 segundo
      setTimeout(() => this.props.navigate("/login"), 1200);
    } catch (error) {
      console.error("❌ Error al cerrar sesión:", error);
      alert("Error al cerrar sesión. Intenta nuevamente.");
    }
  };

  // ========================
  // 🧭 Sidebar
  // ========================
  renderSidebar = () => {
    const { selected, user } = this.state;
    const navigate = this.props.navigate;

    return (
      <Drawer
        variant="permanent"
        sx={{
          width: 220,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: 220,
            boxSizing: "border-box",
            bgcolor: "#f5f9ff",
            borderRight: "1px solid #e0e0e0",
            height: "100vh",
          },
        }}
      >
        {/* Avatar y nombre */}
        <Box
          sx={{
            textAlign: "center",
            p: 2,
            cursor: "pointer",
            transition: "all 0.3s ease",
            borderRadius: 1,
            mx: 1,
            "&:hover": {
              bgcolor: "rgba(2, 136, 209, 0.08)",
              transform: "scale(1.02)",
            },
          }}
          onClick={() => navigate("/perfil")}
        >
          <Avatar
            sx={{
              width: 70,
              height: 70,
              mx: "auto",
              mb: 1,
              bgcolor: "#90caf9",
              transition: "all 0.3s ease",
              "&:hover": {
                bgcolor: "#64b5f6",
                boxShadow: "0 4px 12px rgba(2, 136, 209, 0.3)",
              },
            }}
            src={user?.imagen_perfil || undefined}
          >
            {!user?.imagen_perfil && <PersonIcon sx={{ fontSize: 40 }} />}
          </Avatar>

          <Typography variant="subtitle1" fontWeight={600}>
            {user ? user.nombre : "Usuario"}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "#0288d1",
              fontWeight: 500,
              display: "block",
              mt: 0.5,
            }}
          >
            Ver perfil →
          </Typography>
        </Box>

        {/* Menú */}
        <List sx={{ flexGrow: 1 }}>
          {[
            { text: "Inicio", path: "/" },
            { text: "Simulador", path: "/ciudad" },
            { text: "Teoría", path: "/teoria" },
          ].map((item) => (
            <ListItemButton
              key={item.text}
              component={Link}
              to={item.path}
              selected={selected === item.text}
              sx={{
                borderRadius: 1,
                mx: 1,
                mb: 0.5,
                transition: "all 0.2s ease",
                "&.Mui-selected": {
                  bgcolor: "#0288d1",
                  color: "#fff",
                  "&:hover": {
                    bgcolor: "#0277bd",
                  },
                },
                "&:hover": {
                  bgcolor:
                    selected === item.text
                      ? "#0277bd"
                      : "rgba(2, 136, 209, 0.08)",
                },
              }}
            >
              <ListItemText primary={item.text} />
            </ListItemButton>
          ))}
        </List>

        {/* Cerrar sesión */}
        <Box sx={{ p: 2, borderTop: "1px solid #e0e0e0" }}>
          <Button
            variant="text"
            fullWidth
            startIcon={<LogoutIcon />}
            sx={{
              color: "#d32f2f",
              textTransform: "none",
              fontWeight: 500,
              "&:hover": {
                bgcolor: "rgba(211, 47, 47, 0.08)",
              },
            }}
            onClick={this.abrirDialogoLogout}
          >
            Cerrar Sesión
          </Button>
        </Box>

        {/* 🧠 Diálogo de confirmación */}
        <Dialog
          open={this.state.openLogoutDialog}
          onClose={this.cerrarDialogoLogout}
        >
          <DialogTitle>Confirmar cierre de sesión</DialogTitle>
          <DialogContent>
            <Typography>
              ¿Estás seguro de que deseas cerrar sesión y salir de tu cuenta?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.cerrarDialogoLogout} color="inherit">
              Cancelar
            </Button>
            <Button
              onClick={this.confirmarLogout}
              color="error"
              variant="contained"
            >
              Cerrar sesión
            </Button>
          </DialogActions>
        </Dialog>

        {/* ✅ Snackbar de confirmación */}
        <Snackbar
          open={this.state.showLogoutMessage}
          autoHideDuration={2000}
          onClose={() => this.setState({ showLogoutMessage: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert severity="success" sx={{ width: "100%" }}>
            Sesión cerrada correctamente 👋
          </Alert>
        </Snackbar>
      </Drawer>
    );
  };

  renderHeader = () => (
    <AppBar
      position="static"
      color="transparent"
      elevation={0}
      sx={{
        flexShrink: 0,
        borderBottom: "1px solid #e5e7eb",
        bgcolor: "white",
      }}
    >
      <Toolbar>
        <Typography
          variant="h4"
          sx={{ flexGrow: 1, fontWeight: "bold", color: "#111827" }}
        >
          ElectroSimu ⚡
        </Typography>
      </Toolbar>
    </AppBar>
  );

  render() {
    return (
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          width: "100vw",
          overflow: "hidden",
          bgcolor: "#f9fafb",
        }}
      >
        {this.renderSidebar()}
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            overflow: "hidden",
          }}
        >
          {this.renderHeader()}
          <Box
            sx={{
              flexGrow: 1,
              overflow: "hidden",
              p: 0,
              display: "flex",
              flexDirection: "column",
              bgcolor: "#f9fafb",
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </Box>
    );
  }
}

function InicioElectroSimuWrapper() {
  const location = useLocation();
  const navigate = useNavigate();
  return <InicioElectroSimu location={location} navigate={navigate} />;
}

export default InicioElectroSimuWrapper;

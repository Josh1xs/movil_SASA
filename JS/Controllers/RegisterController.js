// ===============================
// LoginController.js
// ===============================

import { login, logout, isLoggedIn, getUsuarioLogueado } from "../Services/LoginService.js";

// ===============================
// Auto-login: si ya hay sesión activa, ir al dashboard
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  if (isLoggedIn()) {
    const user = getUsuarioLogueado();
    if (user) {
      window.location.href = "../dashboard/index.html";
    }
  }
});

// ===============================
// Evento de login
// ===============================
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const correo = document.getElementById("email").value.trim();
  const contrasena = document.getElementById("password").value;
  const loginButton = document.getElementById("loginButton");
  const originalText = loginButton?.innerHTML;

  if (!correo || !contrasena) {
    Swal.fire("Campos requeridos", "Completa todos los campos", "warning");
    return;
  }

  // Estado de carga en el botón
  if (loginButton) {
    loginButton.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Verificando...`;
    loginButton.disabled = true;
  }

  try {
    const data = await login(correo, contrasena);

    if (data?.status === "OK") {
      const cliente = data.cliente;
      const nombre = cliente?.nombre || "Usuario";

      // Guardar datos en localStorage
      localStorage.setItem("userId", cliente.idCliente);
      localStorage.setItem("nombre", `${cliente.nombre} ${cliente.apellido}`);
      localStorage.setItem("correo", cliente.correo);

      Swal.fire({
        icon: "success",
        title: "¡Bienvenido!",
        text: `Bienvenido ${nombre}`,
        timer: 2000,
        showConfirmButton: false,
      }).then(() => {
        window.location.href = "../dashboard/index.html";
      });
    } else {
      Swal.fire("Error", "Credenciales inválidas", "error");
    }
  } catch (error) {
    Swal.fire(
      "Error de login",
      error.message || "Error al conectar con el servidor",
      "error"
    );
  } finally {
    if (loginButton) {
      loginButton.innerHTML = originalText || "Iniciar sesión";
      loginButton.disabled = false;
    }
  }
});

// ===============================
// Logout
// ===============================
document.getElementById("btnLogout")?.addEventListener("click", () => {
  logout();
});

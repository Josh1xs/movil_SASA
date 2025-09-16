// ===============================
// LoginController.js
// ===============================

import { login, logout, isLoggedIn, getUsuarioLogueado } from "../Services/LoginService.js";

// ------- Manejar login -------
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const correo = document.getElementById("email").value.trim();
  const contrasena = document.getElementById("password").value;

  try {
    const data = await login(correo, contrasena);

    if (data.status === "OK") {
      const cliente = data.cliente;

      // ✅ Guardar datos esenciales en localStorage
      localStorage.setItem("userId", cliente.id);  // 👈 usar id, no idCliente
      localStorage.setItem("nombre", cliente.nombre);
      localStorage.setItem("apellido", cliente.apellido);
      localStorage.setItem("correo", cliente.correo);
      localStorage.setItem("token", data.token);

      Swal.fire({
        icon: "success",
        title: "Bienvenido " + cliente.nombre,
        showConfirmButton: true,
        confirmButtonColor: "#C91A1A"
      }).then(() => {
        window.location.href = "../dashboard/index.html";
      });
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Credenciales incorrectas",
      text: error.message,
      confirmButtonColor: "#C91A1A"
    });
  }
});

// ------- Manejar logout -------
document.getElementById("btnLogout")?.addEventListener("click", () => {
  logout();
});

// ------- Mostrar usuario logueado en home -------
window.addEventListener("DOMContentLoaded", () => {
  if (isLoggedIn()) {
    const user = getUsuarioLogueado();
    if (user) {
      document.getElementById("userName").innerText =
        `${user.nombre} ${user.apellido}`;
    }
  }
});

// ===============================
// LoginController.js
// ===============================

import { login, logout, isLoggedIn, getUsuarioLogueado } from "../Services/LoginService.js";

// ------- Manejar login -------
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const correo = document.getElementById("email").value;
  const contrasena = document.getElementById("password").value;

  try {
    const data = await login(correo, contrasena);

    if (data.status === "OK") {
      // ✅ Guardar datos esenciales en localStorage
      localStorage.setItem("userId", data.cliente.idCliente);   // o data.cliente.id según backend
      localStorage.setItem("nombre", data.cliente.nombre);
      localStorage.setItem("apellido", data.cliente.apellido);
      localStorage.setItem("token", data.token);

      Swal.fire({
        icon: "success",
        title: "Bienvenido " + data.cliente.nombre,
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
    document.getElementById("userName")?.innerText ==
      `${user.nombre} ${user.apellido}`;
  }
});

import { login, logout, isLoggedIn, getUsuarioLogueado } from "../Services/LoginService.js";


document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const correo = document.getElementById("email").value.trim();
  const contrasena = document.getElementById("password").value;

  try {
    const data = await login(correo, contrasena);

    if (data.status === "OK") {
      const cliente = data.cliente;


      localStorage.setItem("userId", cliente.id); 
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


document.getElementById("btnLogout")?.addEventListener("click", () => {
  logout();
});


window.addEventListener("DOMContentLoaded", () => {
  if (isLoggedIn()) {
    const user = getUsuarioLogueado();
    if (user) {
      document.getElementById("userName").innerText =
        `${user.nombre} ${user.apellido}`;
    }
  }
});

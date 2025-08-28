import { login } from "../Services/LoginService.js";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombreUsuario = document.getElementById("email").value.trim();
  const contrasena = document.getElementById("password").value.trim();

  if (!nombreUsuario || !contrasena) {
    return Swal.fire({
      icon: "warning",
      title: "Campos vacíos",
      text: "Debes ingresar usuario y contraseña"
    });
  }

  try {
    const result = await login(nombreUsuario, contrasena);

    // Guardamos en localStorage
    localStorage.setItem("user", JSON.stringify(result.data));
    localStorage.setItem("userId", result.data.id);

    Swal.fire({
      icon: "success",
      title: "Bienvenido",
      text: `Hola ${result.data.nombreUsuario}`
    }).then(() => {
      window.location.href = "../../dashboard/index.html";
    });

  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error de autenticación",
      text: "Usuario o contraseña incorrectos"
    });
  }
});

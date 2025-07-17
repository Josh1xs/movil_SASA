// cambiar.js

document.addEventListener("DOMContentLoaded", () => {
  const boton = document.querySelector(".boton");

  boton.addEventListener("click", (e) => {
    e.preventDefault();

    const nueva = document.getElementById("nueva").value.trim();
    const confirmar = document.getElementById("confirmar").value.trim();

    if (!nueva || !confirmar) {
      Swal.fire({
        icon: "warning",
        title: "Campos vacíos",
        text: "Por favor completa ambos campos."
      });
      return;
    }

    if (nueva.length < 6) {
      Swal.fire({
        icon: "info",
        title: "Contraseña muy corta",
        text: "Debe tener al menos 6 caracteres."
      });
      return;
    }

    if (nueva !== confirmar) {
      Swal.fire({
        icon: "error",
        title: "Las contraseñas no coinciden",
        text: "Asegúrate de que ambas sean iguales."
      });
      return;
    }

    Swal.fire({
      icon: "success",
      title: "¡Contraseña cambiada!",
      text: "Ahora puedes iniciar sesión con tu nueva contraseña.",
      confirmButtonText: "Ir al login"
    }).then(() => {
      // Redireccionar al login
      window.location.href = "../Authenticator/login.html";
    });
  });
});

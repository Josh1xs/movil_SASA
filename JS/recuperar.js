
document.addEventListener("DOMContentLoaded", () => {
  const boton = document.querySelector(".boton");

  boton.addEventListener("click", (e) => {
    e.preventDefault();

    const correo = document.getElementById("email").value.trim();

    if (correo === "") {
      Swal.fire({
        icon: "error",
        title: "Campo vacío",
        text: "Por favor ingresa tu correo electrónico."
      });
    } else {
      Swal.fire({
        icon: "success",
        title: "¡Correo enviado!",
        text: `Se ha enviado un código de recuperación a ${correo}.`,
        confirmButtonText: "Continuar"
      }).then(() => {
        // Redireccionar al apartado de verificación
        window.location.href = "../Authenticator/codigo.html";
      });
    }
  });
});
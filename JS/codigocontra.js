document.addEventListener("DOMContentLoaded", () => {
  const correo = localStorage.getItem("correoVerificacion");
  const codigoCorrecto = localStorage.getItem("codigoVerificacion");

  const correoDestino = document.getElementById("correoDestino");
  const form = document.getElementById("codigoForm");

  if (correoDestino) correoDestino.textContent = correo || "No disponible";

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const ingresado = document.getElementById("codigo").value.trim();

    if (!ingresado) {
      Swal.fire("Campo vacío", "Ingresa el código que recibiste", "warning");
      return;
    }

    if (ingresado === codigoCorrecto) {
      Swal.fire({
        icon: "success",
        title: "Código verificado",
        text: "Tu cuenta ha sido validada correctamente.",
        confirmButtonText: "Continuar"
      }).then(() => {
        localStorage.removeItem("codigoVerificacion");
        window.location.href = "../dashboard/index.html"; 
      });
    } else {
      Swal.fire("Código incorrecto", "El código ingresado no coincide", "error");
    }
  });
});

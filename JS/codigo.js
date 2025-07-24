// codigo.js

// Código de verificación de ejemplo (en un caso real, esto vendría del backend)
const codigoCorrecto = "123456";

// Agregar SweetAlert2
const script = document.createElement("script");
script.src = "https://cdn.jsdelivr.net/npm/sweetalert2@11";
document.head.appendChild(script);

document.getElementById('verificationForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const codigoIngresado = document.getElementById('code').value.trim();

  if (codigoIngresado === codigoCorrecto) {
    Swal.fire({
      icon: 'success',
      title: 'Código correcto',
      text: 'Verificación completada con éxito',
      confirmButtonText: 'Continuar'
    }).then(() => {
      window.location.href = 'login.html';
    });
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Código incorrecto',
      text: 'Por favor, verifique el código ingresado.'
    });
  }
});

// Reenvío simulado del código
document.querySelector('.resend-link a').addEventListener('click', function(e) {
  e.preventDefault();

  Swal.fire({
    icon: 'info',
    title: 'Código reenviado',
    text: 'Se ha reenviado un nuevo código a su correo electrónico.'
  });

  // Aquí podrías hacer una llamada a la API para reenviar el código
});

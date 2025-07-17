// login.js

// Usuario de ejemplo (puedes reemplazar esto por un fetch a una API)
const usuariosValidos = [
  {
    email: "cliente@sasa.com",
    password: "1234"
  },
  {
    email: "usuario@sasa.com",
    password: "password"
  }
];

document.getElementById('loginForm').addEventListener('submit', function (e) {
  e.preventDefault(); // Evita que se recargue la página

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  // Busca si existe un usuario válido
  const usuarioEncontrado = usuariosValidos.find(user => user.email === email && user.password === password);

  if (usuarioEncontrado) {
    Swal.fire({
      icon: 'success',
      title: '¡Bienvenido!',
      text: 'Inicio de sesión exitoso',
      confirmButtonText: 'Continuar'
    }).then(() => {
      window.location.href = '../dashboard/index.html';
    });
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Error de autenticación',
      text: 'Correo o contraseña incorrectos'
    });
  }
});

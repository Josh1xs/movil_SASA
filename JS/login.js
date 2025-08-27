document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  console.log("Correo ingresado:", email);
  console.log("Contraseña ingresada:", password);

  try {
    const res = await fetch('https://retoolapi.dev/DeaUI0/registro'); 
    if (!res.ok) throw new Error('API sin respuesta');

    const usuarios = await res.json();
    console.log("Usuarios desde la API:", usuarios);

    const usuarioEncontrado = usuarios.find(user =>
      user.correo === email && user.contrasena === password
    );

    console.log("Usuario encontrado:", usuarioEncontrado);

    if (usuarioEncontrado) {

      localStorage.setItem("userId", usuarioEncontrado.id);

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

  } catch (error) {
    console.error('Error en login:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error del servidor',
      text: 'No se pudo establecer conexión con el servidor'
    });
  }
});

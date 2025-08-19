document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  const duiInput = form.dui;
  const passwordInput = form.password;

  const charCount = document.getElementById("charCount");
  const hasLetter = document.getElementById("hasLetter");
  const hasNumber = document.getElementById("hasNumber");
  const hasSpecial = document.getElementById("hasSpecial");

  // DUI con guion automático
  duiInput.addEventListener("input", () => {
    let value = duiInput.value.replace(/[^\d]/g, "");
    if (value.length > 8) {
      value = value.slice(0, 8) + "-" + value.slice(8, 9);
    }
    duiInput.value = value;
  });

  // Validación visual contraseña
  passwordInput.addEventListener("input", () => {
    const value = passwordInput.value;

    charCount.className = value.length >= 8 ? "valid" : "invalid";
    hasLetter.className = /[A-Za-z]/.test(value) ? "valid" : "invalid";
    hasNumber.className = /\d/.test(value) ? "valid" : "invalid";
    hasSpecial.className = /[@$!%*#?&.]/.test(value) ? "valid" : "invalid";
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = form.nombre.value.trim();
    const apellido = form.apellido.value.trim();
    const dui = form.dui.value.trim();
    const fechaNacimiento = form.fechaNacimiento.value;
    const genero = form.genero.value;
    const correo = form.correo.value.trim();
    const password = form.password.value;

    // Validar DUI
    if (!/^\d{8}-\d{1}$/.test(dui)) {
      Swal.fire("Error", "El DUI debe tener el formato 12345678-9", "warning");
      return;
    }

    // Validar edad (+18)
    const hoy = new Date();
    const fechaNac = new Date(fechaNacimiento);
    const edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();
    const dia = hoy.getDate() - fechaNac.getDate();
    const esMayor = edad > 18 || (edad === 18 && (mes > 0 || (mes === 0 && dia >= 0)));
    if (!esMayor) {
      Swal.fire("Error", "Debes tener más de 18 años para registrarte", "warning");
      return;
    }

    // Validar correo
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      Swal.fire("Error", "Ingresa un correo electrónico válido", "warning");
      return;
    }

    // Validar contraseña fuerte
    if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&.])[A-Za-z\d@$!%*#?&.]{8,}$/.test(password)) {
      Swal.fire("Error", "La contraseña debe tener al menos 8 caracteres, con letra, número y símbolo", "warning");
      return;
    }

    try {
      // Revisar si correo existe
      const checkResponse = await fetch("https://retoolapi.dev/DeaUI0/registro");
      const usuarios = await checkResponse.json();
      if (usuarios.some(u => u.correo?.toLowerCase() === correo.toLowerCase())) {
        Swal.fire("Error", "Ese correo ya está registrado", "warning");
        return;
      }

      // Registrar usuario
      const data = { nombre, apellido, dui, fechaNacimiento, genero, correo, contrasena: password };
      const response = await fetch("https://retoolapi.dev/DeaUI0/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Registro exitoso",
          text: "Tu cuenta ha sido creada con éxito",
          confirmButtonText: "Iniciar sesión"
        }).then(() => {
          window.location.href = "login.html";
        });
      } else {
        Swal.fire("Error", "Hubo un problema al registrar", "error");
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo conectar con el servidor", "error");
    }
  });
});

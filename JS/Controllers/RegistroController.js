import {getUsuarios, createUsuario} from "../Services/RegistroService.js"

function parseResponse(apiResponse) {
  if (Array.isArray(apiResponse)) return apiResponse;
  if (apiResponse.data?.content) return apiResponse.data.content;
  if (apiResponse.content) return apiResponse.content;
  if (apiResponse.data) return apiResponse.data;
  return [];
}

let usuariosCache = [];

async function loadUsuarios() {
    try {
        const usuarios = await getUsuarios();
        usuariosCache = usuarios;
    } catch (e) {
        console.error("Error al cargar usuarios:", e);
        usuariosCache = [];
    }
}

loadUsuarios();

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  const duiInput = form.dui;
  const passwordInput = form.password;

  const charCount = document.getElementById("charCount");
  const hasLetter = document.getElementById("hasLetter");
  const hasNumber = document.getElementById("hasNumber");
  const hasSpecial = document.getElementById("hasSpecial");


  duiInput.addEventListener("input", () => {
    let value = duiInput.value.replace(/[^\d]/g, "");
    if (value.length > 8) {
      value = value.slice(0, 8) + '-' + value.slice(8, 9);
    }
    duiInput.value = value;
  });


  passwordInput.addEventListener("input", () => {
    const value = passwordInput.value;

    const lengthValid = value.length >= 8;
    const letterValid = /[A-Za-z]/.test(value);
    const numberValid = /\d/.test(value);
    const specialValid = /[@$!%*#?&.]/.test(value);

    charCount.className = lengthValid ? "valid" : "invalid";
    hasLetter.className = letterValid ? "valid" : "invalid";
    hasNumber.className = numberValid ? "valid" : "invalid";
    hasSpecial.className = specialValid ? "valid" : "invalid";
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

  
    const duiRegex = /^\d{8}-\d{1}$/;
    if (!duiRegex.test(dui)) {
      Swal.fire("Error", "El DUI debe tener el formato 12345678-9", "warning");
      return;
    }

   
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

   
    const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!correoRegex.test(correo)) {
      Swal.fire("Error", "Ingresa un correo electrónico válido", "warning");
      return;
    }

  
    const passRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&.])[A-Za-z\d@$!%*#?&.]{8,}$/;
    if (!passRegex.test(password)) {
      Swal.fire(
        "Error",
        "La contraseña debe tener al menos 8 caracteres, incluyendo una letra, un número y un carácter especial",
        "warning"
      );
      return;
    }

    try {
     
      if (!usuariosCache.length) {
        usuariosCache = await getUsuarios();
      }

      const correoExiste = usuariosCache.some(u => u.correo?.toLowerCase() === correo.toLowerCase());
      const duiExiste = usuariosCache.some(u => (u.dui ?? u.DUI ?? u.documento) === dui);

      if (correoExiste) {
        return Swal.fire("Error", "Ese correo ya está registrado", "warning");
      }

      if (duiExiste) {
        return Swal.fire("Error", "Ese DUI ya está registrado", "warning");
      }

      const data = {
        nombre,
        apellido,
        dui,
        fechaNacimiento,
        genero,
        correo,
        contrasena: password
      };

      const response = await createUsuario(data);

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
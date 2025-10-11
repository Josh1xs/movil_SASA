import {
  registrarCliente,
  nameValid,
  validEmail,
  isAdult,
  validDUI,
  passwordStrength,
} from "../Services/RegistroService.js";

document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre       = document.getElementById("nombre").value.trim();
  const apellido     = document.getElementById("apellido").value.trim();
  const dui          = document.getElementById("dui").value.trim();
  const fechaNac     = document.getElementById("fechaNacimiento").value;
  const genero       = document.getElementById("genero").value;
  const correo       = document.getElementById("correo").value.trim();
  const contrasena   = document.getElementById("password").value;
  const btnRegistrar = document.getElementById("btnRegistrar");


  if (!nameValid(nombre) || !nameValid(apellido)) {
    Swal.fire("Error", "Nombre o apellido inválido", "warning");
    return;
  }

  if (!validDUI(dui)) {
    Swal.fire("Error", "El DUI debe tener el formato ########-#", "warning");
    return;
  }

  if (!validEmail(correo)) {
    Swal.fire("Error", "Correo electrónico inválido", "warning");
    return;
  }

  if (!isAdult(fechaNac)) {
    Swal.fire("Error", "Debes ser mayor de 18 años", "warning");
    return;
  }

  if (!genero) {
    Swal.fire("Error", "Selecciona tu género", "warning");
    return;
  }

  const fuerza = passwordStrength(contrasena);
  if (fuerza === "Baja") {
    Swal.fire("Error", "La contraseña es demasiado débil", "warning");
    return;
  }

  const originalText = btnRegistrar.innerHTML;
  btnRegistrar.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Registrando...`;
  btnRegistrar.disabled = true;

  try {
    const data = await registrarCliente({
      nombre,
      apellido,
      dui,
      fechaNacimiento: fechaNac,
      genero,
      correo,
      contrasena,
    });

    if (data?.status === "OK") {
      Swal.fire({
        icon: "success",
        title: "Registro exitoso",
        text: "Ahora puedes iniciar sesión",
        confirmButtonColor: "#C91A1A",
      }).then(() => {
        window.location.href = "./login.html";
      });
    } else {
      Swal.fire("Error", data?.message || "No se pudo registrar", "error");
    }
  } catch (err) {
    Swal.fire("Error", err.message || "Error en el servidor", "error");
  } finally {
    btnRegistrar.innerHTML = originalText;
    btnRegistrar.disabled = false;
  }
});

const passwordInput = document.getElementById("password");
const passMeter     = document.getElementById("passMeter");
const passStrengthLabel = document.getElementById("passStrengthLabel");

passwordInput?.addEventListener("input", () => {
  const fuerza = passwordStrength(passwordInput.value);

 
  passStrengthLabel.textContent = `Fuerza: ${fuerza}`;
  passStrengthLabel.style.color =
    fuerza === "Alta" ? "green" : fuerza === "Media" ? "orange" : "red";


  if (fuerza === "Baja") {
    passMeter.style.width = "33%";
    passMeter.style.background = "red";
  } else if (fuerza === "Media") {
    passMeter.style.width = "66%";
    passMeter.style.background = "orange";
  } else if (fuerza === "Alta") {
    passMeter.style.width = "100%";
    passMeter.style.background = "green";
  } else {
    passMeter.style.width = "0";
  }
});


const togglePwd = document.getElementById("togglePwd");
togglePwd?.addEventListener("click", () => {
  const type = passwordInput.type === "password" ? "text" : "password";
  passwordInput.type = type;
  togglePwd.innerHTML =
    type === "password"
      ? `<i class="fa-regular fa-eye"></i>`
      : `<i class="fa-regular fa-eye-slash"></i>`;
});

const duiInput = document.getElementById("dui");

duiInput?.addEventListener("input", () => {
  let val = duiInput.value.replace(/\D/g, ""); 
  if (val.length > 9) val = val.slice(0, 9);  
  if (val.length > 8) {
    val = val.slice(0, 8) + "-" + val.slice(8);
  }
  duiInput.value = val;
});

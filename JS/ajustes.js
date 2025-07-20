document.addEventListener("DOMContentLoaded", async () => {
  const userId = localStorage.getItem("userId");
  const apiUrl = `https://retoolapi.dev/DeaUI0/registro/${userId}`;

  // Mostrar ID
  document.getElementById("userId").textContent = userId || "Desconocido";
  document.getElementById("menuUserId").textContent = userId || "Desconocido";

  let userData = {};

  // Obtener datos del usuario
  try {
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error("Usuario no encontrado");

    userData = await res.json();

    document.getElementById("nombreCompleto").textContent = `${userData.nombre} ${userData.apellido}`;
    document.getElementById("rolUsuario").textContent = "Cliente";
    document.getElementById("menuNombre").textContent = `${userData.nombre} ${userData.apellido}`;
    document.getElementById("menuRol").textContent = "Cliente";
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    document.getElementById("nombreCompleto").textContent = "Usuario no encontrado";
  }

  // Mostrar formularios
  document.querySelector(".toggle-nombre").addEventListener("click", () => {
    document.querySelector(".toggle-nombre").style.display = "none";
    document.querySelector(".form-nombre").style.display = "block";
  });

  document.querySelector(".toggle-pass").addEventListener("click", () => {
    document.querySelector(".toggle-pass").style.display = "none";
    document.querySelector(".form-pass").style.display = "block";
  });

  // Guardar nuevo nombre
  document.getElementById("guardarNombre").addEventListener("click", async () => {
    const nuevoNombre = document.getElementById("nuevoNombre").value.trim();
    if (!nuevoNombre.includes(" ")) {
      Swal.fire("Nombre incompleto", "Ingresa nombre y apellido", "warning");
      return;
    }

    const [nombre, ...resto] = nuevoNombre.split(" ");
    const apellido = resto.join(" ");

    try {
      const res = await fetch(apiUrl, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, apellido })
      });

      if (res.ok) {
        Swal.fire("Éxito", "Nombre actualizado", "success").then(() => location.reload());
      } else {
        throw new Error();
      }
    } catch {
      Swal.fire("Error", "No se pudo actualizar el nombre", "error");
    }
  });

  // Guardar nueva contraseña
  document.getElementById("guardarPass").addEventListener("click", async () => {
    const nuevaPass = document.getElementById("nuevaPass").value.trim();

    const passRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&.])[A-Za-z\d@$!%*#?&.]{8,}$/;
    if (!passRegex.test(nuevaPass)) {
      Swal.fire("Contraseña insegura", "Debe tener al menos 8 caracteres, una letra, un número y un carácter especial", "warning");
      return;
    }

    try {
      const res = await fetch(apiUrl, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contrasena: nuevaPass })
      });

      if (res.ok) {
        Swal.fire("Éxito", "Contraseña actualizada", "success").then(() => location.reload());
      } else {
        throw new Error();
      }
    } catch {
      Swal.fire("Error", "No se pudo actualizar la contraseña", "error");
    }
  });

  // Menú lateral
  document.getElementById("menuToggle").addEventListener("click", () => {
    document.getElementById("profileMenu").classList.add("open");
    document.getElementById("overlay").classList.add("show");
  });

  document.getElementById("closeMenu").addEventListener("click", cerrarMenu);
  document.getElementById("overlay").addEventListener("click", cerrarMenu);

  function cerrarMenu() {
    document.getElementById("profileMenu").classList.remove("open");
    document.getElementById("overlay").classList.remove("show");
  }

  // Cerrar sesión
  document.querySelector(".cerrar-sesion").addEventListener("click", () => {
    Swal.fire({
      title: "¿Cerrar sesión?",
      text: "Tu sesión actual se cerrará",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Cancelar"
    }).then(result => {
      if (result.isConfirmed) {
        localStorage.clear();
        window.location.href = "../dashboard/Bienvenida.html";
      }
    });
  });
});

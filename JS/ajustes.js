document.addEventListener("DOMContentLoaded", async () => {
  const userId = localStorage.getItem("userId");
  const apiUrl = `https://retoolapi.dev/DeaUI0/registro/${userId}`;

  // Nodos
  const $ = (s) => document.querySelector(s);
  const nombreCompleto = $("#nombreCompleto");
  const rolUsuario     = $("#rolUsuario");
  const userIdEl       = $("#userId");
  const menuUserId     = $("#menuUserId");
  const menuNombre     = $("#menuNombre");
  const menuRol        = $("#menuRol");

  const overlay    = $("#overlay");
  const profileMenu= $("#profileMenu");
  const menuToggle = $("#menuToggle");
  const closeMenu  = $("#closeMenu");
  const logoutBtn  = $("#logoutBtn");

  // Guardas
  if (userIdEl)  userIdEl.textContent  = userId || "Desconocido";
  if (menuUserId)menuUserId.textContent= userId || "Desconocido";

  // Carga de usuario
  try {
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error("Usuario no encontrado");
    const u = await res.json();

    const nombre = `${u?.nombre ?? ""} ${u?.apellido ?? ""}`.trim() || "Usuario";
    nombreCompleto && (nombreCompleto.textContent = nombre);
    rolUsuario     && (rolUsuario.textContent     = "Cliente");
    menuNombre     && (menuNombre.textContent     = nombre);
    menuRol        && (menuRol.textContent        = "Cliente");
  } catch (e) {
    console.warn(e);
    nombreCompleto && (nombreCompleto.textContent = "Usuario no encontrado");
  }

  // Mostrar/Ocultar formularios
  $(".toggle-nombre")?.addEventListener("click", () => {
    $(".toggle-nombre").setAttribute("hidden", "hidden");
    $(".form-nombre").removeAttribute("hidden");
  });
  $(".toggle-pass")?.addEventListener("click", () => {
    $(".toggle-pass").setAttribute("hidden", "hidden");
    $(".form-pass").removeAttribute("hidden");
  });

  // Guardar nombre
  $("#guardarNombre")?.addEventListener("click", async () => {
    const value = ($("#nuevoNombre")?.value || "").trim();
    if (!value.includes(" ")) {
      return Swal.fire("Nombre incompleto", "Ingresa nombre y apellido", "warning");
    }
    const [nombre, ...resto] = value.split(" ");
    const apellido = resto.join(" ");
    try {
      const r = await fetch(apiUrl, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, apellido })
      });
      if (!r.ok) throw new Error();
      Swal.fire("Éxito", "Nombre actualizado", "success").then(() => location.reload());
    } catch {
      Swal.fire("Error", "No se pudo actualizar el nombre", "error");
    }
  });

  // Guardar contraseña
  $("#guardarPass")?.addEventListener("click", async () => {
    const pass = ($("#nuevaPass")?.value || "").trim();
    const passRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&.])[A-Za-z\d@$!%*#?&.]{8,}$/;
    if (!passRegex.test(pass)) {
      return Swal.fire("Contraseña insegura",
        "Debe tener al menos 8 caracteres, una letra, un número y un carácter especial", "warning");
    }
    try {
      const r = await fetch(apiUrl, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contrasena: pass })
      });
      if (!r.ok) throw new Error();
      Swal.fire("Éxito", "Contraseña actualizada", "success").then(() => location.reload());
    } catch {
      Swal.fire("Error", "No se pudo actualizar la contraseña", "error");
    }
  });

  // Sidebar
  function abrir(){ profileMenu?.classList.add("open"); overlay?.classList.add("show"); }
  function cerrar(){ profileMenu?.classList.remove("open"); overlay?.classList.remove("show"); }
  menuToggle?.addEventListener("click", abrir);
  closeMenu?.addEventListener("click", cerrar);
  overlay?.addEventListener("click", cerrar);
  window.addEventListener("keydown", (e)=> e.key==="Escape" && cerrar());

  // Logout
  logoutBtn?.addEventListener("click", async (e) => {
    e.preventDefault();
    const ok = await Swal.fire({
      title:"¿Cerrar sesión?", text:"Tu sesión actual se cerrará",
      icon:"warning", showCancelButton:true, confirmButtonText:"Sí, salir",
      cancelButtonText:"Cancelar", confirmButtonColor:"#c91a1a"
    });
    if (ok.isConfirmed){
      try { /* invalidación opcional */ } catch {}
      finally {
        localStorage.clear(); sessionStorage.clear();
        document.cookie = "authToken=; Max-Age=0; path=/";
        location.replace("../Authenticator/login.html");
      }
    }
  });
});

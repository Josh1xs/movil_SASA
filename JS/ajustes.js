document.addEventListener("DOMContentLoaded", () => {
  // ---------- Helpers ----------
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const userId = localStorage.getItem("userId") || "";
  const apiUrl = userId ? `https://retoolapi.dev/DeaUI0/registro/${encodeURIComponent(userId)}` : null;

  const els = {
    // encabezado / ficha
    userId: $("#userId"),
    menuUserId: $("#menuUserId"),
    nombreCompleto: $("#nombreCompleto"),
    rolUsuario: $("#rolUsuario"),
    menuNombre: $("#menuNombre"),
    menuRol: $("#menuRol"),
    // formularios
    toggleNombre: $(".toggle-nombre"),
    formNombre: $(".form-nombre"),
    nuevoNombre: $("#nuevoNombre"),
    guardarNombre: $("#guardarNombre"),
    togglePass: $(".toggle-pass"),
    formPass: $(".form-pass"),
    nuevaPass: $("#nuevaPass"),
    guardarPass: $("#guardarPass"),
    // menú lateral
    overlay: $("#overlay"),
    profileMenu: $("#profileMenu"),
    menuToggleTop: $("#menuToggle"),
    menuToggleBottom: $("#menuToggleBottom"),
    closeMenu: $("#closeMenu"),
    // acciones
    btnLogout: $(".cerrar-sesion"),
    // tabbar
    tabbarBtns: $$(".tabbar__btn, .mobile-nav__link")
  };

  // Mostrar IDs desde el inicio
  if (els.userId) els.userId.textContent = userId || "Desconocido";
  if (els.menuUserId) els.menuUserId.textContent = userId || "Desconocido";

  // ---------- Carga de usuario ----------
  (async function loadUser() {
    try {
      if (!apiUrl) throw new Error("Usuario no autenticado");
      const res = await fetch(apiUrl, { cache: "no-store" });
      if (!res.ok) throw new Error("Usuario no encontrado");
      const u = await res.json();

      // Texto visible
      const nombre = [u.nombre, u.apellido].filter(Boolean).join(" ").trim() || "Usuario";
      els.nombreCompleto && (els.nombreCompleto.textContent = nombre);
      els.rolUsuario && (els.rolUsuario.textContent = "Cliente");
      els.menuNombre && (els.menuNombre.textContent = nombre);
      els.menuRol && (els.menuRol.textContent = "Cliente");
    } catch (err) {
      console.error("[Ajustes] Error al obtener usuario:", err);
      els.nombreCompleto && (els.nombreCompleto.textContent = "Usuario no encontrado");
    }
  })();

  // ---------- Mostrar/ocultar secciones de edición ----------
  const show = (el) => el && (el.style.display = "block");
  const hide = (el) => el && (el.style.display = "none");

  els.toggleNombre?.addEventListener("click", () => {
    hide(els.toggleNombre);
    show(els.formNombre);
    els.nuevoNombre?.focus();
  });

  els.togglePass?.addEventListener("click", () => {
    hide(els.togglePass);
    show(els.formPass);
    els.nuevaPass?.focus();
  });

  // ---------- Guardar nuevo nombre ----------
  els.guardarNombre?.addEventListener("click", async () => {
    const full = (els.nuevoNombre?.value || "")
      .replace(/\s+/g, " ")
      .trim();

    if (!full || full.split(" ").length < 2) {
      return Swal.fire("Nombre incompleto", "Ingresa nombre y apellido.", "warning");
    }

    const [nombre, ...resto] = full.split(" ");
    const apellido = resto.join(" ");

    try {
      if (!apiUrl) throw new Error("No hay sesión");
      const res = await fetch(apiUrl, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, apellido })
      });
      if (!res.ok) throw new Error("PATCH falló");
      await Swal.fire("Éxito", "Nombre actualizado", "success");
      location.reload();
    } catch (e) {
      console.error(e);
      Swal.fire("Error", "No se pudo actualizar el nombre.", "error");
    }
  });

  // ---------- Guardar nueva contraseña ----------
  els.guardarPass?.addEventListener("click", async () => {
    const pass = (els.nuevaPass?.value || "").trim();
    const passRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&.])[A-Za-z\d@$!%*#?&.]{8,}$/;

    if (!passRegex.test(pass)) {
      return Swal.fire(
        "Contraseña insegura",
        "Debe tener mínimo 8 caracteres, una letra, un número y un carácter especial.",
        "warning"
      );
    }

    try {
      if (!apiUrl) throw new Error("No hay sesión");
      const res = await fetch(apiUrl, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contrasena: pass })
      });
      if (!res.ok) throw new Error("PATCH falló");
      await Swal.fire("Éxito", "Contraseña actualizada", "success");
      location.reload();
    } catch (e) {
      console.error(e);
      Swal.fire("Error", "No se pudo actualizar la contraseña.", "error");
    }
  });

  // ---------- Menú lateral ----------
  function openMenu() {
    els.profileMenu?.classList.add("open");
    els.overlay?.classList.add("show");
  }
  function closeMenu() {
    els.profileMenu?.classList.remove("open");
    els.overlay?.classList.remove("show");
  }

  els.menuToggleTop?.addEventListener("click", openMenu);
  els.menuToggleBottom?.addEventListener("click", openMenu);
  els.closeMenu?.addEventListener("click", closeMenu);
  els.overlay?.addEventListener("click", closeMenu);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  // ---------- Cerrar sesión ----------
  els.btnLogout?.addEventListener("click", () => {
    Swal.fire({
      title: "¿Cerrar sesión?",
      text: "Tu sesión actual se cerrará.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Cancelar"
    }).then((r) => {
      if (r.isConfirmed) {
        localStorage.clear();
        window.location.href = "../Authenticator/login.html";
      }
    });
  });

  // ---------- Activar icono de la tabbar según la página ----------
  const here = location.pathname.split("/").pop();
  els.tabbarBtns.forEach((btn) => {
    const href = btn.getAttribute("href");
    if (!href) return;
    if (here && href.endsWith(here)) {
      btn.classList.add("active");
      btn.setAttribute("aria-current", "page");
    }
  });
});

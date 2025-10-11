// ===============================
// ajustes.js (Producción Heroku ✅)
// ===============================
import { getUserId, getToken, getUsuarioLogueado } from "../JS/Services/LoginService.js";

document.addEventListener("DOMContentLoaded", async () => {
  const $ = (s) => document.querySelector(s);

  // =============================== 
  // DATOS DE SESIÓN
  // ===============================
  const userId = getUserId();
  const token  = getToken();

  if (!userId || !token) {
    Swal.fire("Sesión requerida", "Debes iniciar sesión nuevamente", "warning")
      .then(() => location.replace("../Autenticacion/login.html"));
    return;
  }

  // =============================== 
  // API BASE fija (Heroku)
  // ===============================
  const API_BASE  = "https://sasaapi-73d5de493985.herokuapp.com";
  const apiUrl    = `${API_BASE}/apiCliente/${userId}`;
  const apiPatch  = `${API_BASE}/apiCliente/actualizar-parcial/${userId}`;

  // =============================== 
  // ELEMENTOS DEL DOM
  // ===============================
  const nombreCompleto = $("#nombreCompleto");
  const rolUsuario     = $("#rolUsuario");
  const userIdEl       = $("#userId");
  const menuUserId     = $("#menuUserId");
  const menuNombre     = $("#menuNombre");
  const menuRol        = $("#menuRol");
  const userInitials   = $("#userInitials");

  const overlay      = $("#overlay");
  const profileMenu  = $("#profileMenu");
  const menuToggle   = $("#menuToggle");
  const closeMenu    = $("#closeMenu");

  const toggleNombre     = $(".toggle-nombre");
  const formNombre       = $(".form-nombre");
  const inputNombre      = $("#nuevoNombre");
  const hintNombre       = $("#hintNombre");
  const btnGuardarNombre = $("#guardarNombre");

  const togglePass     = $(".toggle-pass");
  const formPass       = $(".form-pass");
  const inputPass      = $("#nuevaPass");
  const inputPass2     = $("#repitePass");
  const passMeter      = $("#passMeter");
  const btnGuardarPass = $("#guardarPass");

  if (userIdEl)   userIdEl.textContent   = userId || "—";
  if (menuUserId) menuUserId.textContent = userId || "—";

  // =============================== 
  // HELPERS
  // ===============================
  function normalizarNombre(v) {
    return v.normalize("NFKC").replace(/\s+/g, " ").trim();
  }

  function validarNombre(v) {
    if (!v) return false;
    const full = normalizarNombre(v);
    if (!full.includes(" ")) return false;
    if (full.length < 5) return false;
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/.test(full)) return false;
    return true;
  }

  function scorePass(p) {
    let s = 0;
    if (p.length >= 8) s++;
    if (/[a-z]/.test(p)) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/\d/.test(p)) s++;
    if (/[@$!%*#?&._-]/.test(p)) s++;
    return s;
  }

  function setMeter(p) {
    const s = scorePass(p);
    const w = [0, 20, 40, 60, 80, 100][s];
    passMeter.style.width = w + "%";
    passMeter.style.background =
      s <= 2 ? "#ef4444" : s <= 4 ? "#f59e0b" : "#16a34a";
  }

  function setSaving(btn, saving, labelIdle, labelSaving) {
    if (!btn) return;
    if (saving) {
      btn.setAttribute("disabled", "disabled");
      btn.dataset.labelIdle = labelIdle;
      btn.textContent = labelSaving;
    } else {
      btn.removeAttribute("disabled");
      btn.textContent = labelIdle || btn.dataset.labelIdle || "Guardar";
    }
  }

  function initialsFromName(n) {
    const parts = n.split(" ").filter(Boolean);
    if (parts.length === 0) return "U";
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || "U";
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  // =============================== 
  // CARGAR USUARIO
  // ===============================
  async function cargarUsuario() {
    try {
      const res = await fetch(apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let u = null;
      if (res.ok) u = await res.json();

      const localUser = getUsuarioLogueado();
      const nombre = `${u?.nombre ?? localUser?.nombre ?? ""} ${u?.apellido ?? localUser?.apellido ?? ""}`.trim() || "Usuario";
      const rol    = localUser?.rol || "Cliente";

      if (nombreCompleto) nombreCompleto.textContent = nombre;
      if (menuNombre)     menuNombre.textContent     = nombre;
      if (rolUsuario)     rolUsuario.textContent     = rol;
      if (menuRol)        menuRol.textContent        = rol;
      if (userInitials)   userInitials.textContent   = initialsFromName(nombre);

    } catch (err) {
      console.error("Error cargar usuario:", err);

      const localUser = getUsuarioLogueado();
      const nombre = `${localUser?.nombre ?? ""} ${localUser?.apellido ?? ""}`.trim() || "Usuario";
      const rol    = localUser?.rol || "Cliente";

      if (nombreCompleto) nombreCompleto.textContent = nombre;
      if (menuNombre)     menuNombre.textContent     = nombre;
      if (rolUsuario)     rolUsuario.textContent     = rol;
      if (menuRol)        menuRol.textContent        = rol;
      if (userInitials)   userInitials.textContent   = initialsFromName(nombre);
    }
  }

  // =============================== 
  // MENU PERFIL
  // ===============================
  function abrir()  { profileMenu?.classList.add("open"); overlay?.classList.add("show"); }
  function cerrar() { profileMenu?.classList.remove("open"); overlay?.classList.remove("show"); }

  menuToggle?.addEventListener("click", abrir);
  closeMenu?.addEventListener("click", cerrar);
  overlay?.addEventListener("click", cerrar);
  window.addEventListener("keydown", (e) => e.key === "Escape" && cerrar());

  // =============================== 
  // CAMBIO DE NOMBRE
  // ===============================
  toggleNombre?.addEventListener("click", () => {
    toggleNombre.setAttribute("hidden", "hidden");
    formNombre.removeAttribute("hidden");
    inputNombre.focus();
  });

  inputNombre?.addEventListener("input", () => {
    const ok = validarNombre(inputNombre.value);
    inputNombre.classList.toggle("invalid", !ok);
    hintNombre.style.color = ok ? "#6b7280" : "#b3261e";
  });

  btnGuardarNombre?.addEventListener("click", async () => {
    const val = normalizarNombre(inputNombre.value);
    const ok = validarNombre(val);
    inputNombre.classList.toggle("invalid", !ok);
    if (!ok) {
      Swal.fire("Nombre inválido", "Ingresa nombre y apellido válidos", "warning");
      return;
    }

    const confirm = await Swal.fire({
      icon: "question",
      title: "Confirmar cambio de nombre",
      html: `<div style="text-align:left">Nuevo nombre:<br><strong>${val}</strong></div>`,
      showCancelButton: true,
      confirmButtonText: "Confirmar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#c91a1a",
    });
    if (!confirm.isConfirmed) return;

    const [nombre, ...rest] = val.split(" ");
    const apellido = rest.join(" ").trim();

    try {
      setSaving(btnGuardarNombre, true, "Guardar cambios", "Guardando…");
      const r = await fetch(apiPatch, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nombre, apellido }),
      });

      if (!r.ok) throw new Error();

      const user = getUsuarioLogueado();
      if (user) {
        user.nombre = nombre;
        user.apellido = apellido;
        localStorage.setItem("user", JSON.stringify(user));
      }

      await Swal.fire({ icon: "success", title: "Nombre actualizado" });
      location.reload();
    } catch {
      Swal.fire("Error", "No se pudo actualizar el nombre", "error");
    } finally {
      setSaving(btnGuardarNombre, false, "Guardar cambios");
    }
  });

  // =============================== 
  // CAMBIO DE CONTRASEÑA
  // ===============================
  togglePass?.addEventListener("click", () => {
    togglePass.setAttribute("hidden", "hidden");
    formPass.removeAttribute("hidden");
    inputPass.focus();
  });

  inputPass?.addEventListener("input", () => setMeter(inputPass.value));
  inputPass2?.addEventListener("input", () => {
    inputPass2.classList.toggle("invalid", inputPass2.value !== inputPass.value);
  });

  btnGuardarPass?.addEventListener("click", async () => {
    const p  = inputPass.value.trim();
    const p2 = inputPass2.value.trim();
    const ok = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&._-]).{8,}$/.test(p);
    inputPass.classList.toggle("invalid", !ok);
    inputPass2.classList.toggle("invalid", p !== p2 || !p2);

    if (!ok) {
      Swal.fire("Contraseña insegura", "Debe tener mínimo 8 caracteres, mayúscula, número y símbolo", "warning");
      return;
    }
    if (p !== p2) {
      Swal.fire("No coincide", "Las contraseñas no coinciden", "warning");
      return;
    }

    try {
      setSaving(btnGuardarPass, true, "Guardar cambios", "Guardando…");
      const r = await fetch(apiPatch, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ contrasena: p }),
      });

      if (!r.ok) throw new Error();

      const user = getUsuarioLogueado();
      if (user) {
        user.contrasena = p;
        localStorage.setItem("user", JSON.stringify(user));
      }

      await Swal.fire({ icon: "success", title: "Contraseña actualizada" });
      location.reload();
    } catch {
      Swal.fire("Error", "No se pudo actualizar la contraseña", "error");
    } finally {
      setSaving(btnGuardarPass, false, "Guardar cambios");
    }
  });

  // =============================== 
  // LOGOUT
  // ===============================
  $(".cerrar-sesion")?.addEventListener("click", async () => {
    const ok = await Swal.fire({
      title: "¿Cerrar sesión?",
      text: "Tu sesión actual se cerrará",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#c91a1a",
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Cancelar",
    });
    if (ok.isConfirmed) {
      localStorage.clear();
      sessionStorage.clear();
      document.cookie = "authToken=; Max-Age=0; path=/";
      location.replace("../Authenticator/login.html");
    }
  });

  // =============================== 
  // INICIO
  // ===============================
  await cargarUsuario();
});

// ===============================
// DashboardClienteController.js ✅ FINAL COMPLETO
// (Heroku + Perfil Oscuro + Filtro de citas + Búsqueda)
// ===============================

import { getUserId, getToken, getUsuarioLogueado, logout } from "../JS/Services/LoginService.js";

document.addEventListener("DOMContentLoaded", async () => {
  const $ = (s) => document.querySelector(s);

  const userId = getUserId();
  const token  = getToken();

  if (!userId || !token) {
    Swal.fire("Sesión requerida", "Debes iniciar sesión nuevamente", "warning")
      .then(() => location.replace("../Authenticator/login.html"));
    return;
  }

  // ===============================
  // 🔗 API BASE (Heroku)
  // ===============================
  const API_BASE = "https://sasaapi-73d5de493985.herokuapp.com";
  const API_USER = `${API_BASE}/apiCliente/${userId}`;
  const API_VEHICULOS = `${API_BASE}/apiVehiculo/consultar?page=0&size=50&sortBy=idVehiculo&sortDir=asc`;
  const API_CITAS = `${API_BASE}/apiCitas/consultar`;

  // ===============================
  // 🔹 ELEMENTOS DEL DOM
  // ===============================
  const nombreHeader = $("#nombreHeader");
  const nombreCompleto = $("#nombreCompleto");
  const rolUsuario = $("#rolUsuario");
  const userIdEl = $("#userId");
  const userInitials = $("#userInitials");

  const menuNombre = $("#menuNombre");
  const menuRol = $("#menuRol");
  const menuUserId = $("#menuUserId");

  const overlay = $("#overlay");
  const profileMenu = $("#profileMenu");
  const menuToggle = $("#menuToggle");
  const closeMenu = $("#closeMenu");
  const logoutBtn = $(".cerrar-sesion");

  const listaVehiculosDashboard = $("#listaVehiculosDashboard");
  const tplVehiculo = $("#tplVehiculoCard");
  const citasHomeList = $("#citasHomeList");
  const tplCita = $("#tplCitaCard");
  const chipsCitas = $("#citasChips");
  const searchInput = $("#searchCitas"); // 🔍 barra de búsqueda

  // ===============================
  // 🔹 HELPERS
  // ===============================
  const initialsFromName = (n) => {
    const parts = n.split(" ").filter(Boolean);
    if (parts.length === 0) return "U";
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || "U";
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const setText = (el, val) => el && (el.textContent = val ?? "—");

  const fechaISOaObj = (iso) => {
    if (!iso) return null;
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d);
  };

  const isToday = (iso) => {
    const d = fechaISOaObj(iso);
    const now = new Date();
    return (
      !!d &&
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  };

  const withinNextDays = (iso, days = 7) => {
    const d = fechaISOaObj(iso);
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + days);
    return !!d && d >= start && d <= end;
  };

  const fmtLabelHora = (fecha, hora) => {
    if (!fecha) return hora || "—";
    const d = fechaISOaObj(fecha);
    if (!d) return hora || "—";
    const hoy = new Date();
    const pre =
      d.toDateString() === hoy.toDateString()
        ? "Hoy"
        : d.toLocaleDateString("es", { weekday: "short" });
    return `${pre}, ${hora || "—"}`;
  };

  // ===============================
  // 🔹 CARGAR USUARIO
  // ===============================
  async function cargarUsuario() {
    try {
      const res = await fetch(API_USER, { headers: { Authorization: `Bearer ${token}` } });
      let u = null;
      if (res.ok) u = await res.json();

      const localUser = getUsuarioLogueado();
      const nombre = `${u?.nombre ?? localUser?.nombre ?? ""} ${u?.apellido ?? localUser?.apellido ?? ""}`.trim() || "Usuario";
      const rol = (u?.rol ?? localUser?.rol ?? "CLIENTE").toUpperCase();

      // Encabezado principal
      setText(nombreHeader, `Bienvenido ${nombre}`);

      // Panel lateral
      setText(nombreCompleto, nombre);
      setText(rolUsuario, rol);
      setText(menuNombre, nombre);
      setText(menuRol, rol);
      setText(userIdEl, userId);
      setText(menuUserId, userId);
      setText(userInitials, initialsFromName(nombre));

      localStorage.setItem("nombre", nombre);
      localStorage.setItem("rol", rol);
    } catch (err) {
      console.error("⚠️ Error al cargar usuario:", err);
      const localUser = getUsuarioLogueado();
      const nombre = `${localUser?.nombre ?? ""} ${localUser?.apellido ?? ""}`.trim() || "Usuario";
      const rol = localUser?.rol ?? "CLIENTE";

      setText(nombreHeader, `Bienvenido ${nombre}`);
      setText(nombreCompleto, nombre);
      setText(rolUsuario, rol);
      setText(menuNombre, nombre);
      setText(menuRol, rol);
      setText(userIdEl, userId);
      setText(menuUserId, userId);
      setText(userInitials, initialsFromName(nombre));
    }
  }

  // ===============================
  // 🔹 MENÚ PERFIL
  // ===============================
  const abrirMenu = () => {
    profileMenu?.classList.add("open");
    overlay?.classList.add("show");
  };
  const cerrarMenu = () => {
    profileMenu?.classList.remove("open");
    overlay?.classList.remove("show");
  };

  menuToggle?.addEventListener("click", abrirMenu);
  closeMenu?.addEventListener("click", cerrarMenu);
  overlay?.addEventListener("click", cerrarMenu);
  window.addEventListener("keydown", (e) => e.key === "Escape" && cerrarMenu());

  // ===============================
  // 🔹 LOGOUT
  // ===============================
  logoutBtn?.addEventListener("click", async () => {
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
  // 🔹 CITAS (Filtro + Búsqueda)
  // ===============================
  let citasRaw = [];
  let filtro = "hoy";
  let busqueda = "";

  const filtrarCitas = (arr) => {
    let filtered = arr.filter((c) => String(c.idCliente) === String(userId));

    if (filtro === "hoy") filtered = filtered.filter((c) => isToday(c.fecha));
    else if (filtro === "semana") filtered = filtered.filter((c) => withinNextDays(c.fecha, 7));

    if (busqueda.trim() !== "") {
      const term = busqueda.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.descripcion?.toLowerCase().includes(term) ||
          c.fecha?.toLowerCase().includes(term) ||
          c.hora?.toLowerCase().includes(term)
      );
    }

    return filtered;
  };

  function renderCitas() {
    if (!citasHomeList) return;
    citasHomeList.innerHTML = "";
    const items = filtrarCitas(citasRaw);
    if (!items.length) {
      citasHomeList.innerHTML = `<div class="empty-state">Sin citas en este filtro.</div>`;
      return;
    }
    const frag = document.createDocumentFragment();
    items.forEach((cita) => {
      const el = tplCita?.content.firstElementChild.cloneNode(true);
      if (!el) return;
      setText(el.querySelector(".pill span"), fmtLabelHora(cita.fecha, cita.hora));
      setText(el.querySelector(".title"), cita.descripcion || "Sin descripción");
      setText(el.querySelector(".cita-code"), `#CITA-${cita.id}`);
      frag.appendChild(el);
    });
    citasHomeList.appendChild(frag);
  }

  // Cambiar filtro (chips)
  chipsCitas?.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-filter]");
    if (!a) return;
    e.preventDefault();
    chipsCitas.querySelectorAll(".chip").forEach((c) => c.classList.remove("chip-active"));
    a.classList.add("chip-active");
    filtro = a.dataset.filter;
    renderCitas();
  });

  // Barra de búsqueda
  searchInput?.addEventListener("input", (e) => {
    busqueda = e.target.value;
    renderCitas();
  });

  // Cargar citas
  if (userId && citasHomeList) {
    fetch(API_CITAS, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((json) => {
        citasRaw = json.data?.content ?? json.content ?? json ?? [];
        renderCitas();
      })
      .catch(() => {
        citasRaw = [];
        renderCitas();
      });
  }

  // ===============================
  // 🔹 VEHÍCULOS
  // ===============================
  function renderVehiculos(vehiculos) {
    if (!listaVehiculosDashboard) return;
    if (!vehiculos.length) {
      listaVehiculosDashboard.innerHTML = `
        <a class="card vehicle add-card" href="../MisVehiculos/anadirVehiculo.html">
          <div class="vehicle__body">
            <h3 class="vehicle__name">Añadir vehículo</h3>
            <p>Registra tu primer vehículo para comenzar.</p>
          </div>
        </a>`;
      return;
    }
    const frag = document.createDocumentFragment();
    vehiculos.forEach((v) => {
      const el = tplVehiculo?.content.firstElementChild.cloneNode(true);
      if (!el) return;
      el.querySelector(".vehicle__name").textContent = `${v.marca ?? ""} ${v.modelo ?? ""}`.trim();
      const ps = el.querySelectorAll(".vehicle__body p");
      if (ps[0]) ps[0].textContent = `Año: ${v.anio ?? "—"}`;
      if (ps[1]) ps[1].textContent = `Placa: ${v.placa ?? "—"}`;
      if (ps[2]) ps[2].textContent = `VIN: ${v.vin ?? "—"}`;
      frag.appendChild(el);
    });
    listaVehiculosDashboard.innerHTML = "";
    listaVehiculosDashboard.appendChild(frag);
  }

  if (userId && listaVehiculosDashboard) {
    fetch(API_VEHICULOS, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((json) => {
        const data = json.data?.content ?? json.content ?? [];
        const vehiculosCliente = data.filter(
          (v) => String(v.idCliente ?? v?.cliente?.idCliente ?? "") === String(userId)
        );
        renderVehiculos(vehiculosCliente);
      })
      .catch(() => renderVehiculos([]));
  }

  // ===============================
  // 🔹 INICIO
  // ===============================
  await cargarUsuario();
});

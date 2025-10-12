// ===============================
// DashboardClienteController.js ✅ FINAL (Heroku + Filtros + Búsqueda real)
// ===============================

import { getToken, getUserId, fetchWithAuth, logout } from "../JS/Services/LoginService.js";

document.addEventListener("DOMContentLoaded", () => {
  const userId = getUserId();
  const token = getToken();

  // ===============================
  // 🔗 API BASE (Heroku)
  // ===============================
  const API_BASE = "https://sasaapi-73d5de493985.herokuapp.com";
  const API_USER = `${API_BASE}/apiCliente/${userId}`;
  const API_CITAS = `${API_BASE}/apiCitas/consultar`;
  const API_VEHICULOS = `${API_BASE}/apiVehiculo/consultar`;

  // ===============================
  // 🔹 ELEMENTOS
  // ===============================
  const nombreHeader = document.getElementById("nombreHeader");
  const menuNombre = document.getElementById("menuNombre");
  const menuUserId = document.getElementById("menuUserId");
  const menuPase = document.getElementById("menuPase");
  const logoutBtn = document.getElementById("logoutBtn");

  const citasHomeList = document.getElementById("citasHomeList");
  const tplCita = document.getElementById("tplCitaCard");
  const chipsCitas = document.getElementById("citasChips");

  const listaVehiculosDashboard = document.getElementById("listaVehiculosDashboard");
  const tplVehiculo = document.getElementById("tplVehiculoCard");

  const searchInput = document.getElementById("searchInput");
  const goSearch = document.getElementById("goSearch");

  // ===============================
  // 🔹 MENÚ PERFIL
  // ===============================
  const overlay = document.getElementById("overlay");
  const profileMenu = document.getElementById("profileMenu");
  const menuToggle = document.getElementById("menuToggle");
  const closeMenu = document.getElementById("closeMenu");

  const abrirMenu = () => {
    profileMenu?.classList.add("open");
    overlay?.classList.add("show");
    document.body.style.overflow = "hidden";
  };
  const cerrarMenu = () => {
    profileMenu?.classList.remove("open");
    overlay?.classList.remove("show");
    document.body.style.overflow = "";
  };

  menuToggle?.addEventListener("click", abrirMenu);
  closeMenu?.addEventListener("click", cerrarMenu);
  overlay?.addEventListener("click", cerrarMenu);
  window.addEventListener("keydown", (e) => e.key === "Escape" && cerrarMenu());

  // ===============================
  // 🔹 DATOS DEL USUARIO
  // ===============================
  if (menuUserId) menuUserId.textContent = userId || "Desconocido";

  if (userId) {
    fetchWithAuth(API_USER)
      .then((r) => r.json())
      .then((user) => {
        const nombre = `${user?.nombre ?? ""} ${user?.apellido ?? ""}`.trim() || "Usuario";
        nombreHeader && (nombreHeader.textContent = `Bienvenido ${nombre}`);
        menuNombre && (menuNombre.textContent = nombre);
        menuPase && (menuPase.textContent = user?.pase || "Cliente");
        localStorage.setItem("nombre", nombre);
      })
      .catch(() => {
        nombreHeader && (nombreHeader.textContent = localStorage.getItem("nombre") || "Usuario");
      });
  }

  logoutBtn?.addEventListener("click", logout);

  // ===============================
  // 🔹 UTILIDADES
  // ===============================
  const setText = (el, v) => el && (el.textContent = v ?? "—");

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
    const pre = d.toDateString() === hoy.toDateString() ? "Hoy" : d.toLocaleDateString("es", { weekday: "short" });
    return `${pre}, ${hora || "—"}`;
  };

  // ===============================
  // 🔹 VARIABLES GLOBALES
  // ===============================
  let citasRaw = [];
  let vehiculosRaw = [];
  let filtro = "hoy";
  let query = "";

  // ===============================
  // 🔹 FILTROS Y BÚSQUEDA
  // ===============================
  chipsCitas?.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-filter]");
    if (!a) return;
    e.preventDefault();
    chipsCitas.querySelectorAll(".chip").forEach((c) => c.classList.remove("chip-active"));
    a.classList.add("chip-active");
    filtro = a.dataset.filter;
    renderCitas();
  });

  searchInput?.addEventListener("input", (e) => {
    query = e.target.value.trim().toLowerCase();
    renderCitas();
    renderVehiculos(vehiculosRaw);
  });

  // ===============================
  // 🔹 CITAS
  // ===============================
  const filtrarCitas = (arr) => {
    let filtered = arr.filter((c) => String(c.idCliente) === String(userId));
    if (filtro === "hoy") filtered = filtered.filter((c) => isToday(c.fecha));
    else if (filtro === "semana") filtered = filtered.filter((c) => withinNextDays(c.fecha, 7));

    if (query) {
      filtered = filtered.filter(
        (c) =>
          c.descripcion?.toLowerCase().includes(query) ||
          c.estado?.toLowerCase().includes(query) ||
          String(c.id).includes(query)
      );
    }
    return filtered;
  };

  function renderCitas() {
    if (!citasHomeList) return;
    citasHomeList.innerHTML = "";
    const items = filtrarCitas(citasRaw);
    if (!items.length) {
      citasHomeList.innerHTML = `<div class="empty-state">No se encontraron citas.</div>`;
      return;
    }
    const frag = document.createDocumentFragment();
    items.forEach((cita) => {
      const el = tplCita.content.firstElementChild.cloneNode(true);
      setText(el.querySelector(".pill span"), fmtLabelHora(cita.fecha, cita.hora));
      setText(el.querySelector(".title"), cita.descripcion || "Sin descripción");
      setText(el.querySelector(".cita-code"), `#CITA-${cita.id}`);
      frag.appendChild(el);
    });
    citasHomeList.appendChild(frag);
  }

  if (userId && citasHomeList) {
    fetchWithAuth(API_CITAS)
      .then((res) => res.json())
      .then((json) => {
        citasRaw = json.data?.content || json.content || json;
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
    const filtered = query
      ? vehiculos.filter(
          (v) =>
            (v.marca || v.Marca || "").toLowerCase().includes(query) ||
            (v.modelo || v.Modelo || "").toLowerCase().includes(query) ||
            (v.placa || v.Placa || "").toLowerCase().includes(query) ||
            (v.vin || v.VIN || "").toLowerCase().includes(query)
        )
      : vehiculos;

    if (!filtered.length) {
      listaVehiculosDashboard.innerHTML = `
        <p class="empty-state">No se encontraron vehículos.</p>`;
      return;
    }

    const frag = document.createDocumentFragment();
    filtered.forEach((v) => {
      const el = tplVehiculo.content.firstElementChild.cloneNode(true);
      el.querySelector(".vehicle__name").textContent = `${v.marca ?? v.Marca ?? ""} ${v.modelo ?? v.Modelo ?? ""}`.trim();
      const ps = el.querySelectorAll(".vehicle__body p");
      ps[0].textContent = `Año: ${v.anio ?? v.Año ?? "—"}`;
      ps[1].textContent = `Placa: ${v.placa ?? v.Placa ?? "—"}`;
      ps[2].textContent = `VIN: ${v.vin ?? v.VIN ?? "—"}`;
      frag.appendChild(el);
    });
    listaVehiculosDashboard.innerHTML = "";
    listaVehiculosDashboard.appendChild(frag);
  }

  if (userId && listaVehiculosDashboard) {
    fetchWithAuth(API_VEHICULOS)
      .then((res) => res.json())
      .then((json) => {
        const data = json.data?.content || json.content || json;
        vehiculosRaw = data.filter((v) => String(v.idCliente ?? v.IdCliente) === String(userId));
        renderVehiculos(vehiculosRaw);
      })
      .catch(() => renderVehiculos([]));
  }
});

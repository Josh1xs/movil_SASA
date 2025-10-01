import { getToken, getUserId, fetchWithAuth, logout } from "../JS/Services/LoginService.js";

document.addEventListener("DOMContentLoaded", () => {
  const userId = getUserId();
  const token = getToken();

  let API_BASE;
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    API_BASE = "http://localhost:8080";
  } else if (window.location.hostname === "10.0.2.2") {
    API_BASE = "http://10.0.2.2:8080";
  } else {
    API_BASE = "https://mi-backend-produccion.com";
  }

  const API_USER = `${API_BASE}/apiCliente/${userId}`;
  const API_CITAS = `${API_BASE}/apiCitas/consultar`;
  const API_VEHICULOS = `${API_BASE}/apiVehiculo/consultar?page=0&size=50&sortBy=idVehiculo&sortDir=asc`;

  const greetingText = document.getElementById("greetingText");
  const menuUserId = document.getElementById("menuUserId");
  const menuNombre = document.getElementById("menuNombre");
  const menuPase = document.getElementById("menuPase");
  const citasHomeList = document.getElementById("citasHomeList");
  const chipsCitas = document.getElementById("citasChips");
  const tplCita = document.getElementById("tplCitaCard");
  const listaVehiculosDashboard = document.getElementById("listaVehiculosDashboard");
  const tplVehiculo = document.getElementById("tplVehiculoCard");
  const logoutBtn = document.getElementById("logoutBtn");

  const overlay = document.getElementById("overlay");
  const profileMenu = document.getElementById("profileMenu");
  const menuToggle = document.getElementById("menuToggle");
  const closeMenu = document.getElementById("closeMenu");

  function openMenu(){ profileMenu?.classList.add("open"); overlay?.classList.add("show"); }
  function closeMenuFn(){ profileMenu?.classList.remove("open"); overlay?.classList.remove("show"); }

  menuToggle?.addEventListener("click", openMenu);
  closeMenu?.addEventListener("click", closeMenuFn);
  overlay?.addEventListener("click", closeMenuFn);
  window.addEventListener("keydown", (e)=>{ if(e.key==="Escape") closeMenuFn(); });

  if (menuUserId) menuUserId.textContent = userId || "—";

  if (userId) {
    fetchWithAuth(API_USER)
      .then(r => r.json())
      .then(user => {
        const nombre = `${user?.nombre ?? ""} ${user?.apellido ?? ""}`.trim() || "Usuario";
        if (greetingText) greetingText.textContent = `Bienvenido ${nombre}`;
        if (menuNombre) menuNombre.textContent = nombre;
        if (menuPase) menuPase.textContent = user?.pase ?? "Cliente";
        localStorage.setItem("nombre", nombre);
        if (user?.email) localStorage.setItem("email", user.email);
      })
      .catch(() => {
        const nombre = localStorage.getItem("nombre") || "Usuario";
        if (greetingText) greetingText.textContent = `Bienvenido ${nombre}`;
      });
  }

  logoutBtn?.addEventListener("click", e => {
    e.preventDefault();
    logout();
  });

  const setText = (el, v) => { if (el) el.textContent = v ?? "—"; };

  const fechaISOaObj = iso => {
    if (!iso) return null;
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d);
  };

  const isToday = iso => {
    const d = fechaISOaObj(iso);
    const now = new Date();
    return !!d && d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  };

  const withinNextDays = (iso, days = 7) => {
    const d = fechaISOaObj(iso);
    const start = new Date(); start.setHours(0,0,0,0);
    const end = new Date(start); end.setDate(end.getDate() + days);
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

  let citasRaw = [];
  let filtro = "hoy";

  chipsCitas?.addEventListener("click", e => {
    const a = e.target.closest("a[data-filter]");
    if (!a) return;
    e.preventDefault();
    chipsCitas.querySelectorAll(".chip").forEach(c => c.classList.remove("chip-active"));
    a.classList.add("chip-active");
    filtro = a.dataset.filter;
    renderCitas();
  });

  const filtrarCitas = arr => {
    if (filtro === "hoy") return arr.filter(c => isToday(c.fecha));
    if (filtro === "semana") return arr.filter(c => withinNextDays(c.fecha, 7));
    return arr;
  };

  function renderCitas() {
    if (!citasHomeList) return;
    citasHomeList.innerHTML = "";
    let items = (citasRaw || []).filter(c => String(c.idCliente) === String(userId));
    items = filtrarCitas(items);
    if (!items.length) {
      citasHomeList.innerHTML = `<div class="empty-state">Sin citas en este filtro.</div>`;
      return;
    }
    const frag = document.createDocumentFragment();
    items.forEach(cita => {
      const el = tplCita?.content.firstElementChild.cloneNode(true);
      if (!el) return;
      setText(el.querySelector(".pill span"), fmtLabelHora(cita.fecha, cita.hora));
      setText(el.querySelector(".title"), cita.descripcion || "Sin descripción");
      setText(el.querySelector(".cita-code"), `#CITA-${cita.id}`);
      frag.appendChild(el);
    });
    citasHomeList.appendChild(frag);
    localStorage.setItem("citas", JSON.stringify(items));
  }

  if (userId && citasHomeList) {
    fetchWithAuth(API_CITAS)
      .then(res => res.json())
      .then(json => {
        citasRaw = json.data?.content ?? json.content ?? json ?? [];
        renderCitas();
      })
      .catch(() => { citasRaw = []; renderCitas(); });
  }

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
    vehiculos.forEach(v => {
      const el = tplVehiculo?.content.firstElementChild.cloneNode(true);
      if (!el) return;
      el.querySelector(".vehicle__name").textContent = `${v.marca ?? v.Marca ?? ""} ${v.modelo ?? v.Modelo ?? ""}`.trim();
      const ps = el.querySelectorAll(".vehicle__body p");
      if (ps[0]) ps[0].textContent = `Año: ${v.anio ?? v.Anio ?? "—"}`;
      if (ps[1]) ps[1].textContent = `Placa: ${v.placa ?? v.Placa ?? "—"}`;
      if (ps[2]) ps[2].textContent = `VIN: ${v.vin ?? v.VIN ?? "—"}`;
      frag.appendChild(el);
    });
    listaVehiculosDashboard.innerHTML = "";
    listaVehiculosDashboard.appendChild(frag);
    localStorage.setItem("vehiculos", JSON.stringify(vehiculos));
  }

  if (userId && listaVehiculosDashboard) {
    fetchWithAuth(API_VEHICULOS)
      .then(res => res.json())
      .then(json => {
        const data = json.data?.content ?? json.content ?? [];
        const vehiculosCliente = (Array.isArray(data) ? data : []).filter(v =>
          String(v.idCliente ?? v.IdCliente ?? v?.cliente?.idCliente ?? "") === String(userId)
        );
        renderVehiculos(vehiculosCliente);
      })
      .catch(() => renderVehiculos([]));
  }
});

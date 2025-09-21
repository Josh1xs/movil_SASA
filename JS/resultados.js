// ===============================
// script.js (Dashboard) con fetchWithAuth + búsqueda
// ===============================
import { getToken, getUserId, fetchWithAuth, logout } from "../JS/Services/LoginService.js";

document.addEventListener("DOMContentLoaded", () => {
  // ===============================
  // CONSTANTES Y ENDPOINTS
  // ===============================
  const userId        = getUserId();
  const token         = getToken();

  const API_USER      = `http://localhost:8080/apiCliente/${userId}`;
  const API_CITAS     = "http://localhost:8080/apiCitas/consultar";
  const API_VEHICULOS = "http://localhost:8080/apiVehiculo/consultar";

  // ===============================
  // ELEMENTOS DOM
  // ===============================
  const overlay      = document.getElementById("overlay");
  const profileMenu  = document.getElementById("profileMenu");
  const menuToggle   = document.getElementById("menuToggle");
  const closeMenu    = document.getElementById("closeMenu");
  const logoutBtn    = document.getElementById("logoutBtn");

  const nombreHeader = document.getElementById("nombreHeader");
  const menuUserId   = document.getElementById("menuUserId");
  const menuNombre   = document.getElementById("menuNombre");
  const menuPase     = document.getElementById("menuPase");

  const citasHomeList  = document.getElementById("citasHomeList");
  const chipsCitas     = document.getElementById("citasChips");
  const tplCita        = document.getElementById("tplCitaCard");

  const listaVehiculosDashboard = document.getElementById("listaVehiculosDashboard");
  const tplVehiculo   = document.getElementById("tplVehiculoCard");

  // ===============================
  // MENÚ PERFIL
  // ===============================
  function abrirMenu() {
    profileMenu?.classList.add("open");
    overlay?.classList.add("show");
    overlay?.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function cerrarMenu() {
    profileMenu?.classList.remove("open");
    overlay?.classList.remove("show");
    overlay?.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  menuToggle?.addEventListener("click", () => {
    menuToggle.classList.add("spin");
    setTimeout(() => menuToggle.classList.remove("spin"), 600);
    abrirMenu();
  });
  closeMenu?.addEventListener("click", cerrarMenu);
  overlay?.addEventListener("click", cerrarMenu);
  window.addEventListener("keydown", (e) => e.key === "Escape" && cerrarMenu());

  // ===============================
  // MOSTRAR DATOS DEL USUARIO
  // ===============================
  if (menuUserId) menuUserId.textContent = userId || "Desconocido";

  if (userId) {
    fetchWithAuth(API_USER)
      .then((r) => r.json())
      .then((user) => {
        const nombre = `${user?.nombre ?? ""} ${user?.apellido ?? ""}`.trim() || "Usuario";
        nombreHeader && (nombreHeader.textContent = nombre);
        menuNombre   && (menuNombre.textContent   = nombre);
        menuPase     && (menuPase.textContent     = user?.pase || "Cliente");

        localStorage.setItem("nombre", nombre);
        if (user?.email) localStorage.setItem("email", user.email);
      })
      .catch(() => {
        nombreHeader && (nombreHeader.textContent = localStorage.getItem("nombre") || "Usuario");
      });
  } else {
    nombreHeader && (nombreHeader.textContent = localStorage.getItem("nombre") || "Usuario");
  }

  // ===============================
  // LOGOUT
  // ===============================
  logoutBtn?.addEventListener("click", async (e) => {
    e.preventDefault();
    logout();
  });

  // ===============================
  // UTILIDADES
  // ===============================
  const setText = (el, v) => { if (el) el.textContent = v ?? "—"; };

  const fechaISOaObj = (iso) => {
    if (!iso) return null;
    const [y, m, d] = iso.split("-").map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  };

  const isToday = (iso) => {
    const d = fechaISOaObj(iso);
    if (!d) return false;
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  };

  const withinNextDays = (iso, days = 7) => {
    const d = fechaISOaObj(iso);
    if (!d) return false;
    const start = new Date(); start.setHours(0,0,0,0);
    const end = new Date(start); end.setDate(end.getDate() + days);
    return d >= start && d <= end;
  };

  const fmtLabelHora = (fecha, hora) => {
    if (!fecha) return hora || "—";
    const d = fechaISOaObj(fecha);
    if (!d) return hora || "—";
    const hoy = new Date();
    const sameDay = d.toDateString() === hoy.toDateString();
    const pre = sameDay ? "Hoy" : d.toLocaleDateString("es", { weekday: "short" });
    return `${pre}, ${hora || "—"}`;
  };

  // ===============================
  // CITAS
  // ===============================
  let citasRaw = [];
  let filtro = "hoy";

  chipsCitas?.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-filter]");
    if (!a) return;
    e.preventDefault();
    chipsCitas.querySelectorAll(".chip").forEach((c) => c.classList.remove("chip-active"));
    a.classList.add("chip-active");
    filtro = a.dataset.filter;
    renderCitas();
  });

  const filtrarCitas = (arr) => {
    if (filtro === "hoy")    return arr.filter((c) => isToday(c.fecha));
    if (filtro === "semana") return arr.filter((c) => withinNextDays(c.fecha, 7));
    return arr;
  };

  function renderCitas() {
    if (!citasHomeList) return;
    citasHomeList.innerHTML = "";

    let items = (citasRaw || []).filter((c) => String(c.idCliente) === String(userId));
    items = filtrarCitas(items);

    if (!items.length) {
      citasHomeList.innerHTML = `<div class="empty-state">Sin citas en este filtro.</div>`;
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
    fetchWithAuth(API_CITAS, { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        citasRaw = json.data?.content || json;
        renderCitas();
      })
      .catch(() => { citasRaw = []; renderCitas(); });
  }

  // ===============================
  // VEHÍCULOS
  // ===============================
  let vehiculosRaw = [];

  function renderVehiculos(vehiculos) {
    if (!listaVehiculosDashboard) return;

    if (!vehiculos.length) {
      listaVehiculosDashboard.innerHTML = `
        <a class="card vehicle add-card" href="../MisVehiculos/anadirVehiculo.html">
          <div class="vehicle__img" style="display:grid;place-items:center;background:#fff;border:1px dashed #e5e7eb;">
            <i class="fa-solid fa-plus" style="color:var(--brand);font-size:20px"></i>
          </div>
          <div class="vehicle__body">
            <h3 class="vehicle__name">Añadir vehículo</h3>
            <p>Registra tu primer vehículo para comenzar.</p>
          </div>
          <i class="fa-solid fa-chevron-right vehicle__chev" aria-hidden="true"></i>
        </a>`;
      return;
    }

    const frag = document.createDocumentFragment();
    vehiculos.forEach((v) => {
      const el = tplVehiculo.content.firstElementChild.cloneNode(true);
      el.querySelector(".vehicle__name").textContent = `${v.Marca ?? v.marca} ${v.Modelo ?? v.modelo}`.trim();
      const ps = el.querySelectorAll(".vehicle__body p");
      ps[0].innerHTML = `<span>Año:</span> ${v.anio ?? v.Año ?? "—"}`;
      ps[1].innerHTML = `<span>Placa:</span> ${v.placa ?? v.Placa ?? "—"}`;
      ps[2].innerHTML = `<span>VIN:</span> ${v.vin ?? v.VIN ?? "—"}`;
      frag.appendChild(el);
    });
    listaVehiculosDashboard.innerHTML = "";
    listaVehiculosDashboard.appendChild(frag);
  }

  if (userId && listaVehiculosDashboard) {
    fetchWithAuth(API_VEHICULOS, { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        const data = json.data?.content || json.content || json;
        vehiculosRaw = data.filter((v) => String(v.idCliente ?? v.IdCliente) === String(userId));
        renderVehiculos(vehiculosRaw);
      })
      .catch(() => renderVehiculos([]));
  }

  // ===============================
  // BÚSQUEDA (vehículos + citas)
  // ===============================
  (function setupSearchGo() {
    const input = document.getElementById("searchInput");
    const btn   = document.getElementById("goSearch");
    if (!input || !btn) return;

    const go = () => {
      const q = (input.value || "").trim().toLowerCase();
      if (!q) {
        window.Swal
          ? Swal.fire({ icon: "info", title: "Escribe algo para buscar", confirmButtonColor: "#c91a1a" })
          : alert("Escribe algo para buscar");
        return;
      }

      // Filtrar citas
      const citasFiltradas = (citasRaw || []).filter(
        (c) =>
          String(c.idCliente) === String(userId) &&
          (
            (c.descripcion || "").toLowerCase().includes(q) ||
            (c.estado || "").toLowerCase().includes(q) ||
            String(c.id).includes(q)
          )
      );

      // Filtrar vehículos
      const vehiculosFiltrados = (vehiculosRaw || []).filter(
        (v) =>
          (v.marca || v.Marca || "").toLowerCase().includes(q) ||
          (v.modelo || v.Modelo || "").toLowerCase().includes(q) ||
          (v.placa || v.Placa || "").toLowerCase().includes(q) ||
          (v.vin || v.VIN || "").toLowerCase().includes(q)
      );

      // Mostrar resultados en consola (puedes redirigir a otra vista)
      console.log("🔎 Resultados búsqueda", { citasFiltradas, vehiculosFiltrados });

      if (window.Swal) {
        Swal.fire({
          title: "Resultados de búsqueda",
          html: `
            <h3>Citas</h3>
            ${citasFiltradas.length ? citasFiltradas.map(c => `<p>#CITA-${c.id}: ${c.descripcion}</p>`).join("") : "<p>Sin resultados</p>"}
            <hr/>
            <h3>Vehículos</h3>
            ${vehiculosFiltrados.length ? vehiculosFiltrados.map(v => `<p>${v.Marca ?? v.marca} ${v.Modelo ?? v.modelo} - ${v.Placa ?? v.placa}</p>`).join("") : "<p>Sin resultados</p>"}
          `,
          confirmButtonColor: "#c91a1a"
        });
      }
    };

    btn.addEventListener("click", go);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); go(); }
    });
  })();
});

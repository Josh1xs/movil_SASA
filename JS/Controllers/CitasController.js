// ===============================
// 📅 CitasController.js ✅ FINAL COMPLETO
// (Heroku + Calendario + Mis Citas + Menú Perfil + Logout)
// ===============================

import { getUserId, getToken, getUsuarioLogueado } from "../Services/LoginService.js";
import { getCitasPaginadas, crearCita } from "../Services/CitasService.js";
import { getVehiculos } from "../Services/VehiculoService.js";

document.addEventListener("DOMContentLoaded", async () => {
  const $ = (s) => document.querySelector(s);

  // ===============================
  // 🔹 AUTENTICACIÓN
  // ===============================
  const userId = getUserId();
  const token = getToken();

  if (!userId || !token) {
    Swal.fire("Sesión requerida", "Debes iniciar sesión nuevamente", "warning").then(() =>
      location.replace("../Authenticator/login.html")
    );
    return;
  }

  // ===============================
  // 🔹 API BASE
  // ===============================
  const API_BASE = "https://sasaapi-73d5de493985.herokuapp.com";
  const API_USER = `${API_BASE}/apiCliente/${userId}`;

  // ===============================
  // 🔹 REFERENCIAS DOM
  // ===============================
  const fechaHidden = $("#fechaSeleccionada");
  const horaInput = $("#horaInput");
  const mesActualEl = $("#mesActual");
  const prevBtn = $("#prevMonth");
  const nextBtn = $("#nextMonth");
  const calendario = $("#calendario");
  const listaCitas = $("#listaCitas");
  const vehiculoSelect = $("#vehiculoSelect");
  const tipoServicio = $("#tipoServicio");
  const descripcionInp = $("#descripcion");
  const form = $("#formCita");

  // Menú lateral
  const overlay = $("#overlay");
  const profileMenu = $("#profileMenu");
  const menuToggle = $("#menuToggle");
  const closeMenu = $("#closeMenu");
  const logoutBtn = $("#logoutBtn");

  // ===============================
  // 🔹 CARGAR USUARIO (ajustado a tu HTML actual)
  // ===============================
  async function cargarUsuario() {
    try {
      const res = await fetch(API_USER, { headers: { Authorization: `Bearer ${token}` } });
      let u = null;
      if (res.ok) u = await res.json();

      const localUser = getUsuarioLogueado();
      const nombre =
        `${u?.nombre ?? localUser?.nombre ?? ""} ${u?.apellido ?? localUser?.apellido ?? ""}`.trim() ||
        "Usuario";
      const rol = (u?.rol ?? localUser?.rol ?? "Cliente").toUpperCase();

      const menuNombre = $("#menuNombre");
      const menuPase = $("#menuPase");
      const menuUserId = $("#menuUserId");

      if (menuNombre) menuNombre.textContent = nombre;
      if (menuPase) menuPase.textContent = rol;
      if (menuUserId) menuUserId.textContent = userId;

      localStorage.setItem("nombre", nombre);
      localStorage.setItem("rol", rol);
    } catch (err) {
      console.error("⚠️ Error al cargar usuario:", err);
    }
  }

  // ===============================
  // 🔹 MENÚ PERFIL / LOGOUT
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

  logoutBtn?.addEventListener("click", async (e) => {
    e.preventDefault();
    const ok = await Swal.fire({
      title: "¿Cerrar sesión?",
      text: "Tu sesión actual se cerrará",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#C91A1A",
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
  // 🔹 FUNCIONES AUXILIARES
  // ===============================
  const two = (n) => String(n).padStart(2, "0");
  const toISO = (d) => `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}`;

  const toAmPm = (time24) => {
    if (!time24) return "";
    const [h, m] = time24.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${String(h12).padStart(2, "0")}:${two(m)} ${ampm}`;
  };

  const feriadosES = [
    "2025-01-01",
    "2025-03-24",
    "2025-03-25",
    "2025-03-26",
    "2025-05-01",
    "2025-06-17",
    "2025-08-06",
    "2025-09-15",
    "2025-11-02",
    "2025-12-25",
  ];

  const today = new Date();
  let viewYear = today.getFullYear();
  let viewMonth = today.getMonth();

  const nextBusinessDates = (limit = 20) => {
    const list = [];
    const d = new Date();
    while (list.length < limit) {
      const dow = d.getDay();
      if (dow >= 1 && dow <= 5) list.push(toISO(new Date(d)));
      d.setDate(d.getDate() + 1);
    }
    return list;
  };
  const disponibles = nextBusinessDates(20);

  // ===============================
  // 🔹 CALENDARIO
  // ===============================
  function renderCalendar() {
    calendario.innerHTML = "";

    mesActualEl.textContent = new Date(viewYear, viewMonth, 1)
      .toLocaleDateString("es", { month: "long", year: "numeric" })
      .replace(/^\p{L}/u, (c) => c.toUpperCase());

    const headers = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
    headers.forEach((txt) => {
      const h = document.createElement("div");
      h.className = "cal-cell header";
      h.textContent = txt;
      calendario.appendChild(h);
    });

    const first = new Date(viewYear, viewMonth, 1);
    let startDow = first.getDay();
    if (startDow === 0) startDow = 7;
    for (let i = 0; i < startDow - 1; i++) calendario.appendChild(document.createElement("div"));

    const lastDate = new Date(viewYear, viewMonth + 1, 0).getDate();
    for (let day = 1; day <= lastDate; day++) {
      const d = new Date(viewYear, viewMonth, day);
      const iso = toISO(d);
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "cal-cell";
      cell.textContent = String(day);

      if (viewYear > 2025) {
        cell.disabled = true;
        cell.style.opacity = 0.3;
      } else if (feriadosES.includes(iso)) {
        cell.classList.add("holiday");
        cell.onclick = () =>
          Swal.fire({
            icon: "info",
            title: "Día no disponible",
            text: "Este día no se realizan citas por asueto.",
          });
      } else if (disponibles.includes(iso)) {
        cell.classList.add("available");
        cell.onclick = () => {
          calendario.querySelectorAll(".cal-cell.selected").forEach((el) => el.classList.remove("selected"));
          cell.classList.add("selected");
          fechaHidden.value = iso;
          horaInput.min = "07:00";
          horaInput.max = "16:00";
          horaInput.step = 1800;
          if (!horaInput.value) horaInput.value = "07:00";
        };
      } else {
        cell.disabled = true;
        cell.style.opacity = 0.45;
      }

      calendario.appendChild(cell);
    }
  }

  renderCalendar();

  prevBtn.onclick = () => {
    if (viewYear === today.getFullYear() && viewMonth <= today.getMonth()) return;
    viewMonth--;
    if (viewMonth < 0) {
      viewMonth = 11;
      viewYear--;
    }
    renderCalendar();
  };

  nextBtn.onclick = () => {
    if (viewYear >= 2025 && viewMonth >= 11) return;
    viewMonth++;
    if (viewMonth > 11) {
      viewMonth = 0;
      viewYear++;
    }
    renderCalendar();
  };

  // ===============================
  // 🔹 CARGAR VEHÍCULOS
  // ===============================
  async function cargarVehiculos() {
    try {
      const res = await getVehiculos(token, 0, 50);
      const vehiculos = res.content ?? res;

      vehiculoSelect.innerHTML = `<option value="">Seleccionar</option>`;
      vehiculos
        .filter((v) => String(v.idCliente) === String(userId))
        .forEach((v) => {
          const opt = document.createElement("option");
          opt.value = v.id;
          opt.textContent = `${v.marca} ${v.modelo} (${v.placa})`;
          vehiculoSelect.appendChild(opt);
        });

      if (vehiculoSelect.options.length === 1)
        vehiculoSelect.innerHTML = `<option value="">No tienes vehículos registrados</option>`;
    } catch (err) {
      vehiculoSelect.innerHTML = `<option value="">Error cargando vehículos</option>`;
      console.error("❌ Error cargando vehículos:", err.message);
    }
  }

  // ===============================
  // 🔹 CARGAR MIS CITAS
  // ===============================
  async function cargarMisCitas() {
    listaCitas.innerHTML = "";
    try {
      const citas = await getCitasPaginadas(token, 0, 50);
      const misCitas = citas.filter((c) => String(c.idCliente) === String(userId));

      if (!misCitas.length) {
        listaCitas.innerHTML = `
          <div class="card empty-state">
            <i class="fa-regular fa-calendar-xmark"></i>
            <p>Aún no tienes citas agendadas</p>
          </div>`;
        return;
      }

      listaCitas.innerHTML = misCitas
        .map(
          (c) => `
        <button class="card cita-item" data-id="${c.id}">
          <div class="cita-top-row">
            <strong>#CITA-${c.id}</strong>
            <span class="pill">${c.estado || "Pendiente"}</span>
          </div>
          <div class="cita-row">
            <span class="k">Fecha</span>
            <span class="v">${c.fecha} ${c.hora || ""}</span>
          </div>
          ${
            c.descripcion
              ? `<div class="cita-row"><span class="k">Nota</span><span class="v">${c.descripcion}</span></div>`
              : ""
          }
        </button>`
        )
        .join("");
    } catch (err) {
      console.error("❌ Error al cargar citas:", err.message);
    }
  }

  // ===============================
  // 🔹 REGISTRAR NUEVA CITA
  // ===============================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!fechaHidden.value)
      return Swal.fire("Fecha requerida", "Selecciona un día disponible.", "warning");
    if (!horaInput.value)
      return Swal.fire("Hora requerida", "Selecciona una hora válida.", "warning");
    if (!vehiculoSelect.value)
      return Swal.fire("Vehículo requerido", "Selecciona un vehículo.", "warning");
    if (!tipoServicio.value)
      return Swal.fire("Servicio requerido", "Debes indicar el tipo de servicio.", "warning");

    const cita = {
      fecha: fechaHidden.value,
      hora: toAmPm(horaInput.value),
      estado: "Pendiente",
      idCliente: parseInt(userId),
      idVehiculo: parseInt(vehiculoSelect.value),
      tipoServicio: tipoServicio.value,
      descripcion: descripcionInp.value?.trim() || null,
    };

    try {
      await crearCita(cita, token);
      Swal.fire({
        icon: "success",
        title: "¡Cita registrada!",
        text: "Tu cita fue registrada con éxito.",
        confirmButtonColor: "#C91A1A",
      });
      form.reset();
      await cargarMisCitas();
    } catch (err) {
      console.error("❌ Error creando cita:", err);
      Swal.fire({
        icon: "error",
        title: "No se pudo registrar",
        text: "Revisa los datos e inténtalo nuevamente.",
        confirmButtonColor: "#C91A1A",
      });
    }
  });

  // ===============================
  // 🔹 INICIALIZACIÓN
  // ===============================
  await cargarUsuario();
  await cargarVehiculos();
  await cargarMisCitas();

  document.addEventListener("click", (e) => {
    const item = e.target.closest(".cita-item");
    if (!item) return;
    const id = item.dataset.id;
    if (id) location.href = `./detallecitas.html?id=${encodeURIComponent(id)}`;
  });
});

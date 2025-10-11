import { getUserId, getToken } from "../Services/LoginService.js";
import { getCitasPaginadas, crearCita } from "../Services/CitasService.js";
import { getVehiculos } from "../Services/VehiculoService.js";

document.addEventListener("DOMContentLoaded", () => {

  const fechaHidden    = document.getElementById("fechaSeleccionada");
  const horaInput      = document.getElementById("horaInput");
  const mesActualEl    = document.getElementById("mesActual");
  const prevBtn        = document.getElementById("prevMonth");
  const nextBtn        = document.getElementById("nextMonth");
  const calendario     = document.getElementById("calendario");
  const listaCitas     = document.getElementById("listaCitas");
  const vehiculoSelect = document.getElementById("vehiculoSelect");
  const tipoServicio   = document.getElementById("tipoServicio");
  const descripcionInp = document.getElementById("descripcion");
  const form           = document.getElementById("formCita");

  const userId = getUserId();
  const token  = getToken();

  if (!userId || !token) {
    Swal.fire({
      icon: "warning",
      title: "Sesión requerida",
      text: "Por favor inicia sesión nuevamente para agendar tus citas.",
      confirmButtonColor: "#C91A1A"
    }).then(() => location.replace("../Authenticator/login.html"));
    return;
  }


  const two = (n) => String(n).padStart(2, "0");
  const toISO = (d) => `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}`;

  function toAmPm(time24) {
    if (!time24) return "";
    const [h, m] = time24.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${String(h12).padStart(2, "0")}:${two(m)} ${ampm}`;
  }


  const feriadosES = [
    "2025-01-01","2025-03-24","2025-03-25","2025-03-26",
    "2025-05-01","2025-06-17","2025-08-06","2025-09-15",
    "2025-11-02","2025-12-25"
  ];

  const today = new Date();
  let viewYear  = today.getFullYear();
  let viewMonth = today.getMonth();

  function nextBusinessDates(limit = 20) {
    const list = [];
    const d = new Date();
    while (list.length < limit) {
      const dow = d.getDay();
      if (dow >= 1 && dow <= 5) list.push(toISO(new Date(d)));
      d.setDate(d.getDate() + 1);
    }
    return list;
  }
  const disponibles = nextBusinessDates(20);

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
    for (let i = 0; i < startDow - 1; i++) {
      calendario.appendChild(document.createElement("div"));
    }

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
            text: "Este día no se realizan citas por asueto."
          });
      } else if (disponibles.includes(iso)) {
        cell.classList.add("available");
        cell.onclick = () => {
          calendario.querySelectorAll(".cal-cell.selected").forEach((el) =>
            el.classList.remove("selected")
          );
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
    if (viewMonth < 0) { viewMonth = 11; viewYear--; }
    renderCalendar();
  };

  nextBtn.onclick = () => {
    if (viewYear >= 2025 && viewMonth >= 11) return;
    viewMonth++;
    if (viewMonth > 11) { viewMonth = 0; viewYear++; }
    renderCalendar();
  };

  async function cargarVehiculos() {
    try {
      const res = await getVehiculos(token, 0, 50);
      const vehiculos = res.content ?? res;

      console.log("Vehículos recibidos:", vehiculos);

      vehiculoSelect.innerHTML = `<option value="">Seleccionar</option>`;

      vehiculos
        .filter((v) => String(v.idCliente) === String(userId)) 
        .forEach((v) => {
          const opt = document.createElement("option");
          opt.value = v.id;
          opt.textContent = `${v.marca} ${v.modelo} (${v.placa})`;
          vehiculoSelect.appendChild(opt);
        });

      if (vehiculoSelect.options.length === 1) {
        vehiculoSelect.innerHTML = `<option value="">No tienes vehículos registrados</option>`;
      }
    } catch (err) {
      console.error("Error cargando vehículos:", err.message);
      vehiculoSelect.innerHTML = `<option value="">Error cargando vehículos</option>`;
    }
  }


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

      listaCitas.innerHTML = misCitas.map((c) => `
        <button class="card cita-item" data-id="${c.id}">
          <div class="cita-top-row">
            <strong>#CITA-${c.id}</strong>
            <span class="pill">${c.estado || "Pendiente"}</span>
          </div>
          <div class="cita-row">
            <span class="k">Fecha</span>
            <span class="v">${c.fecha} ${c.hora || ""}</span>
          </div>
          ${c.descripcion ? `<div class="cita-row"><span class="k">Nota</span><span class="v">${c.descripcion}</span></div>` : ""}
        </button>
      `).join("");
    } catch (err) {
      console.error("Error al cargar citas:", err.message);
    }
  }


  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!fechaHidden.value) {
      Swal.fire("Fecha requerida", "Debes seleccionar un día disponible en el calendario.", "warning");
      return;
    }
    if (!horaInput.value) {
      Swal.fire("Hora requerida", "Por favor selecciona una hora válida.", "warning");
      return;
    }
    if (!vehiculoSelect.value) {
      Swal.fire("Vehículo requerido", "Selecciona un vehículo para la cita.", "warning");
      return;
    }
    if (!tipoServicio.value) {
      Swal.fire("Servicio requerido", "Debes indicar el tipo de servicio.", "warning");
      return;
    }

    const cita = {
      fecha: fechaHidden.value,
      hora: toAmPm(horaInput.value),
      estado: "Pendiente",
      idCliente: parseInt(userId),
      idVehiculo: parseInt(vehiculoSelect.value),
      tipoServicio: tipoServicio.value,
      descripcion: descripcionInp.value?.trim() || null
    };

    console.log("Enviando cita:", cita);

    try {
      await crearCita(cita, token);
      Swal.fire({
        icon: "success",
        title: "¡Cita registrada!",
        text: "Tu cita fue registrada con éxito. Te notificaremos cualquier actualización.",
        confirmButtonColor: "#C91A1A"
      });
      form.reset();
      await cargarMisCitas();
    } catch (err) {
      console.error("Error creando cita:", err);
      Swal.fire({
        icon: "error",
        title: "No se pudo registrar",
        text: "Por favor revisa los datos e inténtalo nuevamente.",
        confirmButtonColor: "#C91A1A"
      });
    }
  });


  cargarVehiculos();
  cargarMisCitas();

  document.addEventListener("click", (e) => {
    const item = e.target.closest(".cita-item");
    if (!item) return;
    const id = item.dataset.id;
    if (id) location.href = `./detallecitas.html?id=${encodeURIComponent(id)}`;
  });
});

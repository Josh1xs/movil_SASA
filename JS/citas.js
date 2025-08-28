document.addEventListener("DOMContentLoaded", () => {
  const userId = localStorage.getItem("userId");

  const API_CITAS     = "http://localhost:8080/apiCitas";
  const API_VEHICULOS = "http://localhost:8080/apiVehiculo/consultar";

  // === DOM ===
  const formCita      = document.getElementById("formCita");
  const fechaHidden   = document.getElementById("fechaSeleccionada");
  const horaInput     = document.getElementById("horaInput");
  const vehiculoSel   = document.getElementById("vehiculoSelect");
  const estadoSel     = document.getElementById("estado");
  const listaCitas    = document.getElementById("listaCitas");
  const timeHint      = document.getElementById("timeHint");
  const btnEnviar     = document.getElementById("btnEnviar");

  // Banner dinámico de edición
  let editBanner = null;
  let editingId = null;

  // === Vehículos ===
  async function loadVehiculos() {
    vehiculoSel.innerHTML = `<option value="">Cargando vehículos…</option>`;
    try {
      const r = await fetch(API_VEHICULOS);
      const data = await r.json();
      const mis = (data.data?.content || data).filter(v => String(v.idCliente) === String(userId));
      if (!mis.length) {
        vehiculoSel.innerHTML = `<option value="">No tienes vehículos registrados</option>`;
        vehiculoSel.disabled = true;
        return;
      }
      vehiculoSel.disabled = false;
      vehiculoSel.innerHTML = `<option value="">Selecciona</option>` + mis.map(v =>
        `<option value="${v.idVehiculo}">${v.marca} ${v.modelo} — ${v.placa}</option>`).join("");
    } catch {
      vehiculoSel.innerHTML = `<option value="">Error cargando vehículos</option>`;
      vehiculoSel.disabled = true;
    }
  }
  loadVehiculos();

  // === Cargar mis citas ===
  async function cargarMisCitas() {
    listaCitas.innerHTML = "";
    try {
      const r = await fetch(`${API_CITAS}/consultar`);
      const json = await r.json();
      const mias = (json.data?.content || json).filter(c => String(c.idCliente) === String(userId));

      if (!mias.length) {
        listaCitas.innerHTML = `<div class="card"><p class="muted">Aún no tienes citas.</p></div>`;
        localStorage.setItem("citas", "[]");
        return;
      }

      // ✅ Guardar en localStorage
      localStorage.setItem("citas", JSON.stringify(mias));

      mias.sort((a,b)=> new Date(`${a.fecha}T${a.hora||"00:00"}`) - new Date(`${b.fecha}T${b.hora||"00:00"}`));

      listaCitas.innerHTML = mias.map(c => `
        <div class="card cita-item">
          <div class="cita-top-row">
            <strong>#CITA-${c.id}</strong>
            <span class="pill">${c.estado||"Pendiente"}</span>
          </div>
          <div class="cita-row"><span class="k">Fecha</span><span class="v">${c.fecha} ${c.hora||""}</span></div>
          <div class="cita-actions" style="margin-top:8px;display:flex;gap:8px;">
            <button class="btn ghost btn-edit" 
              data-id="${c.id}" 
              data-fecha="${c.fecha}" 
              data-hora="${c.hora}" 
              data-vehiculo="${c.idVehiculo}">
              Editar
            </button>
            <button class="btn danger btn-del" data-id="${c.id}">Eliminar</button>
          </div>
        </div>
      `).join("");
    } catch {
      listaCitas.innerHTML = `<div class="card"><p class="muted">Error cargando tus citas.</p></div>`;
    }
  }
  cargarMisCitas();

  // === Crear o Editar cita ===
  formCita?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!userId) {
      Swal.fire({icon:"info",title:"Debes iniciar sesión"});
      return;
    }

    const fecha = fechaHidden.value;
    const hora  = horaInput.value;
    const vehId = vehiculoSel.value;
    const servicio = estadoSel.value;

    if (!fecha || !hora || !vehId || !servicio) {
      Swal.fire({icon:"info",title:"Campos incompletos"});
      return;
    }

    const payload = {
      fecha,
      hora: hora.length === 5 ? hora + ":00" : hora,
      estado: "Pendiente",
      idCliente: Number(userId),
      idVehiculo: Number(vehId)
    };

    try {
      if (editingId) {
        // actualizar
        const r = await fetch(`${API_CITAS}/actualizar/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!r.ok) throw new Error();
        Swal.fire({icon:"success",title:"Cita actualizada"});

        // ✅ actualizar localStorage
        let citas = JSON.parse(localStorage.getItem("citas") || "[]");
        citas = citas.map(c => c.id == editingId ? {...c, ...payload} : c);
        localStorage.setItem("citas", JSON.stringify(citas));

      } else {
        // crear
        const r = await fetch(`${API_CITAS}/registrar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!r.ok) throw new Error();
        const nueva = await r.json();
        Swal.fire({icon:"success",title:"Cita creada"});

        // ✅ guardar en localStorage
        let citas = JSON.parse(localStorage.getItem("citas") || "[]");
        citas.push(nueva.data || payload);
        localStorage.setItem("citas", JSON.stringify(citas));
      }

      resetForm();
      cargarMisCitas();
    } catch {
      Swal.fire({icon:"error",title:"Error",text:"No se pudo guardar la cita"});
    }
  });

  // === Delegación para Editar y Eliminar ===
  document.addEventListener("click", async (e) => {
    const btnEdit = e.target.closest(".btn-edit");
    const btnDel  = e.target.closest(".btn-del");

    // Eliminar
    if (btnDel) {
      const id = btnDel.dataset.id;
      const confirm = await Swal.fire({
        icon:"warning",
        title:"¿Eliminar cita?",
        text:"Esta acción no se puede deshacer",
        showCancelButton:true,
        confirmButtonColor:"#c91a1a",
        confirmButtonText:"Sí, eliminar",
        cancelButtonText:"Cancelar"
      });
      if (confirm.isConfirmed) {
        try {
          const r = await fetch(`${API_CITAS}/eliminar/${id}`, { method:"DELETE" });
          if (!r.ok) throw new Error();
          Swal.fire({icon:"success",title:"Cita eliminada"});

          // ✅ actualizar localStorage
          let citas = JSON.parse(localStorage.getItem("citas") || "[]");
          citas = citas.filter(c => c.id != id);
          localStorage.setItem("citas", JSON.stringify(citas));

          cargarMisCitas();
        } catch {
          Swal.fire({icon:"error",title:"Error",text:"No se pudo eliminar"});
        }
      }
    }

    // Editar
    if (btnEdit) {
      editingId = btnEdit.dataset.id;
      fechaHidden.value = btnEdit.dataset.fecha;
      horaInput.value   = btnEdit.dataset.hora;
      vehiculoSel.value = btnEdit.dataset.vehiculo || "";

      btnEnviar.innerHTML = `<i class="fa-solid fa-pen"></i> Actualizar`;

      if (!editBanner) {
        editBanner = document.createElement("div");
        editBanner.style.background = "#fef2f2";
        editBanner.style.color = "#c91a1a";
        editBanner.style.padding = "10px";
        editBanner.style.marginBottom = "10px";
        editBanner.style.borderRadius = "12px";
        editBanner.style.fontWeight = "600";
        editBanner.innerHTML = `
          Estás editando una cita. 
          <button id="btnCancelEdit" class="btn ghost" style="margin-left:10px;">Cancelar</button>
        `;
        formCita.prepend(editBanner);
      }
    }
  });

  // Cancelar edición
  document.addEventListener("click", (e) => {
    if (e.target.id === "btnCancelEdit") {
      resetForm();
    }
  });

  // === Reset formulario ===
  function resetForm() {
    formCita.reset();
    fechaHidden.value = "";
    editingId = null;
    btnEnviar.innerHTML = `<i class="fa-regular fa-paper-plane"></i> Enviar`;

    if (editBanner) {
      editBanner.remove();
      editBanner = null;
    }
  }

  // === Calendar ===
  const mesActualEl   = document.getElementById("mesActual");
  const prevMonthBtn  = document.getElementById("prevMonth");
  const nextMonthBtn  = document.getElementById("nextMonth");
  const calendario    = document.getElementById("calendario");

  const two = n => String(n).padStart(2,"0");
  const toISO = (d) => `${d.getFullYear()}-${two(d.getMonth()+1)}-${two(d.getDate())}`;

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

  const today = new Date();
  let viewYear  = today.getFullYear();
  let viewMonth = today.getMonth();
  const disponibles = nextBusinessDates(20);

  function nombreMesES(y, m) {
    return new Date(y, m, 1).toLocaleDateString("es", { month: "long", year: "numeric" })
      .replace(/^\w/, c => c.toUpperCase());
  }

  function renderCalendar() {
    if (!calendario) return;
    calendario.innerHTML = "";
    mesActualEl.textContent = nombreMesES(viewYear, viewMonth);

    const dias = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];
    dias.forEach(d => {
      const h = document.createElement("div");
      h.className = "cal-head";
      h.textContent = d;
      calendario.appendChild(h);
    });

    const first = new Date(viewYear, viewMonth, 1);
    let startDow = first.getDay(); if (startDow === 0) startDow = 7;
    for (let i = 0; i < startDow - 1; i++) {
      calendario.appendChild(Object.assign(document.createElement("div"),{className:"cal-cell cal-empty"}));
    }

    const lastDate = new Date(viewYear, viewMonth + 1, 0).getDate();
    for (let day = 1; day <= lastDate; day++) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "cal-cell cal-day";
      const d = new Date(viewYear, viewMonth, day);
      const iso = toISO(d);
      cell.dataset.date = iso;
      cell.textContent = String(day);

      if (iso === toISO(today)) cell.classList.add("is-today");

      if (disponibles.includes(iso)) {
        cell.classList.add("is-available");
        cell.addEventListener("click", () => {
          calendario.querySelectorAll(".cal-day.selected").forEach(el => el.classList.remove("selected"));
          cell.classList.add("selected");
          fechaHidden.value = iso;
          timeHint.textContent = "Horario permitido: 07:00–16:00";
          horaInput.min = "07:00";
          horaInput.max = "16:00";
          if (!horaInput.value) horaInput.value = "07:00";
        });
      } else {
        cell.classList.add("is-disabled");
      }

      calendario.appendChild(cell);
    }
  }

  prevMonthBtn?.addEventListener("click", () => { viewMonth--; if (viewMonth<0){viewMonth=11;viewYear--;} renderCalendar(); });
  nextMonthBtn?.addEventListener("click", () => { viewMonth++; if (viewMonth>11){viewMonth=0;viewYear++;} renderCalendar(); });

  renderCalendar();
});

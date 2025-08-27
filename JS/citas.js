document.addEventListener("DOMContentLoaded", () => {

  const userId = localStorage.getItem("userId");
  const API_USER      = userId ? `https://retoolapi.dev/DeaUI0/registro/${userId}` : null;
  const API_CITAS     = `https://retoolapi.dev/2Kfhrs/cita`;
  const API_VEHICULOS = "https://retoolapi.dev/4XQf28/anadirvehiculo";


  const overlay     = document.getElementById("overlay");
  const profileMenu = document.getElementById("profileMenu");
  const menuToggle  = document.getElementById("menuToggle");
  const closeMenu   = document.getElementById("closeMenu");
  const logoutBtn   = document.getElementById("logoutBtn");

  const mesActualEl   = document.getElementById("mesActual");
  const prevMonthBtn  = document.getElementById("prevMonth");
  const nextMonthBtn  = document.getElementById("nextMonth");
  const calendario    = document.getElementById("calendario");

  const formCita      = document.getElementById("formCita");
  const fechaHidden   = document.getElementById("fechaSeleccionada");
  const horaInput     = document.getElementById("horaInput");
  const timeHint      = document.getElementById("timeHint");
  const vehiculoSel   = document.getElementById("vehiculoSelect");
  const estadoSel     = document.getElementById("estado");     
  const descripcionIn = document.getElementById("descripcion");

  const listaCitas    = document.getElementById("listaCitas");


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


  if (userId && API_USER) {
    fetch(API_USER)
      .then(r => r.json())
      .then(user => {
        const nombre = `${user?.nombre ?? ""} ${user?.apellido ?? ""}`.trim() || "Usuario";
        document.getElementById("menuNombre") && (document.getElementById("menuNombre").textContent = nombre);
        document.getElementById("menuPase")   && (document.getElementById("menuPase").textContent   = user?.pase || "Cliente");
        document.getElementById("menuUserId") && (document.getElementById("menuUserId").textContent = userId);
      })
      .catch(()=>{});
  } else {
    document.getElementById("menuUserId") && (document.getElementById("menuUserId").textContent = "Desconocido");
  }


  logoutBtn?.addEventListener("click", async (e) => {
    e.preventDefault();
    try {} finally {
      ["userId","nombre","name","email","pase","authToken","token","refreshToken"].forEach(k => localStorage.removeItem(k));
      sessionStorage.clear();
      document.cookie = "authToken=; Max-Age=0; path=/";
      const redirectTo = logoutBtn.getAttribute("href") || "../Authenticator/login.html";
      window.location.replace(redirectTo);
    }
  });


  const fmtMoney = n => Number(n||0).toLocaleString("es-SV",{style:"currency",currency:"USD"});
  const two = n => String(n).padStart(2,"0");
  const toISO = (d) => `${d.getFullYear()}-${two(d.getMonth()+1)}-${two(d.getDate())}`;


  function nextBusinessDates(limit = 20) {
    const set = new Set();
    const d = new Date(); 
    while (set.size < limit) {
      const dow = d.getDay(); 
      if (dow >= 1 && dow <= 5) {
        set.add(toISO(d));
      }
      d.setDate(d.getDate() + 1);
    }
    return set;
  }


  const today = new Date();
  let viewYear  = today.getFullYear();
  let viewMonth = today.getMonth();
  const disponibles = nextBusinessDates(20);


  function nombreMesES(y, m) {
    const date = new Date(y, m, 1);
    return date.toLocaleDateString("es", { month: "long", year: "numeric" })
      .replace(/^\w/, c => c.toUpperCase());
  }

  function renderCalendar() {
    if (!calendario) return;
    calendario.innerHTML = "";

 
    if (mesActualEl) mesActualEl.textContent = nombreMesES(viewYear, viewMonth);

    const dias = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];
    const headFrag = document.createDocumentFragment();
    dias.forEach(d => {
      const h = document.createElement("div");
      h.className = "cal-head";
      h.textContent = d;
      headFrag.appendChild(h);
    });
    calendario.appendChild(headFrag);

  
    const first = new Date(viewYear, viewMonth, 1);
    let startDow = first.getDay();
    if (startDow === 0) startDow = 7; 
    const blanks = startDow - 1; 


    for (let i = 0; i < blanks; i++) {
      const div = document.createElement("div");
      div.className = "cal-cell cal-empty";
      calendario.appendChild(div);
    }


    const lastDate = new Date(viewYear, viewMonth + 1, 0).getDate();
    const frag = document.createDocumentFragment();
    for (let day = 1; day <= lastDate; day++) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "cal-cell cal-day";
      const d = new Date(viewYear, viewMonth, day);
      const iso = toISO(d);
      cell.dataset.date = iso;
      cell.textContent = String(day);


      const isToday = iso === toISO(today);
      const isAvailable = disponibles.has(iso);
      if (isToday) cell.classList.add("is-today");
      if (isAvailable) cell.classList.add("is-available");
      else cell.classList.add("is-disabled");

      cell.addEventListener("click", () => {
        if (!isAvailable) return;

        calendario.querySelectorAll(".cal-day.selected").forEach(el => el.classList.remove("selected"));
        cell.classList.add("selected");
        fechaHidden.value = iso;

        if (timeHint) timeHint.textContent = "Horario permitido: 07:00–16:00";
     
        if (horaInput) {
          horaInput.min = "07:00";
          horaInput.max = "16:00";
          if (!horaInput.value) horaInput.value = "07:00";
        }
      });

      frag.appendChild(cell);
    }
    calendario.appendChild(frag);
  }

  prevMonthBtn?.addEventListener("click", () => {
    viewMonth--;
    if (viewMonth < 0) { viewMonth = 11; viewYear--; }
    renderCalendar();
  });
  nextMonthBtn?.addEventListener("click", () => {
    viewMonth++;
    if (viewMonth > 11) { viewMonth = 0; viewYear++; }
    renderCalendar();
  });

  renderCalendar();


  async function loadVehiculos() {
    if (!vehiculoSel) return;
    vehiculoSel.innerHTML = `<option value="">Cargando vehículos…</option>`;
    try {
      const r = await fetch(API_VEHICULOS, { cache: "no-store" });
      const data = await r.json();
      const mis = (Array.isArray(data) ? data : []).filter(v => String(v.idCliente) === String(userId));
      if (!mis.length) {
        vehiculoSel.innerHTML = `<option value="">No tienes vehículos registrados</option>`;
        vehiculoSel.disabled = true;
        return;
      }
      vehiculoSel.disabled = false;
      vehiculoSel.innerHTML = `<option value="">Selecciona</option>` + mis.map(v => {
        const label = `${v.marca || "Vehículo"} ${v.modelo || ""} — ${v.placa || "s/placa"}`.trim();
        return `<option value="${v.id}">${label}</option>`;
      }).join("");
    } catch (e) {
      vehiculoSel.innerHTML = `<option value="">Error cargando vehículos</option>`;
      vehiculoSel.disabled = true;
    }
  }
  loadVehiculos();


  async function cargarMisCitas() {
    if (!listaCitas) return;
    listaCitas.innerHTML = "";

    try {
      const r = await fetch(API_CITAS, { cache: "no-store" });
      const data = await r.json();
      const mias = (Array.isArray(data) ? data : []).filter(c => String(c.idCliente) === String(userId));

      if (!mias.length) {
        listaCitas.innerHTML = `<div class="card"><p class="muted">Aún no tienes citas.</p></div>`;
        return;
      }

 
      mias.sort((a, b) => {
        const da = new Date(`${a.fecha}T${a.hora || "00:00"}:00`).getTime();
        const db = new Date(`${b.fecha}T${b.hora || "00:00"}:00`).getTime();
        return da - db;
      });

      const frag = document.createDocumentFragment();
      mias.forEach(c => {
        const card = document.createElement("div");
        card.className = "card cita-item";
        const estado = (c.estado || "Pendiente");
        const badge = (estado.toLowerCase()==="cancelada")
          ? `<span class="pill pill-warn">Cancelada</span>`
          : `<span class="pill pill-ok">${estado}</span>`;

        card.innerHTML = `
          <div class="cita-top-row">
            <strong>#CITA-${c.id}</strong>
            ${badge}
          </div>
          <div class="cita-row"><span class="k">Fecha</span><span class="v">${c.fecha || "—"} ${c.hora || ""}</span></div>
          <div class="cita-row"><span class="k">Descripción</span><span class="v">${c.descripcion || "—"}</span></div>
          <div class="cita-actions">
            <button class="btn ghost btn-cancel" data-id="${c.id}" ${estado.toLowerCase()==="cancelada" ? "disabled" : ""}>Cancelar</button>
          </div>
        `;
        frag.appendChild(card);
      });
      listaCitas.appendChild(frag);
    } catch (e) {
      listaCitas.innerHTML = `<div class="card"><p class="muted">Error cargando tus citas.</p></div>`;
    }
  }
  cargarMisCitas();

 
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".btn-cancel");
    if (!btn) return;
    const id = btn.dataset.id;
    if (!id) return;

    const confirm = window.Swal
      ? await Swal.fire({icon:"warning", title:"Cancelar cita", text:"¿Seguro que deseas cancelar esta cita?", showCancelButton:true, confirmButtonColor:"#c91a1a", confirmButtonText:"Sí, cancelar"})
      : { isConfirmed: window.confirm("¿Cancelar cita?") };

    if (confirm.isConfirmed || confirm === true) {
      try {
        await fetch(`${API_CITAS}/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estado: "Cancelada" })
        });
        cargarMisCitas();
      } catch (e) {
        window.Swal ? Swal.fire({icon:"error", title:"Error", text:"No se pudo cancelar."}) : alert("No se pudo cancelar.");
      }
    }
  });

  function horaValida(hhmm) {
    if (!hhmm) return false;
    const [hh, mm] = hhmm.split(":").map(Number);
    const mins = hh*60 + mm;
    const min = 7*60; 
    const max = 16*60; 
    return mins >= min && mins <= max;
  }


  function noPasado(fechaISO, hhmm) {
    const now = new Date();
    const d = new Date(`${fechaISO}T${hhmm}:00`);
    return d.getTime() >= now.getTime();
  }

  
  formCita?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!userId) {
      window.Swal ? Swal.fire({icon:"info", title:"Debes iniciar sesión"}) : alert("Debes iniciar sesión.");
      return;
    }

    const fecha = fechaHidden.value;
    const hora  = horaInput?.value || "";
    const vehId = vehiculoSel?.value || "";
    const servicio = estadoSel?.value || "";    
    const desc     = (descripcionIn?.value || "").trim();

    if (!fecha) { window.Swal ? Swal.fire({icon:"info", title:"Selecciona una fecha"}) : alert("Selecciona una fecha."); return; }
    if (!horaValida(hora)) { window.Swal ? Swal.fire({icon:"info", title:"Hora inválida", text:"Debe estar entre 07:00 y 16:00"}) : alert("Hora fuera de rango (07:00–16:00)."); return; }
    if (fecha === toISO(today) && !noPasado(fecha, hora)) {
      window.Swal ? Swal.fire({icon:"info", title:"Hora pasada", text:"La hora seleccionada ya pasó."}) : alert("La hora seleccionada ya pasó.");
      return;
    }
    if (!vehId) { window.Swal ? Swal.fire({icon:"info", title:"Selecciona tu vehículo"}) : alert("Selecciona tu vehículo."); return; }

 
    const descripcionFinal = servicio ? `[${servicio}] ${desc}`.trim() : desc;

    const payload = {
      fecha,
      hora,
      descripcion: descripcionFinal || "—",
      estado: "Pendiente",
      idCliente: String(userId),
      idVehiculo: String(vehId)
    };

    try {
      const r = await fetch(API_CITAS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!r.ok) throw new Error("Bad response");

      window.Swal
        ? await Swal.fire({icon:"success", title:"Cita creada", text:"Tu cita fue registrada correctamente.", confirmButtonColor:"#c91a1a"})
        : alert("Cita creada.");

      formCita.reset();
      fechaHidden.value = "";
      calendario.querySelectorAll(".selected").forEach(el => el.classList.remove("selected"));
      cargarMisCitas();
    } catch (e) {
      window.Swal ? Swal.fire({icon:"error", title:"Error", text:"No se pudo crear la cita."}) : alert("No se pudo crear la cita.");
    }
  });
});

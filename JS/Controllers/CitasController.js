// ===============================
// citas.js
// ===============================
import { getUserId, getToken } from "../Services/LoginService.js";
import { getCitas } from "../Services/CitasService.js";

document.addEventListener("DOMContentLoaded", () => {
  const fechaHidden = document.getElementById("fechaSeleccionada");
  const horaInput   = document.getElementById("horaInput");
  const mesActualEl = document.getElementById("mesActual");
  const prevBtn     = document.getElementById("prevMonth");
  const nextBtn     = document.getElementById("nextMonth");
  const calendario  = document.getElementById("calendario");
  const listaCitas  = document.getElementById("listaCitas");

  const userId = getUserId();
  const token  = getToken();

  if (!userId || !token) {
    Swal.fire("Sesión requerida", "Debes iniciar sesión nuevamente", "warning")
      .then(() => location.replace("../Autenticacion/login.html"));
    return;
  }

  // -------------------------------
  // CALENDARIO
  // -------------------------------
  const feriadosES = [
    "2025-01-01","2025-03-24","2025-03-25","2025-03-26",
    "2025-05-01","2025-06-17","2025-08-06","2025-09-15",
    "2025-11-02","2025-12-25"
  ];

  const today = new Date();
  let viewYear  = today.getFullYear();
  let viewMonth = today.getMonth(); 

  const two  = n => String(n).padStart(2,"0");
  const toISO = d => `${d.getFullYear()}-${two(d.getMonth()+1)}-${two(d.getDate())}`;

  function nextBusinessDates(limit=20){
    const list=[]; const d=new Date();
    while(list.length<limit){
      const dow=d.getDay();       
      if(dow>=1 && dow<=5) list.push(toISO(new Date(d)));
      d.setDate(d.getDate()+1);
    }
    return list;
  }
  const disponibles = nextBusinessDates(20);

  function updateNavButtons(){
    const atMin = (viewYear === today.getFullYear() && viewMonth <= today.getMonth());
    const atMax = (viewYear === today.getFullYear() && viewMonth >= 11);
    prevBtn.disabled = atMin;
    nextBtn.disabled = atMax;
    prevBtn.style.opacity = prevBtn.disabled ? .5 : 1;
    nextBtn.style.opacity = nextBtn.disabled ? .5 : 1;
  }

  function renderCalendar(){
    calendario.innerHTML = "";
    mesActualEl.textContent = new Date(viewYear,viewMonth,1)
      .toLocaleDateString("es",{month:"long",year:"numeric"})
      .replace(/^\p{L}/u, c => c.toUpperCase());

    const headers = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];
    headers.forEach(txt=>{
      const h = document.createElement("div");
      h.className = "cal-cell header";
      h.textContent = txt;
      calendario.appendChild(h);
    });

    const first = new Date(viewYear, viewMonth, 1);
    let startDow = first.getDay(); if(startDow===0) startDow = 7; 
    for(let i=0;i<startDow-1;i++){
      const empty = document.createElement("div");
      calendario.appendChild(empty);
    }

    const lastDate = new Date(viewYear, viewMonth+1, 0).getDate();
    for(let day=1; day<=lastDate; day++){
      const d   = new Date(viewYear, viewMonth, day);
      const iso = toISO(d);
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "cal-cell";
      cell.textContent = String(day);

      if(feriadosES.includes(iso)){
        cell.classList.add("holiday");
        cell.onclick = () => Swal.fire({ icon:"info", title:"Cerrado por asueto", text: iso });
      } else if (disponibles.includes(iso)){
        cell.classList.add("available");
        cell.onclick = () => {
          calendario.querySelectorAll(".cal-cell.selected").forEach(el=>el.classList.remove("selected"));
          cell.classList.add("selected");
          fechaHidden.value = iso;
          horaInput.min = "07:00";
          horaInput.max = "16:00";
          horaInput.step = 1800; 
          if(!horaInput.value) horaInput.value = "07:00";
        };
      } else {
        cell.disabled = true;
        cell.style.opacity = .45;
      }

      calendario.appendChild(cell);
    }

    updateNavButtons();
  }

  prevBtn.onclick = () => {
    if(viewYear === today.getFullYear() && viewMonth <= today.getMonth()) return;
    viewMonth--;
    if(viewMonth < 0){ viewMonth = 11; viewYear--; }
    renderCalendar();
  };

  nextBtn.onclick = () => {
    if(viewYear !== today.getFullYear() || viewMonth >= 11) return;
    viewMonth++;
    if(viewMonth > 11){ viewMonth = 0; viewYear++; }
    renderCalendar();
  };

  horaInput.addEventListener("input", () => {
    if(!horaInput.value) return;
    const [hh, mm] = horaInput.value.split(":").map(Number);
    let mins = hh*60 + mm;
    mins = Math.max(7*60, Math.min(16*60, mins));
    mins = Math.round(mins/30)*30;
    const h = two(Math.floor(mins/60));
    const m = two(mins%60);
    horaInput.value = `${h}:${m}`;
  });

  renderCalendar();

  // -------------------------------
  // CARGAR CITAS
  // -------------------------------
  async function cargarMisCitas(){
    listaCitas.innerHTML = "";
    try{
      const citas = await getCitas(token);

      const misCitas = citas.filter(c => String(c.idCliente) === String(userId));

      if(!misCitas.length){
        listaCitas.innerHTML = `
          <div class="card empty-state">
            <i class="fa-regular fa-calendar-xmark"></i>
            <p>Sin citas</p>
          </div>`;
        localStorage.setItem("citas","[]");
        return;
      }

      misCitas.sort((a,b)=> new Date(`${a.fecha}T${a.hora||"00:00"}`) - new Date(`${b.fecha}T${b.hora||"00:00"}`));
      localStorage.setItem("citas", JSON.stringify(misCitas));

      listaCitas.innerHTML = misCitas.map(c => `
        <button class="card cita-item" data-id="${c.id}">
          <div class="cita-top-row">
            <strong>#CITA-${c.id}</strong>
            <span class="pill">${c.estado || "Pendiente"}</span>
          </div>
          <div class="cita-row">
            <span class="k">Fecha</span>
            <span class="v">${c.fecha} ${c.hora || ""}</span>
          </div>
        </button>
      `).join("");
    }catch{
      listaCitas.innerHTML = `
        <div class="card empty-state">
          <i class="fa-regular fa-face-frown"></i>
          <p>Error al cargar tus citas</p>
        </div>`;
    }
  }

  cargarMisCitas();

  document.addEventListener("click", (e) => {
    const item = e.target.closest(".cita-item");
    if(!item) return;
    const id = item.dataset.id;
    if(id) location.href = `./detallecitas.html?id=${encodeURIComponent(id)}`;
  });
});

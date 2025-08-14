// Endpoints
const API_URL = "https://retoolapi.dev/2Kfhrs/cita";
const API_VEHICULOS = "https://retoolapi.dev/4XQf28/anadirvehiculo";
const API_USER_BASE = "https://retoolapi.dev/DeaUI0/registro/";

// Estado calendario
let fechaCursor = new Date();           // Mes que se muestra
let selectedDate = null;                // Fecha elegida
const today = new Date(); today.setHours(0,0,0,0);
const maxDate = new Date(today); maxDate.setDate(maxDate.getDate() + 19); // 20 días (0..19 incluidos)

// Utilidades fecha
const dOW = d => d.getDay(); // 0=Dom
const toISO = d => d.toISOString().slice(0,10);
const sameDay = (a,b) => a?.toDateString() === b?.toDateString();
const inRange20 = d => d >= today && d <= maxDate;

// Ventanas horarias por día
function dayWindow(date) {
  const dow = dOW(date);
  if (dow === 0) return { min: "09:00", max: "13:00", label: "Domingo 09:00–13:00" };
  if (dow === 6) return { min: "08:00", max: "14:00", label: "Sábado 08:00–14:00" };
  return { min: "07:00", max: "19:00", label: "Lunes–Viernes 07:00–19:00" };
}
const inWindow = (date, hhmm) => {
  const {min, max} = dayWindow(date);
  return hhmm >= min && hhmm <= max;
};

// DOM
const el = sel => document.querySelector(sel);
const $cal = el("#calendario");
const $mes = el("#mesActual");
const $hora = el("#horaInput");
const $fechaHidden = el("#fechaSeleccionada");
const $vehiculos = el("#vehiculoSelect");
const $estado = el("#estado");
const $desc = el("#descripcion");
const $lista = el("#listaCitas");
const $form = el("#formCita");
const $timeHint = el("#timeHint");
const $btnEnviar = el("#btnEnviar");

// Sidebar + avatar spin
const overlay = el("#overlay");
const profileMenu = el("#profileMenu");
const menuToggle = el("#menuToggle");
const menuToggleBottom = el("#menuToggleBottom");
const closeMenu = el("#closeMenu");
[menuToggle, menuToggleBottom].forEach(btn=>{
  if(!btn) return;
  btn.addEventListener("click", ()=>{
    btn.classList.add("spin"); setTimeout(()=>btn.classList.remove("spin"),600);
    profileMenu.classList.add("open"); overlay.classList.add("show");
  });
});
if (closeMenu) closeMenu.addEventListener("click", closeSidebar);
if (overlay) overlay.addEventListener("click", closeSidebar);
function closeSidebar(){ profileMenu.classList.remove("open"); overlay.classList.remove("show"); }

// Logout (opcional si usas igual que index)
const logoutBtn = el("#logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click",(e)=>{
    e.preventDefault();
    ["userId","nombre","name","email","pase","authToken","token","refreshToken"].forEach(k=>localStorage.removeItem(k));
    sessionStorage.clear(); document.cookie="authToken=; Max-Age=0; path=/";
    location.replace(logoutBtn.getAttribute("href") || "../Authenticator/login.html");
  });
}

// Render calendario
function renderCalendar() {
  $cal.innerHTML = "";
  const year = fechaCursor.getFullYear();
  const month = fechaCursor.getMonth();

  $mes.textContent = fechaCursor.toLocaleString("es", { month: "long", year: "numeric" });

  const headers = ["L","M","M","J","V","S","D"];
  headers.forEach(h=>{
    const hd = document.createElement("div");
    hd.className = "cal-cell header";
    hd.textContent = h;
    $cal.appendChild(hd);
  });

  // offset: calendario arranca en lunes
  const first = new Date(year, month, 1);
  let startIndex = first.getDay(); // 0 dom .. 6 sab
  startIndex = (startIndex + 6) % 7; // lunes=0

  for (let i=0; i<startIndex; i++){
    const empty = document.createElement("div");
    empty.className = "cal-cell muted";
    $cal.appendChild(empty);
  }

  const daysInMonth = new Date(year, month+1, 0).getDate();
  for (let day=1; day<=daysInMonth; day++){
    const d = new Date(year, month, day);
    const cell = document.createElement("div");
    cell.className = "cal-cell";
    cell.textContent = day;

    if (!inRange20(d)) {
      cell.classList.add("muted");
    } else {
      cell.classList.add("in-range","selectable");
      cell.tabIndex = 0;
      cell.addEventListener("click", ()=>selectDate(d, cell));
      cell.addEventListener("keydown", (e)=>{ if(e.key==="Enter"||e.key===" ") selectDate(d, cell); });
    }

    if (sameDay(d, selectedDate)) cell.classList.add("selected");

    $cal.appendChild(cell);
  }

  // Botones mes (no permitimos navegar fuera del rango de 20 días)
  const prevBtn = el("#prevMonth");
  const nextBtn = el("#nextMonth");
  const monthStart = new Date(year, month, 1);
  const monthEnd   = new Date(year, month+1, 0);

  if (prevBtn) prevBtn.disabled = (monthStart <= today && monthEnd <= today);
  if (nextBtn) nextBtn.disabled = (monthStart >= maxDate && monthEnd >= maxDate);
}
function changeMonth(delta){
  fechaCursor.setMonth(fechaCursor.getMonth()+delta);
  renderCalendar();
}
el("#prevMonth").addEventListener("click", ()=>changeMonth(-1));
el("#nextMonth").addEventListener("click", ()=>changeMonth(1));

// Selección de fecha
function selectDate(date, cell){
  selectedDate = date;
  $fechaHidden.value = toISO(date);

  // Visual
  [...$cal.querySelectorAll(".cal-cell")].forEach(c=>c.classList.remove("selected"));
  cell.classList.add("selected");

  // Ventana de horario
  const w = dayWindow(date);
  $hora.min = w.min; $hora.max = w.max; $hora.value = "";
  $timeHint.textContent = `Horario disponible: ${w.label}`;
}

// Cargar datos de usuario y vehículos
async function cargarUsuarioYVehiculos(){
  const userId = localStorage.getItem("userId");
  el("#menuUserId").textContent = userId || "Desconocido";

  if (userId) {
    try{
      const u = await fetch(API_USER_BASE+userId).then(r=>r.json());
      const nombre = `${u?.nombre??""} ${u?.apellido??""}`.trim() || "Usuario";
      el("#menuNombre").textContent = nombre;
      el("#menuPase").textContent = u?.pase || "Cliente";
    }catch{}
  }

  // Vehículos
  try{
    const data = await fetch(API_VEHICULOS).then(r=>r.json());
    const misVeh = (Array.isArray(data)?data:[]).filter(v=>String(v.idCliente)===String(userId));
    $vehiculos.innerHTML = "";
    if (misVeh.length===0){
      const opt = document.createElement("option");
      opt.value = "";
      opt.textContent = "No hay vehículos ingresados";
      $vehiculos.appendChild(opt);
      $vehiculos.disabled = true;
      $btnEnviar.disabled = true;
    }else{
      $vehiculos.disabled = false;
      $btnEnviar.disabled = false;
      $vehiculos.appendChild(new Option("Selecciona tu vehículo",""));
      misVeh.forEach(v=>{
        $vehiculos.appendChild(new Option(`${v.marca||"Vehículo"} ${v.modelo||""} (${v.placa||"—"})`, v.id));
      });
    }
  }catch(e){
    $vehiculos.innerHTML = `<option value="">Error cargando vehículos</option>`;
    $btnEnviar.disabled = true;
  }
}

// Mostrar listado de citas (boxed + link al detalle)
async function mostrarCitas(){
  const userId = localStorage.getItem("userId");
  $lista.innerHTML = "";

  try{
    const data  = await fetch(API_URL).then(r=>r.json());
    const citas = (Array.isArray(data) ? data : [])
      .filter(c => String(c.idCliente) === String(userId));

    if (!citas.length){
      $lista.innerHTML = `<p class="muted" style="color:#fff;opacity:.9">No tienes citas registradas.</p>`;
      return;
    }

    citas.sort((a,b) =>
      (a.fecha || "").localeCompare(b.fecha || "") ||
      (a.hora  || "").localeCompare(b.hora  || "")
    );

    // ⭐️ Tarjeta encerrada en “cuadro”
    $lista.innerHTML = citas.map(cita => `
      <a class="cita-item" href="./detallecitas.html?id=${encodeURIComponent(cita.id)}">
        <article class="cita-card">
          <button class="cita-delete btn-delete" data-id="${cita.id}" title="Eliminar">
            <i class="fa-regular fa-trash-can"></i>
          </button>

          <h4 class="cita-title">
            ${cita.fecha || "—"} <span style="opacity:.8">a las</span> ${cita.hora || "—"}
          </h4>
          ${cita.estado ? `<p class="cita-sub">Tipo: ${cita.estado}</p>` : ""}
          ${cita.descripcion ? `<p class="cita-sub">Descripción: ${cita.descripcion}</p>` : ""}
        </article>
      </a>
    `).join("");

    // Eliminar sin navegar
    $lista.querySelectorAll(".btn-delete").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault(); e.stopPropagation();
        eliminarCita(btn.dataset.id);
      });
    });

  }catch(err){
    console.error("Error al cargar citas:", err);
    $lista.innerHTML = `<p class="muted" style="color:#fff;opacity:.9">No se pudieron cargar las citas.</p>`;
  }
}


// Eliminar
async function eliminarCita(id){
  const r = await Swal.fire({title:'¿Eliminar cita?',text:'Esta acción no se puede deshacer.',icon:'warning',showCancelButton:true,confirmButtonColor:'#d33',cancelButtonColor:'#aaa',confirmButtonText:'Sí, eliminar'});
  if (!r.isConfirmed) return;
  try{
    const res = await fetch(`${API_URL}/${id}`, { method:"DELETE" });
    if (!res.ok) throw new Error("delete");
    await fetch("https://retoolapi.dev/Nlb9BE/notificaciones", {
      method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ titulo:"Cita eliminada", descripcion:`Tu cita con ID ${id} fue eliminada.`, fecha: toISO(new Date()), idCliente: localStorage.getItem("userId") })
    });
    Swal.fire({icon:'success',title:'Cita eliminada',confirmButtonColor:'#28a745'});
    mostrarCitas();
  }catch{
    Swal.fire({icon:'error',title:'Error',text:'No se pudo eliminar la cita.',confirmButtonColor:'#c91a1a'});
  }
}

// Init
document.addEventListener("DOMContentLoaded", async ()=>{
  // Usuario + vehículos
  await cargarUsuarioYVehiculos();

  // Calendario inicial (cursor en el mes de hoy si la ventana de 20 días cae en dos meses, aún puedes navegar pero no seleccionar fuera del rango)
  fechaCursor = new Date(today);
  renderCalendar();

  // Listado
  await mostrarCitas();
});

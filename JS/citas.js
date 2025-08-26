document.addEventListener("DOMContentLoaded", () => {
  // ===== API y usuario =====
  const API_CITAS = "https://retoolapi.dev/2Kfhrs/cita";
  const API_VEH   = "https://retoolapi.dev/4XQf28/anadirvehiculo";
  const userId = localStorage.getItem("userId");

  // ===== DOM =====
  const $overlay = document.getElementById("overlay");
  const $menu = document.getElementById("profileMenu");
  const $open = document.getElementById("menuToggle");
  const $close = document.getElementById("closeMenu");
  const $logout = document.getElementById("logoutBtn");

  const $form = document.getElementById("formCita");
  const $fecha = document.getElementById("fecha");
  const $hora = document.getElementById("hora");
  const $vehiculo = document.getElementById("vehiculo");
  const $tipo = document.getElementById("tipo");
  const $desc = document.getElementById("descripcion");
  const $btnLimpiar = document.getElementById("btnLimpiar");

  const $list = document.getElementById("citasLista");
  const $tpl = document.getElementById("tplCitaItem");
  const $empty = document.getElementById("citasEmpty");

  // ===== Sidebar =====
  function openMenu(){ $menu?.classList.add("open"); $overlay?.classList.add("show"); document.body.style.overflow="hidden"; }
  function closeMenu(){ $menu?.classList.remove("open"); $overlay?.classList.remove("show"); document.body.style.overflow=""; }
  $open?.addEventListener("click", openMenu);
  $close?.addEventListener("click", closeMenu);
  $overlay?.addEventListener("click", closeMenu);
  window.addEventListener("keydown", (e)=> e.key==="Escape" && closeMenu());

  $logout?.addEventListener("click", (e)=>{
    e.preventDefault();
    ["userId","nombre","name","email","pase","authToken","token","refreshToken"].forEach(k=>localStorage.removeItem(k));
    sessionStorage.clear();
    document.cookie="authToken=; Max-Age=0; path=/";
    location.replace($logout.getAttribute("href")||"../Authenticator/login.html");
  });

  // ===== Helpers fechas / slots =====
  const toDate = (iso) => {
    if (!iso) return null;
    const [y,m,d] = iso.split("-").map(Number);
    if (!y||!m||!d) return null;
    return new Date(y, m-1, d);
  };
  const addDays = (d, n)=>{ const x=new Date(d); x.setDate(x.getDate()+n); return x; };
  const fmtDate = (d)=> d.toISOString().slice(0,10);
  const withinNextDays = (iso, days=7) => {
    const d = toDate(iso); if(!d) return false;
    const start = new Date(); start.setHours(0,0,0,0);
    const end = addDays(start, days);
    return d>=start && d<=end;
  };

  // Genera slots cada 30 min entre 08:00 y 17:30
  function generarSlots(){
    const out=[];
    for(let h=8; h<=17; h++){
      for(let m=0; m<60; m+=30){
        out.push(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`);
      }
    }
    return out;
  }

  // ===== Estado =====
  let citas = [];
  let vehiculos = [];

  // ===== Cargar vehículos del usuario =====
  async function cargarVehiculos(){
    try{
      const res = await fetch(API_VEH);
      const data = await res.json();
      vehiculos = (Array.isArray(data)?data:[]).filter(v=>String(v.idCliente)===String(userId));
      $vehiculo.innerHTML = `<option value="">Seleccionar</option>` +
        vehiculos.map(v => `<option value="${v.id}">${(v.marca||"Vehículo")} ${(v.modelo||"")} — ${v.placa||""}</option>`).join("");
    }catch{ /* nada */ }
  }

  // ===== Cargar citas =====
  async function cargarCitas(){
    try{
      const res = await fetch(API_CITAS,{cache:"no-store"});
      const data = await res.json();
      citas = Array.isArray(data)? data.filter(c=>String(c.idCliente)===String(userId)) : [];
      renderLista();
    }catch{
      citas = [];
      renderLista();
    }
  }

  // ====== Calendario: vista mensual con 20 días hábiles sombreados ======
(() => {
  const COUNT = 20;                 // cuántos días disponibles
  const INCLUDE_SAT = false;        // true si quieres contar sábados como hábiles

  const $ = (s) => document.querySelector(s);
  const $grid  = $("#calendario");
  const $title = $("#mesActual");
  const $prev  = $("#prevMonth");
  const $next  = $("#nextMonth");
  const $fecha = $("#fechaSeleccionada");
  const $hora  = $("#horaInput");
  const $hint  = $("#timeHint");

  if (!$grid) return;

  // utils
  const pad = (n) => String(n).padStart(2, "0");
  const iso  = (d) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  const add  = (d, days) => { const x = new Date(d); x.setDate(x.getDate()+days); return x; };
  const addM = (d, m)    => new Date(d.getFullYear(), d.getMonth()+m, 1);
  const monIndex = (d)   => (d.getDay()+6) % 7; // lunes=0..domingo=6
  const isBiz = (d) => {
    const w = d.getDay();             // 0 dom, 6 sáb
    return INCLUDE_SAT ? w !== 0 : (w !== 0 && w !== 6);
  };
  const capMonth = (d) => {
    let label = d.toLocaleDateString("es-ES", { month:"long", year:"numeric" }); // "agosto de 2025"
    label = label.replace(" de ", " "); // "agosto 2025"
    return label.charAt(0).toUpperCase() + label.slice(1);
  };

  // calcula una sola vez los 20 días hábiles desde hoy
  const today = new Date(); today.setHours(0,0,0,0);
  let cursor = new Date(today);
  // avanzar hasta el primer hábil
  while (!isBiz(cursor)) cursor = add(cursor, 1);

  const avail = [];
  while (avail.length < COUNT) {
    if (isBiz(cursor)) avail.push(new Date(cursor));
    cursor = add(cursor, 1);
  }
  const availSet = new Set(avail.map(iso));
  const firstAvail = avail[0];
  const lastAvail  = avail[avail.length - 1];
  const minMonth   = new Date(firstAvail.getFullYear(), firstAvail.getMonth(), 1);
  const maxMonth   = new Date(lastAvail.getFullYear(),  lastAvail.getMonth(),  1);

  // estado actual del calendario
  let currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  let selectedISO  = ""; // lo setea el usuario al hacer click

  function render() {
    $grid.innerHTML = "";

    // encabezados
    ["L","M","M","J","V","S","D"].forEach(h => {
      const head = document.createElement("div");
      head.className = "cal-cell header";
      head.textContent = h;
      $grid.appendChild(head);
    });

    // primer día visible (llenamos 6 filas = 42 celdas)
    const startOfMonth = new Date(currentMonth);
    const offset = monIndex(startOfMonth);      // huecos antes del 1
    const firstShown = add(startOfMonth, -offset);

    for (let i = 0; i < 42; i++) {
      const d = add(firstShown, i);
      const dISO = iso(d);
      const inMonth = d.getMonth() === currentMonth.getMonth();

      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "cal-cell";
      cell.textContent = String(d.getDate());
      if (!inMonth) cell.classList.add("muted");

      if (availSet.has(dISO)) {
        cell.classList.add("available", "selectable");
        cell.addEventListener("click", () => {
          // marcar selección
          $grid.querySelectorAll(".cal-cell.selected").forEach(x => x.classList.remove("selected"));
          cell.classList.add("selected");
          selectedISO = dISO;
          if ($fecha) $fecha.value = dISO;
          if ($hora)  $hora.disabled = false;
          if ($hint)  $hint.textContent =
            `Cita para el ${d.toLocaleDateString("es-ES",{weekday:"long", day:"2-digit", month:"long"})}`;
        });
      } else {
        // días no disponibles, se pueden mostrar "gris"
        cell.disabled = true;
      }

      if (selectedISO && dISO === selectedISO) cell.classList.add("selected");
      $grid.appendChild(cell);
    }

    // título y flechas
    $title.textContent = capMonth(currentMonth);
    $prev.disabled = currentMonth <= minMonth;
    $next.disabled = currentMonth >= maxMonth;
  }

  $prev?.addEventListener("click", () => { if (currentMonth > minMonth) { currentMonth = addM(currentMonth, -1); render(); }});
  $next?.addEventListener("click", () => { if (currentMonth < maxMonth) { currentMonth = addM(currentMonth, +1); render(); }});

  // primer render
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();


  // ===== Slots disponibles según fecha (evita choques) =====
  function poblarHoras(fechaISO){
    $hora.disabled = true;
    $hora.innerHTML = `<option value="">Selecciona una fecha primero</option>`;
    if(!fechaISO) return;

    const ocupadas = new Set(
      citas.filter(c => c.fecha === fechaISO).map(c => c.hora)
    );
    const opciones = generarSlots()
      .filter(h => !ocupadas.has(h))
      .map(h => `<option value="${h}">${h}</option>`).join("");

    $hora.innerHTML = opciones || `<option value="">Sin horarios disponibles</option>`;
    $hora.disabled = !opciones;
  }

  // ===== Rango de fecha (hoy..+20 días) =====
  (function setRangoFecha(){
    const hoy = new Date(); hoy.setHours(0,0,0,0);
    const max = new Date(hoy); max.setDate(max.getDate()+20);
    $fecha.min = fmtDate(hoy);
    $fecha.max = fmtDate(max);
  })();

  $fecha.addEventListener("change", ()=> poblarHoras($fecha.value));

  // ===== Enviar (crear cita) =====
  $form.addEventListener("submit", async (e)=>{
    e.preventDefault();
    const fecha = $fecha.value.trim();
    const hora  = $hora.value.trim();
    const idVeh = $vehiculo.value.trim();
    const tipo  = $tipo.value.trim();
    const descripcion = $desc.value.trim();

    if(!fecha || !hora || !idVeh || !tipo){
      Swal.fire({icon:"info",title:"Completa los campos requeridos",confirmButtonColor:"#c91a1a"});
      return;
    }

    // Evitar doble reserva misma fecha/hora
    if (citas.some(c => c.fecha===fecha && c.hora===hora)){
      Swal.fire({icon:"warning",title:"Horario no disponible",text:"Selecciona otra hora.",confirmButtonColor:"#c91a1a"});
      return;
    }

    const veh = vehiculos.find(v => String(v.id)===idVeh);
    const payload = {
      idCliente: userId,
      fecha, hora,
      estado: tipo,                 // el API ya usa "estado" para tipo de servicio
      descripcion,
      idVehiculo: idVeh,
      vehiculoLabel: veh ? `${veh.marca||"Vehículo"} ${veh.modelo||""} - ${veh.placa||""}` : ""
    };

    try{
      const res = await fetch(API_CITAS, {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify(payload)
      });
      if(!res.ok) throw 0;
      const nueva = await res.json();
      citas.push(nueva);
      renderLista();
      poblarHoras($fecha.value);
      Swal.fire({icon:"success",title:"Cita creada",timer:1400,showConfirmButton:false});
      $form.reset();
      $hora.disabled = true;
      $hora.innerHTML = `<option value="">Selecciona una fecha primero</option>`;
    }catch{
      Swal.fire({icon:"error",title:"No se pudo crear la cita"});
    }
  });

  // Limpiar
  $btnLimpiar.addEventListener("click", ()=>{
    $form.reset();
    $hora.disabled = true;
    $hora.innerHTML = `<option value="">Selecciona una fecha primero</option>`;
  });

  // Tiempo restante (delegado)
  document.addEventListener("click", (e)=>{
    const btn = e.target.closest(".cita-remaining-btn");
    if(!btn) return;
    const {fecha, hora} = btn.dataset;
    if(!fecha || !hora) return;
    const when = new Date(`${fecha}T${hora}:00`);
    const now  = new Date();
    const diff = when - now;
    const msg = diff<=0 ? "La cita ya pasó" : (()=>{const m=Math.floor(diff/60000),d=Math.floor(m/1440),h=Math.floor((m%1440)/60),mm=m%60;return `${d?d+" día"+(d>1?"s":"")+" ":""}${h?h+" h ":""}${mm} min`;})();
    Swal.fire({icon: diff>0?"info":"warning", title:"Tiempo restante", text:`${msg} para tu cita (${fecha} ${hora})`, confirmButtonColor:"#c91a1a"});
  });

  // Init
  (async function init(){
    await Promise.all([cargarVehiculos(), cargarCitas()]);
  })();
});

(function uiBasics(){
      const overlay = document.getElementById("overlay");
      const menu = document.getElementById("profileMenu");
      const openBtns = [document.getElementById("menuToggle")];
      const closeBtns = [document.getElementById("closeMenu"), overlay];

      const open = () => { menu?.classList.add("open"); overlay?.classList.add("show"); document.body.style.overflow="hidden"; };
      const close = () => { menu?.classList.remove("open"); overlay?.classList.remove("show"); document.body.style.overflow=""; };

      openBtns.forEach(b=>b?.addEventListener("click", open));
      closeBtns.forEach(b=>b?.addEventListener("click", close));
      window.addEventListener("keydown", e => e.key==="Escape" && close());
    })();
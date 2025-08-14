// ====== Constantes API ======
const API_CITAS = "https://retoolapi.dev/2Kfhrs/cita";
const API_VEHICULOS = "https://retoolapi.dev/4XQf28/anadirvehiculo";
const API_USER_BASE = "https://retoolapi.dev/DeaUI0/registro/";

const qs = (s) => document.querySelector(s);
const norm = (v) => (v ?? "").toString().toLowerCase();

// --- Termino de búsqueda y guardia: si no viene, vuelve al index
const urlParams = new URLSearchParams(location.search);
const term = (urlParams.get("q") || "").trim();
if (!term) location.replace("../dashboard/index.html");

// Usuario actual
const userId = localStorage.getItem("userId");

// ====== Sidebar mínima ======
(function sidebar(){
  const overlay = qs("#overlay"), menu = qs("#profileMenu");
  const closeMenu = qs("#closeMenu"), toggle = qs("#menuToggle");
  toggle?.addEventListener("click", () => {
    toggle.classList.add("spin");
    setTimeout(() => toggle.classList.remove("spin"), 600);
    menu?.classList.add("open");
    overlay?.classList.add("show");
  });
  function close(){ menu?.classList.remove("open"); overlay?.classList.remove("show"); }
  closeMenu?.addEventListener("click", close);
  overlay?.addEventListener("click", close);

  // user
  qs("#menuUserId")?.append(document.createTextNode(userId || "Desconocido"));
  if (userId){
    fetch(API_USER_BASE + userId).then(r=>r.json()).then(u=>{
      qs("#menuNombre") && (qs("#menuNombre").textContent = `${u?.nombre??""} ${u?.apellido??""}`.trim() || "Usuario");
      qs("#menuPase") && (qs("#menuPase").textContent = u?.pase || "Cliente");
    }).catch(()=>{});
  }
})();

// Mostrar término en el chip
qs("#termChip") && (qs("#termChip").textContent = term);

// ====== Nodos de resultados ======
const vehWrap   = qs("#vehiculosResultados");
const vehCount  = qs("#vehCount");
const vehEmpty  = qs("#vehEmpty");
const citaWrap  = qs("#citasResultados");
const citasCount= qs("#citasCount");
const citasEmpty= qs("#citasEmpty");

// ====== Render helpers ======
function vehCard(v){
  return `
  <article class="vcard">
    <div class="vimg" style="background-image:url('${v.foto || ""}')"></div>
    <div class="vbody">
      <h3>${(v.marca||"Vehículo")} ${(v.modelo||"")}</h3>
      <p>Color: ${v.color || "—"}</p>
      <p>Placa: ${v.placa || "—"}</p>
      <p>VIN: ${v.vin || "—"}</p>
      <div class="meta">
        <span class="chip">Ingreso ${v.fechaRegistro || "—"}</span>
        <span class="chip">Hora ${v.horaRegistro || "—"}</span>
        <span class="chip">Mantenimiento: ${v.tipoMantenimiento || "—"}</span>
      </div>
    </div>
  </article>`;
}

const fechaCorta = (iso)=>{
  try{
    const d = new Date(`${iso}T00:00:00`);
    const wk = d.toLocaleDateString("es", { weekday:"short" });
    const dd = d.toLocaleDateString("es", { day:"2-digit" });
    return `${wk}, ${dd}`;
  }catch{ return iso; }
};

function citaCard(c){
  return `
  <article class="cita-card">
    <div class="cita-top">
      <span class="cita-chip"><i class="fa-regular fa-calendar"></i> ${fechaCorta(c.fecha)}</span>
    </div>
    <h4 class="cita-title">${c.descripcion || "Sin descripción"}</h4>
    <div class="cita-bottom">
      <span class="cita-hour"><i class="fa-regular fa-clock"></i> ${c.hora}</span>
      <span class="cita-code">#CITA-${c.id}</span>
    </div>
  </article>`;
}

// ====== Buscar y pintar ======
(async function loadResults(){
  const q = norm(term);

  if (!userId){
    vehEmpty?.classList.remove("hidden");
    citasEmpty?.classList.remove("hidden");
    return;
  }

  const [vehRes, citRes] = await Promise.all([
    fetch(API_VEHICULOS).then(r=>r.json()).catch(()=>[]),
    fetch(API_CITAS).then(r=>r.json()).catch(()=>[])
  ]);

  // Filtrar por usuario
  const vehUser = (vehRes||[]).filter(v => String(v.idCliente) === String(userId));
  const citUser = (citRes||[]).filter(c => String(c.idCliente) === String(userId));

  // Filtrar por término
  const vehResult = !q ? vehUser : vehUser.filter(v =>
    [v.marca, v.modelo, v.color, v.placa, v.vin, v.descripcion, v.tipoMantenimiento]
      .some(x => norm(x).includes(q))
  );

  const citResult = !q ? citUser : citUser.filter(c =>
    [c.descripcion, c.estado, c.fecha, c.hora, c.id]
      .some(x => norm(x).includes(q))
  );

  // Pintar Vehículos
  vehCount && (vehCount.textContent = vehResult.length);
  if (vehResult.length){
    vehWrap && (vehWrap.innerHTML = vehResult.map(vehCard).join(""));
    vehEmpty?.classList.add("hidden");
  } else {
    vehWrap && (vehWrap.innerHTML = "");
    vehEmpty?.classList.remove("hidden");
  }

  // Pintar Citas
  citasCount && (citasCount.textContent = citResult.length);
  if (citResult.length){
    citaWrap && (citaWrap.innerHTML = citResult.map(citaCard).join(""));
    citasEmpty?.classList.add("hidden");
  } else {
    citaWrap && (citaWrap.innerHTML = "");
    citasEmpty?.classList.remove("hidden");
  }
})();

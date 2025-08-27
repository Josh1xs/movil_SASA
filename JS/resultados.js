const API_CITAS     = "/api/citas";       
const API_VEHICULOS = "/api/vehiculos";   
const API_ESTADOS   = "/api/estados";     
const API_CLIENTE   = "/api/clientes/";   
const qs   = s => document.querySelector(s);
const norm = v => (v ?? "").toString().toLowerCase();


const params = new URLSearchParams(location.search);
const term   = (params.get("q") || "").trim();
if (!term) location.replace("../dashboard/index.html");


const userId = localStorage.getItem("userId");


(function sidebar(){
  const overlay = qs("#overlay"), menu = qs("#profileMenu");
  const closeBtn = qs("#closeMenu"), toggle = qs("#menuToggle");
  function open(){ menu?.classList.add("open"); overlay?.classList.add("show"); }
  function close(){ menu?.classList.remove("open"); overlay?.classList.remove("show"); }
  toggle?.addEventListener("click", open);
  closeBtn?.addEventListener("click", close);
  overlay?.addEventListener("click", close);

  qs("#menuUserId")?.append(document.createTextNode(userId || "Desconocido"));
  if (userId){
    fetch(API_CLIENTE + userId).then(r=>r.json()).then(u=>{
      qs("#menuNombre") && (qs("#menuNombre").textContent = `${u?.NOMBRE ?? ""} ${u?.APELLIDO ?? ""}`.trim() || "Usuario");
      qs("#menuPase")   && (qs("#menuPase").textContent   = "Cliente");
    }).catch(()=>{});
  }
})();


qs("#termChip") && (qs("#termChip").textContent = term);


const vehWrap   = qs("#vehiculosResultados");
const vehCount  = qs("#vehCount");
const vehEmpty  = qs("#vehEmpty");
const citaWrap  = qs("#citasResultados");
const citasCount= qs("#citasCount");
const citasEmpty= qs("#citasEmpty");


const fechaCorta = (iso) => {
  if (!iso) return "—";
  try {
    const d  = new Date(iso); 
    const wk = d.toLocaleDateString("es", { weekday:"short" });
    const dm = d.toLocaleDateString("es", { day:"2-digit", month:"short" });
    return `${wk}, ${dm}`;
  } catch { return iso; }
};


let ESTADOS = {};
async function loadEstados(){
  try {
    const list = await fetch(API_ESTADOS).then(r=>r.json());
    ESTADOS = Object.fromEntries(list.map(e => [String(e.idEstado), e.nombre]));
  } catch { ESTADOS = {}; }
}


function vehCard(v){
  const estadoTxt = ESTADOS[String(v.idEstado)] || "—";
  return `
  <article class="vcard">
    <div class="vbody">
      <h3>${(v.marca||"Vehículo")} ${(v.modelo||"")}</h3>
      <p>Año: ${v.anio ?? "—"}</p>
      <p>Placa: ${v.placa || "—"}</p>
      <p>VIN: ${v.vin || "—"}</p>
      <div class="meta">
        <span class="chip">Estado: ${estadoTxt}</span>
      </div>
    </div>
  </article>`;
}

function citaCard(c){
  const fecha = fechaCorta(c.fecha);
  const hora  = c.hora || "—";
  const code  = c.idCita ? `#CITA-${c.idCita}` : "—";
  return `
  <article class="cita-card">
    <div class="cita-top">
      <span class="cita-chip"><i class="fa-regular fa-calendar"></i> ${fecha}</span>
    </div>
    <h4 class="cita-title">${c.estado || "Pendiente"}</h4>
    <div class="cita-bottom">
      <span class="cita-hour"><i class="fa-regular fa-clock"></i> ${hora}</span>
      <span class="cita-code">${code}</span>
    </div>
  </article>`;
}


(async function loadResults(){
  if (!userId){
    vehEmpty?.classList.remove("hidden");
    citasEmpty?.classList.remove("hidden");
    return;
  }

  await loadEstados();

  const q = norm(term);

  const [vehRes, citRes] = await Promise.all([
    fetch(`${API_VEHICULOS}?idCliente=${encodeURIComponent(userId)}`).then(r=>r.json()).catch(()=>[]),
    fetch(`${API_CITAS}?idCliente=${encodeURIComponent(userId)}`).then(r=>r.json()).catch(()=>[])
  ]);

  const vehResult = !q ? vehRes : vehRes.filter(v =>
    [v.marca, v.modelo, v.anio, v.placa, v.vin].some(x => norm(x).includes(q))
  );

  const citResult = !q ? citRes : citRes.filter(c =>
    [c.estado, c.fecha, c.hora, c.idCita].some(x => norm(x).includes(q))
  );

 
  vehCount && (vehCount.textContent = vehResult.length);
  if (vehResult.length){
    vehWrap && (vehWrap.innerHTML = vehResult.map(vehCard).join(""));
    vehEmpty?.classList.add("hidden");
  } else {
    vehWrap && (vehWrap.innerHTML = "");
    vehEmpty?.classList.remove("hidden");
  }

  
  citasCount && (citasCount.textContent = citResult.length);
  if (citResult.length){
    citaWrap && (citaWrap.innerHTML = citResult.map(citaCard).join(""));
    citasEmpty?.classList.add("hidden");
  } else {
    citaWrap && (citaWrap.innerHTML = "");
    citasEmpty?.classList.remove("hidden");
  }
})();

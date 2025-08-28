const qs   = s => document.querySelector(s);
const norm = v => (v ?? "").toString().toLowerCase();

const params = new URLSearchParams(location.search);
const term   = (params.get("q") || "").trim();
if (!term) location.replace("../dashboard/index.html");

qs("#termChip") && (qs("#termChip").textContent = term);

const vehWrap   = qs("#vehiculosResultados");
const vehCount  = qs("#vehCount");
const vehEmpty  = qs("#vehEmpty");
const citaWrap  = qs("#citasResultados");
const citasCount= qs("#citasCount");
const citasEmpty= qs("#citasEmpty");

// ✅ Datos desde localStorage
const vehRes = JSON.parse(localStorage.getItem("vehiculos") || "[]");
const citRes = JSON.parse(localStorage.getItem("citas") || "[]");

const q = norm(term);

const vehResult = !q ? vehRes : vehRes.filter(v =>
  [v.marca, v.modelo, v.anio, v.placa, v.vin].some(x => norm(x).includes(q))
);

const citResult = !q ? citRes : citRes.filter(c =>
  [c.estado, c.fecha, c.hora, c.id].some(x => norm(x).includes(q))
);

function vehCard(v){
  return `
  <article class="vcard">
    <div class="vbody">
      <h3>${(v.marca||"Vehículo")} ${(v.modelo||"")}</h3>
      <p>Año: ${v.anio ?? "—"}</p>
      <p>Placa: ${v.placa || "—"}</p>
      <p>VIN: ${v.vin || "—"}</p>
    </div>
  </article>`;
}

function citaCard(c){
  return `
  <article class="cita-card">
    <div class="cita-top">
      <span class="cita-chip"><i class="fa-regular fa-calendar"></i> ${c.fecha}</span>
    </div>
    <h4 class="cita-title">${c.estado || "Pendiente"}</h4>
    <div class="cita-bottom">
      <span class="cita-hour"><i class="fa-regular fa-clock"></i> ${c.hora||"—"}</span>
      <span class="cita-code">#CITA-${c.id}</span>
    </div>
  </article>`;
}

vehCount && (vehCount.textContent = vehResult.length);
if (vehResult.length){
  vehWrap.innerHTML = vehResult.map(vehCard).join("");
  vehEmpty.classList.add("hidden");
} else {
  vehWrap.innerHTML = "";
  vehEmpty.classList.remove("hidden");
}

citasCount && (citasCount.textContent = citResult.length);
if (citResult.length){
  citaWrap.innerHTML = citResult.map(citaCard).join("");
  citasEmpty.classList.add("hidden");
} else {
  citaWrap.innerHTML = "";
  citasEmpty.classList.remove("hidden");
}

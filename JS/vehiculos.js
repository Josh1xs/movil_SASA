document.addEventListener("DOMContentLoaded", async () => {
  const qs = s => document.querySelector(s);
  const userId = localStorage.getItem("userId");
  const API_VEHICULOS = "/api/vehiculos";
  const API_ESTADOS   = "/api/estados";

  const list = qs("#vehiculosLista");

  let ESTADOS = {};
  try {
    const estados = await fetch(API_ESTADOS).then(r=>r.json());
    ESTADOS = Object.fromEntries(estados.map(e => [String(e.idEstado), e.nombre]));
  } catch { ESTADOS = {}; }

  function card(v){
    const estadoTxt = ESTADOS[String(v.idEstado)] || "—";
    return `
      <div class="vcard">
        <div class="vbody">
          <h3>${v.marca} ${v.modelo}</h3>
          <p>Año: ${v.anio ?? "—"}</p>
          <p>Placa: ${v.placa || "—"} · VIN: ${v.vin || "—"}</p>
          <div class="meta"><span class="chip">Estado: ${estadoTxt}</span></div>
        </div>
      </div>`;
  }

  async function load(){
    if(!userId){ list.innerHTML = "<div class='empty'>Inicia sesión.</div>"; return; }
    try{
      const data = await fetch(`${API_VEHICULOS}?idCliente=${encodeURIComponent(userId)}`).then(r=>r.json());
      if(!data.length){ list.innerHTML = "<div class='empty'>Sin vehículos.</div>"; return; }
      list.innerHTML = data.map(card).join("");
    }catch{
      list.innerHTML = "<div class='empty'>Error cargando vehículos.</div>";
    }
  }
  load();
});

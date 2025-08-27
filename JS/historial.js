document.addEventListener("DOMContentLoaded", () => {
  const $  = (s, el=document) => el.querySelector(s);
  const $$ = (s, el=document) => [...el.querySelectorAll(s)];


  const overlay = $("#overlay");
  const profileMenu = $("#profileMenu");
  const menuToggle = $("#menuToggle");
  const closeMenu = $("#closeMenu");
  function openMenu(){
    profileMenu?.classList.add("open");
    profileMenu?.setAttribute("aria-hidden","false");
    overlay?.classList.add("show")
    overlay?.setAttribute("aria-hidden","false");
    document.body.style.overflow = "hidden";
  }
  function closeSidebar(){
    profileMenu?.classList.remove("open");
    profileMenu?.setAttribute("aria-hidden","true");
    overlay?.classList.remove("show");
    overlay?.setAttribute("aria-hidden","true");
    document.body.style.overflow = "";
  }
  menuToggle?.addEventListener("click", () => {
    menuToggle.classList.add("spin");
    setTimeout(()=>menuToggle.classList.remove("spin"), 600);
    openMenu();
  });
  closeMenu?.addEventListener("click", closeSidebar);
  overlay?.addEventListener("click", closeSidebar);
  window.addEventListener("keydown", e => { if(e.key==="Escape") closeSidebar(); });


  const userId = localStorage.getItem("userId");
  $("#menuUserId").textContent = userId || "Desconocido";
  if (userId){
    fetch(`https://retoolapi.dev/DeaUI0/registro/${userId}`)
      .then(r=>r.json()).then(u=>{
        $("#menuNombre").textContent = `${u?.nombre??""} ${u?.apellido??""}`.trim() || "Usuario";
        $("#menuPase").textContent   = u?.pase || "Cliente";
      }).catch(()=>{});
  }

  const API_VEHICULOS = "https://retoolapi.dev/4XQf28/anadirvehiculo";
  const API_HISTORIAL = "https://retoolapi.dev/YOUR_ID/historial"; 
  const selVehiculo = $("#vehiculoSelect");
  const lista = $("#historialLista");

  let vehiculosUser = [];
  let historialUser = [];
  let filtroVehiculo = ""; 

  const money = n => Number(n||0).toLocaleString("en-US",{style:"currency",currency:"USD"});
  const fmt = s => {
    if(!s) return "—";
    const d = new Date(s);
    return isNaN(d) ? s : d.toLocaleDateString("es", { year:"numeric", month:"short", day:"2-digit" });
  };
  const daysDiff = (ini, fin) => {
    const a = new Date(ini), b = fin ? new Date(fin) : new Date();
    if(isNaN(a) || isNaN(b)) return null;
    const diff = Math.round((b-a) / 86400000);
    return diff < 0 ? null : diff;
  };

  function render(){
    lista.innerHTML = "";

    const items = historialUser
      .filter(h => !filtroVehiculo || String(h.idVehiculo) === String(filtroVehiculo))
      .sort((a,b) => new Date(b.fechaIngreso||0) - new Date(a.fechaIngreso||0));

    if(!items.length){
      lista.innerHTML = `<div class="card"><p class="obs">No hay registros de historial para el filtro seleccionado.</p></div>`;
      return;
    }

    const frag = document.createDocumentFragment();

    items.forEach(h => {
      const card = document.createElement("article");
      card.className = "card hcard";

 
      const head = document.createElement("div");
      head.className = "hhead";

      const v = vehiculosUser.find(v => String(v.id) === String(h.idVehiculo));
      const vehTitle = document.createElement("h3");
      vehTitle.className = "hveh";
      vehTitle.textContent = v
        ? `${v.marca||"Vehículo"} ${v.modelo||""} ${v.placa?("· "+v.placa):""}`.trim()
        : `Vehículo #${h.idVehiculo||"—"}`;
      head.appendChild(vehTitle);

      const chips = document.createElement("div");
      chips.className = "chips";
      const ingreso = fmt(h.fechaIngreso);
      const salida  = fmt(h.fechaSalida);
      const days = daysDiff(h.fechaIngreso, h.fechaSalida);
      const chip1 = document.createElement("span");
      chip1.className = "chip";
      chip1.textContent = `Ingreso: ${ingreso}`;
      const chip2 = document.createElement("span");
      chip2.className = "chip";
      chip2.textContent = `Salida: ${salida}`;
      chips.appendChild(chip1);
      chips.appendChild(chip2);
      if(days !== null){
        const chip3 = document.createElement("span");
        chip3.className = "chip";
        chip3.textContent = (h.fechaSalida ? `${days} día${days===1?"":"s"} en taller` : `${days} día${days===1?"":"s"} (en curso)`);
        chips.appendChild(chip3);
      }
      head.appendChild(chips);
      card.appendChild(head);

     
      const grid = document.createElement("div");
      grid.className = "grid";
      grid.innerHTML = `
        <div class="row"><span class="k">Fecha ingreso</span><span class="v">${ingreso}</span></div>
        <div class="row"><span class="k">Fecha salida</span><span class="v">${salida}</span></div>
      `;
      card.appendChild(grid);


      const work = document.createElement("div");
      work.className = "work";
      work.textContent = `Trabajo: ${h.trabajo || "—"}`;
      card.appendChild(work);


      const obs = document.createElement("p");
      obs.className = "obs";
      obs.textContent = h.observaciones || "Sin observaciones.";
      card.appendChild(obs);

      frag.appendChild(card);
    });

    lista.appendChild(frag);
  }


  function cargarVehiculos(){
    if(!userId) return Promise.resolve([]);
    return fetch(API_VEHICULOS, { cache:"no-store" })
      .then(r=>r.json())
      .then(data => {
        vehiculosUser = (Array.isArray(data)?data:[])
          .filter(v => String(v.idCliente) === String(userId));

        selVehiculo.innerHTML = `<option value="">Todos</option>` + vehiculosUser.map(v => {
          const txt = `${v.marca||"Vehículo"} ${v.modelo||""} ${v.placa?("· "+v.placa):""}`.trim();
          return `<option value="${v.id}">${txt}</option>`;
        }).join("");
      })
      .catch(()=>{ vehiculosUser = []; });
  }


  function cargarHistorial(){
    if(!userId){
      historialUser = [];
      render();
      return;
    }
    fetch(API_HISTORIAL, { cache:"no-store" })
      .then(r=>r.json())
      .then(data => {

        historialUser = (Array.isArray(data)?data:[])
          .filter(h => String(h.idCliente) === String(userId));
        render();
      })
      .catch(err => {
        console.error("Error cargando historial:", err);
        historialUser = [];
        render();
      });
  }


  selVehiculo.addEventListener("change", () => {
    filtroVehiculo = selVehiculo.value || "";
    render();
  });


  Promise.resolve()
    .then(cargarVehiculos)
    .then(cargarHistorial);
});

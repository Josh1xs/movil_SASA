const API_VEHICULOS = "https://retoolapi.dev/4XQf28/anadirvehiculo";
const API_USER_BASE = "https://retoolapi.dev/DeaUI0/registro/";
const API_CITAS = "https://retoolapi.dev/2Kfhrs/cita"; // para inferir tipo de mantenimiento

const qs = s => document.querySelector(s);
const lista = qs("#vehiculosLista");

// Helpers
const toDate = (d, t="00:00") => new Date(`${d}T${t}:00`);
const fmt = (d) => new Date(d).toLocaleDateString();
const pad = (n)=> String(n).padStart(2,"0");

document.addEventListener("DOMContentLoaded", () => {
  initSidebar();
  loadUser();
  obtenerVehiculos();
});

// Sidebar + rueda giratoria
function initSidebar(){
  const overlay = qs("#overlay");
  const profileMenu = qs("#profileMenu");
  const closeMenu = qs("#closeMenu");
  const menuToggle = qs("#menuToggle");
  const menuToggleBottom = qs("#menuToggleBottom");

  [menuToggle, menuToggleBottom].forEach(btn=>{
    if(!btn) return;
    btn.addEventListener("click", ()=>{
      btn.classList.add("spin"); setTimeout(()=>btn.classList.remove("spin"),600);
      profileMenu.classList.add("open"); overlay.classList.add("show");
    });
  });
  function cerrar(){ profileMenu.classList.remove("open"); overlay.classList.remove("show"); }
  closeMenu?.addEventListener("click", cerrar);
  overlay?.addEventListener("click", cerrar);

  const logoutBtn = qs("#logoutBtn");
  if (logoutBtn){
    logoutBtn.addEventListener("click",(e)=>{
      e.preventDefault();
      ["userId","nombre","name","email","pase","authToken","token","refreshToken"].forEach(k=>localStorage.removeItem(k));
      sessionStorage.clear(); document.cookie="authToken=; Max-Age=0; path=/";
      location.replace(logoutBtn.getAttribute("href") || "../Authenticator/login.html");
    });
  }
}

async function loadUser(){
  const userId = localStorage.getItem("userId");
  qs("#menuUserId").textContent = userId || "Desconocido";
  if (!userId) return;
  try{
    const u = await fetch(API_USER_BASE+userId).then(r=>r.json());
    const nombre = `${u?.nombre??""} ${u?.apellido??""}`.trim() || "Usuario";
    qs("#menuNombre").textContent = nombre;
    qs("#menuPase").textContent = u?.pase || "Cliente";
  }catch{}
}

async function obtenerVehiculos() {
  const userId = localStorage.getItem("userId");
  if (!userId) return;

  try {
    const [vehRes, citaRes] = await Promise.all([
      fetch(API_VEHICULOS),
      fetch(API_CITAS)
    ]);
    const allVeh = await vehRes.json();
    const allCitas = await citaRes.json();

    const misVehiculos = (Array.isArray(allVeh)?allVeh:[]).filter(v => String(v.idCliente) === String(userId));
    const misCitas = (Array.isArray(allCitas)?allCitas:[]).filter(c => String(c.idCliente) === String(userId));

    lista.innerHTML = "";

    if (!misVehiculos.length) {
      lista.innerHTML = `
        <div class="empty">
          No tienes vehículos registrados.<br>
          <a href="AñadirVehiculo.html"><i class="fa-solid fa-plus"></i> Añadir vehículo</a>
        </div>`;
      return;
    }

    // índice: última cita por vehículo (para tipo mantenimiento)
    const lastByVehiculo = {};
    misCitas.forEach(c=>{
      const vid = String(c.idVehiculo || "");
      if (!vid) return;
      const when = toDate(c.fecha || "", (c.hora || "00:00").slice(0,5));
      if (!lastByVehiculo[vid] || when > lastByVehiculo[vid].when) {
        lastByVehiculo[vid] = { when, estado: c.estado || "" };
      }
    });

    const frag = document.createDocumentFragment();

    misVehiculos.forEach(v => {
      const t = document.createElement("div");
      t.className = "vcard";

      // Imagen placeholder (si luego agregas foto: v.foto)
      const img = document.createElement("div");
      img.className = "vimg";
      if (v.foto || v.cover) img.style.backgroundImage = `url('${v.foto || v.cover}')`;

      const body = document.createElement("div");
      body.className = "vbody";
      const title = document.createElement("h3");
      title.textContent = `${v.marca || "Vehículo"} ${v.modelo || ""}`.trim();
      const p1 = document.createElement("p"); p1.textContent = `Color: ${v.color || "—"}`;
      const p2 = document.createElement("p"); p2.textContent = `Placa: ${v.placa || "—"}`;
      const p3 = document.createElement("p"); p3.textContent = `VIN: ${v.vin || "—"}`;
      const desc = document.createElement("p"); desc.className = "desc"; desc.textContent = v.descripcion ? v.descripcion : "—";

      // Chips meta
      const meta = document.createElement("div"); meta.className = "meta";
      const fechaChip = document.createElement("div"); fechaChip.className = "chip"; fechaChip.textContent = `Ingreso ${v.fechaRegistro || "—"}`;
      const horaChip  = document.createElement("div"); horaChip.className = "chip"; horaChip.textContent  = `Hora ${v.horaRegistro || "—"}`;

      // tipo mantenimiento desde última cita
      const last = lastByVehiculo[String(v.id)];
      const tipoText = last?.estado || v.tipoMantenimiento || "—";
      const tipoChip = document.createElement("div");
      tipoChip.className = "chip " + (/preventivo/i.test(tipoText) ? "green" : /correctivo/i.test(tipoText) ? "red" : "");
      tipoChip.textContent = `Mantenimiento: ${tipoText}`;

      meta.append(fechaChip, horaChip, tipoChip);

      body.append(title, p1, p2, p3, desc, meta);

      // Acciones
      const actions = document.createElement("div");
      actions.className = "actions";
      const btnEdit = document.createElement("button");
      btnEdit.className = "btn-icon edit"; btnEdit.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>'; btnEdit.title="Editar";
      btnEdit.addEventListener("click", ()=>editarVehiculo(v.id));
      const btnDel  = document.createElement("button");
      btnDel.className = "btn-icon delete"; btnDel.innerHTML = '<i class="fa-solid fa-trash"></i>'; btnDel.title="Eliminar";
      btnDel.addEventListener("click", ()=>eliminarVehiculo(v.id));

      actions.append(btnEdit, btnDel);

      t.append(img, body, actions);
      frag.appendChild(t);
    });

    lista.appendChild(frag);

  } catch (error) {
    console.error("Error al obtener vehículos:", error);
    Swal.fire("Error", "No se pudieron cargar los vehículos", "error");
  }
}

function editarVehiculo(id) {
  localStorage.setItem("vehiculoEditarId", id);
  location.href = "AñadirVehiculo.html";
}

async function eliminarVehiculo(id) {
  const confirmacion = await Swal.fire({
    title: "¿Eliminar vehículo?",
    text: "Esta acción no se puede deshacer.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#d33",
    cancelButtonColor: "#aaa"
  });

  if (!confirmacion.isConfirmed) return;

  try {
    const res = await fetch(`${API_VEHICULOS}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("fail");
    Swal.fire({icon:"success", title:"Eliminado", text:"Vehículo eliminado correctamente", confirmButtonColor:"#28a745"});
    obtenerVehiculos();
  } catch (error) {
    console.error("Error al eliminar:", error);
    Swal.fire("Error", "No se pudo eliminar el vehículo", "error");
  }
}

const addLink = document.getElementById("addLink");
addLink?.addEventListener("click", () => {
  localStorage.removeItem("vehiculoEditarId"); // asegurar modo "nuevo"
});

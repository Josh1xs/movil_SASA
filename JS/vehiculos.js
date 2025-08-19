const API_VEHICULOS = "https://retoolapi.dev/4XQf28/anadirvehiculo";
const API_USER_BASE = "https://retoolapi.dev/DeaUI0/registro/";

const qs = s => document.querySelector(s);
const lista = qs("#vehiculosLista");

document.addEventListener("DOMContentLoaded", () => {
  initSidebar();
  loadUser();
  obtenerVehiculos();
});

// Sidebar + logout
function initSidebar() {
  const overlay = qs("#overlay");
  const profileMenu = qs("#profileMenu");
  const closeMenu = qs("#closeMenu");
  const menuToggle = qs("#menuToggle");

  menuToggle?.addEventListener("click", () => {
    menuToggle.classList.add("spin");
    setTimeout(() => menuToggle.classList.remove("spin"), 600);
    profileMenu.classList.add("open");
    overlay.classList.add("show");
  });
  function cerrar() {
    profileMenu.classList.remove("open");
    overlay.classList.remove("show");
  }
  closeMenu?.addEventListener("click", cerrar);
  overlay?.addEventListener("click", cerrar);

  const logoutBtn = qs("#logoutBtn");
  logoutBtn?.addEventListener("click", e => {
    e.preventDefault();
    ["userId", "nombre", "name", "email", "pase", "authToken"].forEach(k =>
      localStorage.removeItem(k)
    );
    sessionStorage.clear();
    document.cookie = "authToken=; Max-Age=0; path=/";
    location.replace(logoutBtn.getAttribute("href") || "../Authenticator/login.html");
  });
}

// Cargar info usuario
async function loadUser() {
  const userId = localStorage.getItem("userId");
  qs("#menuUserId").textContent = userId || "Desconocido";
  if (!userId) return;
  try {
    const u = await fetch(API_USER_BASE + userId).then(r => r.json());
    const nombre = `${u?.nombre ?? ""} ${u?.apellido ?? ""}`.trim() || "Usuario";
    qs("#menuNombre").textContent = nombre;
    qs("#menuPase").textContent = u?.pase || "Cliente";
  } catch {}
}

// Obtener vehículos
async function obtenerVehiculos() {
  const userId = localStorage.getItem("userId");
  if (!userId) return;

  try {
    const res = await fetch(API_VEHICULOS);
    if (!res.ok) throw new Error("Error al obtener vehículos");

    const allVeh = await res.json();
    const misVehiculos = (Array.isArray(allVeh) ? allVeh : []).filter(
      v => String(v.idCliente) === String(userId)
    );

    lista.innerHTML = "";

    if (!misVehiculos.length) {
      lista.innerHTML = `
        <div class="empty">
          No tienes vehículos registrados.<br>
          <a href="AñadirVehiculo.html"><i class="fa-solid fa-plus"></i> Añadir vehículo</a>
        </div>`;
      return;
    }

    const frag = document.createDocumentFragment();

    misVehiculos.forEach(v => {
      const t = document.createElement("div");
      t.className = "vcard";

      const body = document.createElement("div");
      body.className = "vbody";

      const title = document.createElement("h3");
      title.textContent = `${v.marca || "Vehículo"} ${v.modelo || ""}`.trim();

      const pPlaca = document.createElement("p");
      pPlaca.textContent = `Placa: ${v.placa || "—"}`;

      const pVin = document.createElement("p");
      pVin.textContent = `VIN: ${v.vin || "—"}`;

      body.append(title, pPlaca, pVin);

      // Botones
      const actions = document.createElement("div");
      actions.className = "actions";

      const btnEdit = document.createElement("button");
      btnEdit.className = "btn-icon edit";
      btnEdit.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
      btnEdit.title = "Editar";
      btnEdit.addEventListener("click", () => editarVehiculo(v.id));

      const btnDel = document.createElement("button");
      btnDel.className = "btn-icon delete";
      btnDel.innerHTML = '<i class="fa-solid fa-trash"></i>';
      btnDel.title = "Eliminar";
      btnDel.addEventListener("click", () => eliminarVehiculo(v.id));

      actions.append(btnEdit, btnDel);

      t.append(body, actions);
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
    Swal.fire({
      icon: "success",
      title: "Eliminado",
      text: "Vehículo eliminado correctamente",
      confirmButtonColor: "#28a745"
    });
    obtenerVehiculos();
  } catch (error) {
    console.error("Error al eliminar:", error);
    Swal.fire("Error", "No se pudo eliminar el vehículo", "error");
  }
}

// Si presiona "Añadir", limpiar modo edición
const addLink = document.getElementById("addLink");
addLink?.addEventListener("click", () => {
  localStorage.removeItem("vehiculoEditarId");
});

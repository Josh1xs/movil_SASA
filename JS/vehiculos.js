const API_URL = "https://retoolapi.dev/4XQf28/anadirvehiculo";

async function obtenerVehiculos() {
  const userId = localStorage.getItem("userId");
  if (!userId) return;

  try {
    const res = await fetch(API_URL);
    const vehiculos = await res.json();

    const lista = document.getElementById("vehiculosLista");
    lista.innerHTML = "";

    const misVehiculos = vehiculos.filter(v => v.idCliente == userId);

    if (misVehiculos.length === 0) {
      lista.innerHTML = `<p class="text-muted">No tienes vehículos registrados.</p>`;
      return;
    }

    misVehiculos.forEach(v => {
      const col = document.createElement("div");
      col.className = "col-6"; // 2 tarjetas por fila

      col.innerHTML = `
        <div class="vehiculo-card">
          <div>
            <strong>${v.marca || "Sin marca"} ${v.modelo || ""}</strong><br>
            ${v.color || ""}<br>
            ${v.placa || ""}
          </div>
          <div class="acciones mt-2 d-flex justify-content-end gap-2">
            <i class="fas fa-pen" title="Editar" onclick="editarVehiculo(${v.id})"></i>
            <i class="fas fa-trash" title="Eliminar" onclick="eliminarVehiculo(${v.id})"></i>
          </div>
        </div>
      `;

      lista.appendChild(col);
    });
  } catch (error) {
    console.error("Error al obtener vehículos:", error);
    Swal.fire("Error", "No se pudieron cargar los vehículos", "error");
  }
}

function editarVehiculo(id) {
  localStorage.setItem("vehiculoEditarId", id);
  window.location.href = "AñadirVehiculo.html";
}

async function eliminarVehiculo(id) {
  const confirmacion = await Swal.fire({
    title: "¿Eliminar?",
    text: "Esta acción no se puede deshacer",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  });

  if (confirmacion.isConfirmed) {
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (res.ok) {
        Swal.fire("Eliminado", "Vehículo eliminado correctamente", "success");
        obtenerVehiculos();
      } else {
        throw new Error("No se pudo eliminar");
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
      Swal.fire("Error", "No se pudo eliminar el vehículo", "error");
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  obtenerVehiculos();

  // Menú Pokémon
  const menuToggle = document.getElementById("menuToggle");
  const profileMenu = document.getElementById("profileMenu");
  const overlay = document.getElementById("overlay");
  const closeMenu = document.getElementById("closeMenu");

  function cerrarMenu() {
    profileMenu.classList.remove("open");
    overlay.classList.remove("show");
  }

  menuToggle?.addEventListener("click", () => {
    profileMenu.classList.add("open");
    overlay.classList.add("show");
  });

  closeMenu?.addEventListener("click", cerrarMenu);
  overlay?.addEventListener("click", cerrarMenu);

  // Datos del usuario
  const userId = localStorage.getItem("userId");
  const apiUrl = `https://retoolapi.dev/DeaUI0/registro/${userId}`;

  const userIdElement = document.getElementById("menuUserId");
  const nombreElement = document.getElementById("menuNombre");
  const paseElement = document.getElementById("menuPase");

  if (userIdElement) userIdElement.textContent = userId || "Desconocido";

  if (userId) {
    fetch(apiUrl)
      .then(res => res.json())
      .then(user => {
        nombreElement.textContent = `${user.nombre} ${user.apellido}`;
        paseElement.textContent = user.pase || "Cliente";
      })
      .catch(err => console.error("Error cargando usuario:", err));
  }
});

const API_URL = "https://retoolapi.dev/uD4ozV/vehiculos";

// Obtener y mostrar los vehículos
async function obtenerVehiculos() {
  try {
    const res = await fetch(API_URL);
    const vehiculos = await res.json();

    const lista = document.getElementById("vehiculosLista");
    lista.innerHTML = "";

    vehiculos.forEach(v => {
      const card = document.createElement("div");
      card.className = "vehiculo-card d-flex justify-content-between align-items-center p-2 bg-white rounded shadow-sm";

      card.innerHTML = `
        <div>
          <strong>${v.marca} ${v.modelo || ""}</strong><br>
          ${v.anio}<br>
          ${v.placa}
        </div>
        <div>
          <i class="fas fa-pen text-dark me-2" style="cursor:pointer;" onclick="editarVehiculo(${v.id})"></i>
          <i class="fas fa-trash text-dark" style="cursor:pointer;" onclick="eliminarVehiculo(${v.id})"></i>
        </div>
      `;
      lista.appendChild(card);
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
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

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

document.addEventListener("DOMContentLoaded", obtenerVehiculos);

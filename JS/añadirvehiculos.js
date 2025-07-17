const API_URL = "https://retoolapi.dev/uD4ozV/vehiculos";
const form = document.getElementById("formVehiculo");
const editarId = localStorage.getItem("vehiculoEditarId");

document.addEventListener("DOMContentLoaded", async () => {
  if (editarId) {
    try {
      const res = await fetch(`${API_URL}/${editarId}`);
      const data = await res.json();

      // Rellenar campos
      document.getElementById("marca").value = data.marca || "";
      document.getElementById("modelo").value = data.modelo || "";
      document.getElementById("anio").value = data.anio || "";
      document.getElementById("placa").value = data.placa || "";
    } catch (err) {
      console.error("Error cargando datos para editar:", err);
      Swal.fire("Error", "No se pudieron cargar los datos", "error");
    }
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const marca = document.getElementById("marca").value.trim();
  const modelo = document.getElementById("modelo").value.trim();
  const anio = document.getElementById("anio").value.trim();
  const placa = document.getElementById("placa").value.trim();

  if (!marca || !modelo || !anio || !placa) {
    Swal.fire("Error", "Todos los campos son obligatorios", "error");
    return;
  }

  const datos = { marca, modelo, anio, placa };

  try {
    if (editarId) {
      await fetch(`${API_URL}/${editarId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });
      localStorage.removeItem("vehiculoEditarId");
      Swal.fire("Actualizado", "Vehículo editado correctamente", "success").then(() => {
        window.location.href = "Vehiculos.html";
      });
    } else {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });
      Swal.fire("Guardado", "Vehículo agregado correctamente", "success").then(() => {
        window.location.href = "Vehiculos.html";
      });
    }
  } catch (err) {
    console.error("Error al guardar:", err);
    Swal.fire("Error", "Hubo un problema al guardar los datos", "error");
  }
});
